import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
import './Database_List.css';
import { useReactToPrint } from 'react-to-print';
import PrintTableComponent from './PrintTableComponent';
import { HashLoader } from 'react-spinners';

const romanToInt = (roman) => {
  const romanMap = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let intVal = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = romanMap[roman[i]];
    const next = romanMap[roman[i + 1]];
    if (next && current < next) {
      intVal -= current;
    } else {
      intVal += current;
    }
  }
  return intVal;
};

const naturalSort = (a, b) => {
  const regex = /^([A-Z]{2})\s+(\d+)\s+([IVXLCDM]+)$/;
  
  const matchA = a.match(regex);
  const matchB = b.match(regex);

  if (!matchA || !matchB) {
    return 0; 
  }

  const [ , prefixA, numA, romanA] = matchA;
  const [ , prefixB, numB, romanB] = matchB;

  if (prefixA !== prefixB) {
    return prefixA.localeCompare(prefixB);
  }

  if (parseInt(numA) !== parseInt(numB)) {
    return parseInt(numA) - parseInt(numB);
  }

  return romanToInt(romanA) - romanToInt(romanB);
};


const formatHeader = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const preprocessData = (data) => {
  const allData = [];
  data.forEach(record => {
    if (record.seat) {  
      const existingRecord = allData.find(item => item.seat === record.seat);
      if (!existingRecord) {
        allData.push(record);
      }
    }
  });
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
  const [calculating, setCalculating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const recordsPerPage = 100; 
  const [newButtonLoading, setNewButtonLoading] = useState(false);
  
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const res = await axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`);

        const processedData = res.data;
        const dataWithLevel = processedData.map((row) => ({
          ...row,
          "Pro + Level+ std cat": (row.pro || 0) + " " + (row.level || 0) + " " + (row.std_cat),
        }));

        const sortedData = dataWithLevel.sort((a, b) =>
          naturalSort(a["Pro + Level+ std cat"], b["Pro + Level+ std cat"])
        );

        setTableData(sortedData);
        setFilteredData(sortedData); 

      } catch (err) {
        setLoading(false);
      }
      finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);


  const handleCalculateResults = async () => {
    setCalculating(true); 
  
    const categoryData = {
      "AA PRE LEVEL BABY JUNIOR": { "Winner": 1, "Runner1": 2, "Runner2": 2, "Runner3": 3,"cutoff":35 },
      "AA BASIC BABY JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 2,"cutoff":35 },
      "AA BASIC SUB JUNIOR": { "Winner": 2, "Runner1": 2, "Runner2": 4, "Runner3": 4,"cutoff":35 },
      "AA BASIC JUNIOR": { "Winner": 1, "Runner1": 2, "Runner2": 2, "Runner3": 3,"cutoff":35 },
      "AA BASIC SENIOR": { "Winner": 1, "Runner1": 2, "Runner2": 2, "Runner3": 3,"cutoff":35 },
    
      "AA 1 SUB JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 2,"cutoff":35 },
      "AA 1 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 3,"cutoff":35 },
      "AA 1 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 2,"cutoff":35 },
    
      "AA 2 SUB JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 1,"cutoff":35 },
      "AA 2 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 3,"cutoff":35 },
      "AA 2 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 2,"cutoff":35 },
    
      "AA 3 SUB JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":35 },  
      "AA 3 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 2,"cutoff":35 },
      "AA 3 SENIOR": { "Winner": 2, "Runner1": 2, "Runner2": 3, "Runner3": 4,"cutoff":35 },
    
      "AA 4 SUB JUNIOR": { "Winner": 1, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":35 },
      "AA 4 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 1,"cutoff":35 },
      "AA 4 SENIOR": { "Winner": 1, "Runner1": 2, "Runner2": 3, "Runner3": 3,"cutoff":35 },
    
      "AA 5 SUB JUNIOR": { "Winner": 0, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":30 },
      "AA 5 JUNIOR": { "Winner": 1, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":30 },
      "AA 5 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":30 },
    
      "AA 6 JUNIOR": { "Winner": 0, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":30 },
      "AA 6 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":30 },


    
      "MA BASIC SUB JUNIOR": { "Winner": 1, "Runner1": 2, "Runner2": 3, "Runner3": 3,"cutoff":35 },
      "MA BASIC JUNIOR": { "Winner": 2, "Runner1": 2, "Runner2": 4, "Runner3": 4,"cutoff":35 },
      "MA BASIC SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 3,"cutoff":35 },
    
      "MA 1 SUB JUNIOR": { "Winner": 1, "Runner1": 2, "Runner2": 4, "Runner3": 4 ,"cutoff":35},
      "MA 1 JUNIOR": { "Winner": 2, "Runner1": 3, "Runner2": 4, "Runner3": 6 ,"cutoff":35},
      "MA 1 SENIOR": { "Winner": 1, "Runner1": 2, "Runner2": 3, "Runner3": 4,"cutoff":35 },
    
      "MA 2 SUB JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":35 },
      "MA 2 JUNIOR": { "Winner": 1, "Runner1": 2, "Runner2": 4, "Runner3": 4 ,"cutoff":35},
      "MA 2 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 2 ,"cutoff":35},
    
      "MA 3 SUB JUNIOR": { "Winner": 0, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":30 },
      "MA 3 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 2,"cutoff":30 },
      "MA 3 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 2, "Runner3": 3,"cutoff":30 },
    
      "MA 4 SUB JUNIOR": { "Winner": 1, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":30 },
      "MA 4 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0 ,"cutoff":30},
      "MA 4 SENIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 1 ,"cutoff":30},
    
      "MA 5 SUB JUNIOR": { "Winner": 0, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":25 },
      "MA 5 JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":25 },
      "MA 5 SENIOR": { "Winner": 0, "Runner1": 0, "Runner2": 0, "Runner3": 0,"cutoff":25 },
    
      "MA 6 SUB JUNIOR": { "Winner": 1, "Runner1": 1, "Runner2": 1, "Runner3": 0,"cutoff":25 },
      "MA 6 JUNIOR": { "Winner": 2, "Runner1": 2, "Runner2": 4, "Runner3": 4,"cutoff":25 },
      "MA 6 SENIOR": { "Winner": 2, "Runner1": 4, "Runner2": 5, "Runner3": 6,"cutoff":25 }
    };
    
    
  
    try {
      const response = await axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/updatePositions-national`, {
        positionThresholds: categoryData
      });
      
      console.log('Calculation result:', response.data);
    } catch (error) {
      console.error('Error calculating positions:', error);
    } finally {
      window.location.reload();
      setCalculating(false); 
    }
  };
  
  const handleNewButtonClick = async () => {
    setNewButtonLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/update-students-position`);
      console.log('New API call executed:', response.data);
    } catch (error) {
      console.error('Error executing new API call:', error);
    } finally {
      setNewButtonLoading(false);
    }
  };


  const handleColumnSelect = (e) => {
    const column = e.target.value;
    setSelectedColumn(column);

    const uniqueVals = [...new Set(tableData.map((row) => row[column]))];
    setUniqueValues(uniqueVals);
    setSelectedValue(''); 
    setFilteredData(tableData); 
  };

  const handleValueSelect = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
  
    let filtered = tableData.filter((row) => String(row[selectedColumn]) === value);
  
    
  
    setFilteredData(filtered);
    setCurrentPage(1); 
  };
  

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData); 
    const workbook = XLSX.utils.book_new(); 
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TableData'); 
    XLSX.writeFile(workbook, 'TableData.xlsx'); 
  };

  const getDistinctProLevelStdCat = () => {
    const uniqueValues = [...new Set(tableData.map(row => row["Pro + Level+ std cat"]))];
    return uniqueValues;
  };

  const handlePrint = useReactToPrint({
    content: () => m.current, 
    documentTitle: 'Custom Table Report',
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container">
      <h2>FINAL RESULTS</h2>
      <div>
        <button className="calculate-btn" onClick={handleCalculateResults} disabled={calculating}>
          {calculating ? 'Calculating...' : 'Calculate Results'}
        </button>

        <button
          className="new-button"
          onClick={handleNewButtonClick}
          disabled={newButtonLoading}
          style={{ marginLeft: '10px',marginBottom: '10px' }}
        >
          {newButtonLoading ? 'Loading...' : 'Calculate Champion'}
        </button>
      </div>
      <div className="dropdown-container">
      <div>
        <label htmlFor="columnSelect">Select Column:</label>
        <select
          id="columnSelect"
          value={selectedColumn}
          onChange={handleColumnSelect}
        >
          <option value="">-- Select a column --</option>
          {tableData.length > 0 && ["centre_name", "Pro + Level+ std cat", "position"].map((key) => (
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

      <div >
          <button className="export-btn" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="print-btn" style={{marginLeft: "1190px"}} onClick={handlePrint}>
              Print Table
          </button>
      </div>

      <div style={{ display: 'none' }}>
        <PrintTableComponent ref={printRef} filteredData={filteredData} />
      </div>

      <table className="table-container" border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            {currentRecords.length > 0 &&
              ["s_no", "name_of_students", "centre_name","pro","level","std_cat", "seat", "marks"].map((key) => (
                <th key={key}>{formatHeader(key)}</th>
              ))
            }
            <th key="position">{formatHeader("position")}</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((row, index) => (
            <tr key={index}>
              {Object.entries(row)
                .filter(([key]) => ["s_no", "name_of_students", "centre_name","pro","level","std_cat", "seat", "marks"].includes(key))
                .map(([key, value], idx) => (
                  key === "s_no" ? 
                    <td key={idx} style={{ color: "#FFA500" }}>{indexOfFirstRecord + index + 1}</td> :
                    <td key={idx} style={{ color: "#FFA500" }}>{value}</td>
                ))
              }
              <td style={{ color: "#FFA500" }}>{row.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
{/* 
      <div>
  <button onClick={() => console.log(getDistinctProLevelStdCat())}>
    Show Distinct Pro + Level + Std Cat
  </button>
</div> */}




      <div className="pagination-controls">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

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
      {(loading || calculating || newButtonLoading) && (
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
          <HashLoader color="#501960" loading={calculating} size={90} />
        </div>
      )}
    </div>
  );
};

export default Database_List;