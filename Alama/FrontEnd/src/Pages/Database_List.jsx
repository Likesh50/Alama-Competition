import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
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

// Helper function to convert keys to human-readable format
const formatHeader = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Ensure loading starts
      try {
        const res = await axios.get('http://localhost:5000/data2');
        console.log('Fetched data:', res.data);

        // Preprocess data to remove duplicates and apply natural sorting
        const processedData = res.data;
        const dataWithLevel = processedData.map((row) => ({
          ...row,
          "Pro + Level": (row.pro || 0) + " " + (row.level || 0),
        }));

        setTableData(dataWithLevel);
        setFilteredData(processedData); // Initially, all data is displayed

        // Simulate a delay for the loader, but ensure the loading stops
        // Adjust the delay as needed (in milliseconds)
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false); // Ensure loading stops even on error
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
      <h2>FINAL RESULTS</h2>

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
                  {formatHeader(key)}
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
          <button className="print-btn" style={{marginLeft :"1190px"}}  onClick={handlePrint}>
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
              Object.keys(filteredData[0]).map((key) =>
                key!=="Pro + Level" &&(
                key === "position" ? (
                  <>
                    <th key={`${key}-pro-level`}>Pro + Level</th>
                    <th key={key}>{formatHeader(key)}</th>
                  </>
                ) : (
                  <th key={key}>{formatHeader(key)}</th>
                ))
              )}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {Object.entries(row).map(([key, value], idx) =>
                key==="s_no"?<td  style={{ color: "#FFA500" }}> {index + 1}</td>:
                key === "position" ? (
                  <>
                    <td key={`${idx}-pro-level`} style={{ color: "#FFA500" }}>
                      {row.pro} {row.level}
                    </td>
                    <td key={idx} style={{ color: "#FFA500" }}>
                      {value}
                    </td>
                  </>
                ) : (
                  key !== "Pro + Level" && (
                    <td key={idx} style={{ color: "#FFA500" }}>
                      {value}
                    </td>
                  )
                )
              )}
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
          <HashLoader color="#501960" loading={loading} size={90} />
        </div>
      )}
    </div>
  );
};

export default Database_List;
