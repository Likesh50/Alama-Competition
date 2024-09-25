import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import XLSX for Excel export
import './Database_List.css';
import { useReactToPrint } from 'react-to-print';
import PrintTableComponent from './PrintTableComponent';
import { HashLoader } from 'react-spinners';
// Natural sorting function
const naturalSort = (a, b) => {
  const splitA = a.split('-').map(Number);
  const splitB = b.split('-').map(Number);
  for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
    if (splitA[i] === splitB[i]) continue;
    return (splitA[i] || 0) - (splitB[i] || 0);
  }
  return 0;
};

// Preprocess data to remove duplicates and apply natural sorting
const preprocessData = (data) => {
  const allData = [];
  data.forEach(record => {
    if (record.seat) {  // Ensure we're using the correct column name
      const existingRecord = allData.find(item => item.seat === record.seat);
      if (!existingRecord) {
        allData.push(record);
      }
    }
  });
  // Sort data by the 'seat' field using natural sort
  allData.sort((a, b) => naturalSort(a.seat, b.seat));
  return allData;
};

const Database_List = () => {
  const [tableData, setTableData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [uniqueValues, setUniqueValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const printRef = useRef();

  // Fetch data from the backend and compute the "Level" column
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/data2');
        console.log('Fetched data:', res.data);

        // Preprocess data to remove duplicates and apply natural sorting
        const processedData = preprocessData(res.data);

        // Compute the new "Pro + Level" column
        const dataWithLevel = processedData.map((row) => ({
          ...row,
          "Pro + Level": (row.pro || 0) + " " + (row.level || 0),
        }));

        setTableData(dataWithLevel);
        setFilteredData(dataWithLevel); // Initially, all data is displayed
      } catch (err) {
        console.error('Error fetching data:', err);
      }
      finally{
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle column selection
  const handleColumnSelect = (e) => {
    const column = e.target.value;
    setSelectedColumn(column);

    // Get unique values from the selected column
    const uniqueVals = [...new Set(tableData.map((row) => row[column]))];
    setUniqueValues(uniqueVals);
    setSelectedValue(''); // Reset the selected value when a new column is chosen
    setFilteredData(tableData); // Reset the table data when column changes
  };

  // Handle value selection
  const handleValueSelect = (e) => {
    const value = e.target.value;
    setSelectedValue(value);

    // Filter table data based on the selected column and value
    const filtered = tableData.filter((row) => String(row[selectedColumn]) === value);
    setFilteredData(filtered);
  };

  // Export table data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData); // Convert filtered data to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TableData'); // Append the worksheet
    XLSX.writeFile(workbook, 'TableData.xlsx'); // Trigger download as 'TableData.xlsx'
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current, // Print only the component wrapped with printRef
    documentTitle: 'Custom Table Report',
  });

  return (
    <div className="container">
      <h2>Data Table</h2>

      <div className="dropdown-container">
        <div>
          <label htmlFor="columnSelect">Select Column:</label>
          <select
            id="columnSelect"
            value={selectedColumn}
            onChange={handleColumnSelect}
          >
            <option value="">-- Select a column --</option>
            {tableData.length > 0 &&
              Object.keys(tableData[0]).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
        </div>

        {selectedColumn && (
          <div>
            <label htmlFor="valueSelect">Select Value:</label>
            <select
              id="valueSelect"
              value={selectedValue}
              onChange={handleValueSelect}
            >
              <option value="">-- Select a value --</option>
              {uniqueValues.map((value, idx) => (
                <option key={idx} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div >
          <button className="export-btn" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="print-btn" style={{gap:"300px"}}   onClick={handlePrint}>
              Print Table
          </button>
      </div>

      <div style={{ display: 'none' }}>
        <PrintTableComponent ref={printRef} filteredData={filteredData} />
      </div>

      <table className="table-container" border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            {filteredData.length > 0 &&
              Object.keys(filteredData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx} style={{color:"#FFA500"}}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        }}>
          <HashLoader color="#3498db" loading={loading} size={60} />
        </div>
      )}
    </div>
  );
};

export default Database_List;
