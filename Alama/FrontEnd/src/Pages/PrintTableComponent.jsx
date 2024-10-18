import React, { useRef } from 'react';
import './PrintTableComponent.css';
import logo from '../assets/logo.png';

const PrintTableComponent = React.forwardRef(({ filteredData }, ref) => {
  const columnsToInclude = ['s_no','name_of_students', 'centre_name', 'Pro + Level', 'seat', 'position'];

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

      <table className="print-table" border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            {filteredData.length > 0 &&
              Object.keys(filteredData[0]).filter(key => columnsToInclude.includes(key)).map((key) => (
                <th key={key}>{key === 's_no' ? 'S. No.' : key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
            <td style={{ color: "#FFA500", padding: "5px" }}>{index + 1}</td>
            {Object.keys(row).filter(key => columnsToInclude.includes(key) && key !== 's_no').map((key, idx) => (
              <td key={idx} style={{ color: "#FFA500", padding: "5px" }}>{row[key]}</td>
            ))}
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PrintTableComponent;
