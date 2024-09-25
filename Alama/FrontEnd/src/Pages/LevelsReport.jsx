import React, { useRef } from 'react';
import useFetchData from './useFetchData';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './LevelsReport.css'; // Import the custom CSS

const LevelsReport = () => {
  const { data, error } = useFetchData('students'); // Adjust the path to your collection
  const tableRef = useRef(null); // Create a ref for the table

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  const generateExcel = () => {
    // Create a worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Levels Report');

    // Generate Excel file and save it
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'levels-report.xlsx');
  };

  // Assuming the student object has consistent keys
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div>
      <h2>Levels Report</h2>
      <button className="custom-button" onClick={generateExcel}>
        Download Excel
      </button>
      <div ref={tableRef} className="table-container mt-3">
        <table>
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(student => (
              <tr key={student.id}>
                {headers.map(header => (
                  <td key={header} data-label={header}>
                    {student[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LevelsReport;
