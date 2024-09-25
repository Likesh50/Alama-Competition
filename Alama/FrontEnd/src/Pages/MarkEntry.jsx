import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  
  useEffect(() => {
    // Fetch all available batches
    axios.get('http://localhost:5000/batches')
      .then(response => {
        setBatches(response.data);
        if (response.data.length > 0) {
          setSelectedBatch(response.data[0]); // Set default batch selection to first batch
        }
      })
      .catch(error => {
        console.error('Error fetching batches:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      // Fetch student data based on the selected batch
      axios.get(`http://localhost:5000/data?batch=${selectedBatch}`)
        .then(response => {
          const sortedStudents = preprocessData(response.data);
          setStudents(sortedStudents);
          const initialMarks = {};
          sortedStudents.forEach(student => {
            initialMarks[student.seat] = student.marks || '';
          });
          setMarksData(initialMarks);
        })
        .catch(error => {
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
    setCompletionMessage('');
  
    // Convert marksData object to an array of { seat, marks }
    const marksArray = Object.entries(marksData).map(([seat, marks]) => ({
      seat,
      marks,
    }));
  
    axios.post('http://localhost:5000/updateMarks', { marksData: marksArray })
      .then(response => {
        setIsLoading(false);
        setCompletionMessage('Marks updated successfully!');
      })
      .catch(error => {
        setIsLoading(false);
        setCompletionMessage('Error updating marks. Please try again.');
        console.error('Error updating marks:', error);
      });
  };
  
  return (
    <div>
      <h2>Student Marks Entry</h2>

      {/* Batch Selection Dropdown */}
      <label>Select Batch: </label>
      <select
        value={selectedBatch}
        onChange={(e) => setSelectedBatch(e.target.value)}
      >
        {batches.map((batch, index) => (
          <option key={index} value={batch}>{batch}</option>
        ))}
      </select>

      {isLoading ? <p>Updating marks...</p> : null}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Centre</th>
            <th>Pro</th>
            <th>Level</th>
            <th>Seat</th>
            <th>Roll No</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.seat}>
              <td>{student.name_of_students}</td>
              <td>{student.centre_name}</td>
              <td>{student.pro}</td>
              <td>{student.level}</td>
              <td>{student.seat}</td>
              <td>{student.roll_no}</td>
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

      <button onClick={updateMarks} disabled={isLoading}>Update Marks</button>
      {completionMessage && <p>{completionMessage}</p>}
    </div>
  );
};

export default MarkEntry;
