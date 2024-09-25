import React, { useRef } from 'react';
import './PrintTableComponent.css';
import logo from '../assets/logo.png';

const PrintTableComponent = React.forwardRef(({ filteredData }, ref) => {
  // Columns to exclude
  const columnsToExclude = ['pro', 'level', 'std_cat', 'batch', 'row_no', 'roll_no','marks'];

  return (
    <div className="print-container" ref={ref}>
      <div>
        <img className='logos' src={logo} alt="Logo" />
        <div className='title'>
          <span>11</span>
          <span style={{ color: "#C0C0C0" }} className='small-text'>th</span> STATE LEVEL COMPETITION
        </div>
        <hr />
      </div>

      {/* Table Content */}
      <table className="print-table" border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            {filteredData.length > 0 &&
              Object.keys(filteredData[0]).filter(key => !columnsToExclude.includes(key)).map((key) => (
                <th key={key}>{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              {Object.keys(row).filter(key => !columnsToExclude.includes(key)).map((key, idx) => (
                <td key={idx} style={{ color: "#FFA500" }}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PrintTableComponent;
