import React, { useState } from 'react';
import axios from 'axios';
import { HashLoader } from 'react-spinners';
const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // New state for loading

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Set loading to true when the process starts
    setLoading(true);
    setMessage('');  // Clear any previous message

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Set message when the process completes
      setMessage(res.data);
    } catch (err) {
      console.error(err);
      setMessage('File upload failed.');
    } finally {
      // Turn off loading after the process is complete
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Excel File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
        <button type="submit" disabled={loading}>Upload</button>
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
          <HashLoader color="#3498db" loading={loading} size={60} />
        </div>
      )}
      {!loading && message && <p>{message}</p>}  {/* Show result message after process completes */}
    </div>
  );
};

export default UploadExcel;
