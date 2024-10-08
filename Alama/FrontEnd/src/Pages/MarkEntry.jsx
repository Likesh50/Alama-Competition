import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarkEntry.css';
import { HashLoader } from 'react-spinners';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Natural sorting function
const naturalSort = (a, b) => {
  const splitA = a.split('-').map(Number);
  const splitB = b.split('-').map(Number);
  for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
    if (splitA[i] === splitB[i]) continue;
    return (splitA[i] || 0) - (splitB[i] || 0);
  }
  return 0;
};

// Preprocess data to remove duplicates and apply natural sorting
const preprocessData = (data) => {
  const allData = [];
  data.forEach(record => {
    if (record.seat) {  // Ensure we're using the correct column name
      const existingRecord = allData.find(item => item.seat === record.seat);
      if (!existingRecord) {
        allData.push(record);
      }
    }
  });
  // Sort data by the 'seat' field using natural sort
  allData.sort((a, b) => naturalSort(a.seat, b.seat));
  return allData;
};

const MarkEntry = () => {
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [batches, setBatches] = useState([]); // To store available batches
  const [selectedBatch, setSelectedBatch] = useState(''); // To track the selected batch
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
    // Fetch all available batches
    setLoading(true);
    axios.get('http://localhost:5000/batches')
      .then(response => {
        setLoading(false);
        setBatches(response.data);
        if (response.data.length > 0) {
          setSelectedBatch(response.data[0]); // Set default batch selection to first batch
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error fetching batches:', error);
      }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedBatch) {
      // Fetch student data based on the selected batch
      axios.get(`http://localhost:5000/data?batch=${selectedBatch}`)
        .then(response => {
          setLoading(false);
          const sortedStudents = preprocessData(response.data);
          setStudents(sortedStudents);
          const initialMarks = {};
          sortedStudents.forEach(student => {
            initialMarks[student.seat] = student.marks || '';
          });
          setMarksData(initialMarks);
        })
        .catch(error => {
          setLoading(false);
          console.error('Error fetching student data:', error);
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
  
    // Convert marksData object to an array of { seat, marks }
    const marksArray = Object.entries(marksData).map(([seat, marks]) => ({
      seat,
      marks,
    }));
  
    axios.post('http://localhost:5000/updateMarks', { marksData: marksArray })
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
        console.error('Error updating marks:', error);
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
            
            <th>Pro</th>
            <th>Level</th>
            <th>Seat</th>

            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.seat}>
              
              <td>{student.pro}</td>
              <td>{student.level}</td>
              <td>{student.seat}</td>
              <td>
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
