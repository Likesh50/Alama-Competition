import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getFirestore, collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
const CentersReport = () => {
  const [centers, setCenters] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const centersRef = collection(db, 'ALAMA', '2025', 'Centers');
        const snapshot = await getDocs(centersRef);
        const centerNames = snapshot.docs.map(doc => doc.id);
        setCenters(centerNames);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allData = [];

      for (const center of centers) {
        try {
          const centerRef = collection(db, 'ALAMA', '2025', center);
          const snapshot = await getDocs(centerRef);
          snapshot.forEach(doc => {
            allData.push({ center, ...doc.data() });
          });
        } catch (err) {
          setError(err);
        }
      }

      setData(allData);
      setLoading(false);
    };

    if (centers.length) {
      fetchData();
    }
  }, [centers]);

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Centers Report');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'centers-report.xlsx');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  // Extract headers dynamically from the data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div>
      <h2>Centers Report</h2>
      <Button variant="primary" onClick={generateExcel}>Download Excel</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {headers.map(header => (
                <td key={header}>{item[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CentersReport;
