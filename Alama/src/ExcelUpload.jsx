import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Table, Button, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase'; // Adjust the import based on your Firebase config file

const ExcelUpload = () => {
  const [sheetsData, setSheetsData] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheets = [];

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const title = json[0];
          const headers = json[1];
          const rowData = json.slice(2).map(row => {
            const record = {};
            headers.forEach((header, index) => {
              record[header] = row[index];
            });
            return record;
          }).filter(record => record['SEAT'] && record['PRO.'] && record['LEVEL'] && record['STD/CAT'] && record['CENTRE NAME']); // Ensure critical fields are not empty
;

          sheets.push({ sheetName, title, headers, data: rowData });
        });

        setSheetsData(sheets);
        setCurrentSheetIndex(0);
      } catch (err) {
        console.error('Error reading the file:', err);
      }
    };

    reader.readAsBinaryString(file);
  };

  const uploadDataToFirebase = async () => {
    if (sheetsData.length === 0) return;

    try {
      const year = prompt("Enter the year (e.g., 2024):");
      if (!year) return;

      const currentSheet = sheetsData[currentSheetIndex];
      const batch = currentSheet.sheetName;

      for (let record of currentSheet.data) {
        const studentId = String(record['SEAT']);
        const level = String(record['PRO.']);
        const levelNo = String(record['LEVEL']);
        const grade = String(record['STD/CAT']);
        const centerName = String(record['CENTRE NAME']);

        if (studentId && level && levelNo && grade && centerName) {
          const docRef = doc(
            db,
            "ALAMA",
            String(year),
            String(batch),
            "Levels",
            String(level),
            String(levelNo),
            "Grade",
            String(grade),
            "students",
            String(studentId)
          );

          await setDoc(docRef, { ...record });
        } else {
          console.error("Missing required data for document reference.");
        }
      }

      alert("Data from the current sheet uploaded to Firestore successfully!");

    } catch (error) {
      console.error("Error uploading data to Firebase:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {sheetsData.length > 0 && (
        <>
          <Dropdown className="mt-4">
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
              {sheetsData[currentSheetIndex]?.sheetName || 'Select Sheet'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sheetsData.map((sheet, index) => (
                <Dropdown.Item
                  key={index}
                  onClick={() => setCurrentSheetIndex(index)}
                >
                  {sheet.sheetName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <h3 className="mt-4">{sheetsData[currentSheetIndex].title.join(' ')}</h3>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                {sheetsData[currentSheetIndex].headers.map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetsData[currentSheetIndex].data.map((record, index) => (
                <tr key={index}>
                  {sheetsData[currentSheetIndex].headers.map((key, keyIndex) => (
                    <td key={keyIndex}>
                      {record[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          <Button variant="success" className="mt-4" onClick={uploadDataToFirebase}>
            Upload to Firebase
          </Button>
        </>
      )}
    </div>
  );
};

export default ExcelUpload;
