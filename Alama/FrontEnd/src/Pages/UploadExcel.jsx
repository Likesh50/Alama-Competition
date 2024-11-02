import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { HashLoader } from 'react-spinners';
import './UploadExcel.css';
import upload from '../assets/upload.png';
import * as XLSX from 'xlsx';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileRemove = () => {
    setFile(null);
 
  };

  const fetchStudentCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_ALAMA_Competition_URL}/count`);
      const data = await response.json();
      setStudentCount(data.count);
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  };

  useEffect(() => {
    fetchStudentCount();
  }, []);


  const handleDelete = async (e) => {
    e.preventDefault();
    if (studentCount > 0) {
      const response = await fetch(`${import.meta.env.VITE_ALAMA_Competition_URL}/students`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        notifysuccess('Data deleted successfully');
        setStudentCount(0); 
      } else {
        notifyfailure("Error deleting Data");
      }
    } else {
      notifyfailure("Error deleting Data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file) {
      notifyfailure("Please select a file first");
      return;
    }
  
    setLoading(true);
   
  
    try {
      const excelData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
  
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const extractedData = XLSX.utils.sheet_to_json(sheet);
  
          resolve(extractedData);
        };
  
        reader.onerror = (error) => {
          reject('Error reading file');
        };
  
        reader.readAsArrayBuffer(file);
      });
  
      const res = await axios.post(
        `${import.meta.env.VITE_ALAMA_Competition_URL}/upload`, 
        { data: excelData }
      );
  
      
    } catch (err) {
      notifyfailure("Error uploading Data");
    } finally {
      setLoading(false);
      setFile(null);
      notifysuccess('Data Imported successfully');

    }
  };
  
  const notifysuccess = (msg) => {
    toast.success(msg , {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Zoom,
    });
  };

  const notifyfailure = (msg) => {
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      transition: Zoom,
    });
  };
  

  return (
    <div className="upload-container">
      <h2>Upload Excel File</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        {!file && (
          <div className="file-upload">
            <input type="file" className="file-input" onChange={handleFileChange} accept=".xlsx, .xls" />
            <img src={upload} width={250} height={250}/>
            <label className="file-label">Choose a file</label>
          </div>
        )}

        {file && (
          <div className="file-card">
            <span className="file-name">{file.name}</span>
            <button type="button" className="delete-btn" onClick={handleFileRemove}>
              &times;
            </button>
          </div>
        )}

        <div onClick={(e)=>handleSubmit(e)} className="upload-btn" disabled={loading || !file}>Upload</div>

        <button
        onClick={handleDelete}
        disabled={studentCount === 0}
        style={{
          cursor: studentCount> 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Delete All Records
      </button>
      </form>

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

      <ToastContainer />
    </div>
  );
};

export default UploadExcel;
