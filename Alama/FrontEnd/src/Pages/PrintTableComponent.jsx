import React, { useRef } from 'react';
import './PrintTableComponent.css';
import logo from '../assets/logo.png';
const PrintTableComponent = React.forwardRef(({ filteredData }, ref) => {
  return (
    <div className="print-container" ref={ref}>
       
       <div>
        <img className='logos' src={logo}  />
        <div className='title'><span>11</span><span style={{color:"black"}} className='small-text'>th</span> STATE LEVEL COMPETITION</div>
       </div>

      {/* Table Content */}
      <table className="print-table" border="1" cellPadding="10" cellSpacing="0">
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
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom Footer */}
      <div className="print-footer">
        <p>© 2024 Your Company Name. All rights reserved.</p>
      </div>
    </div>
  );
});

export default PrintTableComponent;


    