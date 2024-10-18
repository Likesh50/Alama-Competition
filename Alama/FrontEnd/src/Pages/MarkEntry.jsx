import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarkEntry.css';
import { HashLoader } from 'react-spinners';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const naturalSort = (a, b) => {
  const splitA = a.split('-').map(Number);
  const splitB = b.split('-').map(Number);
  for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
    if (splitA[i] === splitB[i]) continue;
    return (splitA[i] || 0) - (splitB[i] || 0);
  }
  return 0;
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

const MarkEntry = () => {
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [batches, setBatches] = useState([]); 
  const [selectedBatch, setSelectedBatch] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const notifysuccess = () => {
    toast.success('Updated Marks Successfully!', {
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

  const notifyfailure = () => {
    toast.error('Error Updating Marks!', {
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
  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/batches`)
      .then(response => {
        setLoading(false);
        setBatches(response.data);
        if (response.data.length > 0) {
          setSelectedBatch(response.data[0]);
        }
      })
      .catch(error => {
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedBatch) {
      axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data?batch=${selectedBatch}`)
        .then(response => {
          setLoading(false);
          const sortedStudents = preprocessData(response.data);
          setStudents(sortedStudents);
          const initialMarks = {};
          sortedStudents.forEach(student => {
            initialMarks[student.seat] = student.marks || '';
          });
          setMarksData(initialMarks);
          console.log(sortedStudents);
        })
        .catch(error => {
          setLoading(false);
        });
    }
  }, [selectedBatch]);

  const handleMarkChange = (seat, value) => {
    setMarksData(prevState => ({
      ...prevState,
      [seat]: value,
    }));
  };

  const updateMarks = () => {
    setIsLoading(true);
    setLoading(true);
    setCompletionMessage('');
  
    const marksArray = Object.entries(marksData).map(([seat, marks]) => ({
      seat,
      marks,
    }));
  
    axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/updatePositions`, { marksData: marksArray })
      .then(response => {
        setLoading(false);
        setIsLoading(false);
        setCompletionMessage('Marks updated successfully!');
        notifysuccess();
      })
      .catch(error => {
        setLoading(false);
        setIsLoading(false);
        setCompletionMessage('Error updating marks. Please try again.');
      });
  };
  
  return (
    <div className="containers">
      <h2>Student Marks Entry</h2>

      <div className="select-containers">
        <label>Select Batch: </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          {batches.map((batch, index) => (
            <option key={index} value={batch}>{batch}</option>
          ))}
        </select>
      </div>

      {isLoading ? <p>Updating marks...</p> : null}

      <table>
        <thead>
          <tr>
            
            <th style={{ width: '150px' }}>Pro</th>
            <th style={{ width: '150px' }}>Level</th>
            <th style={{ width: '150px' }}>Seat</th>
            <th style={{ width: '150px' }}>std</th>
            <th style={{ width: '150px' }}>Marks</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.seat}>
              
              <td style={{ width: '150px' }}>{student.pro}</td>
              <td style={{ width: '150px' }}>{student.level}</td>
              <td style={{ width: '150px' }}>{student.seat}</td>
              <td style={{ width: '150px' }}>{student.std_cat}</td>
              <td style={{ width: '150px' }}>
                <input
                  type="text"
                  value={marksData[student.seat]}
                  onChange={(e) => handleMarkChange(student.seat, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={updateMarks} style={{marginLeft:"710px"}} disabled={isLoading}>Update Marks</button>

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

export default MarkEntry;
