import React, { useState } from 'react';
import axios from 'axios';
import { HashLoader } from 'react-spinners';
import './UploadExcel.css';
import upload from '../assets/upload.png';
const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileRemove = () => {
    setFile(null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessage(''); 

    try {
      const res = await axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage(res.data);
    } catch (err) {
      console.error(err);
      setMessage('File upload failed.');
    } finally {
      setLoading(false);
    }
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
      {!loading && message && <p>{message}</p>}
    </div>
  );
};

export default UploadExcel;
