import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModifyPosition.css';
import { HashLoader } from 'react-spinners';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ModifyPosition = () => {
  const [students, setStudents] = useState([]);
  const [positionData, setPositionData] = useState({});
  const [proLevelStdCatOptions, setProLevelStdCatOptions] = useState([]); 
  const [selectedProLevelStdCat, setSelectedProLevelStdCat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const notifysuccess = () => {
    toast.success('Updated Positions Successfully!', {
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
    toast.error('Error Updating Positions!', {
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
    axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`)
      .then(response => {
        setLoading(false);

        const processedData = response.data;
        const dataWithLevel = processedData.map((row) => ({
          ...row,
          "Pro + Level+ std cat": (row.pro || 0) + " " + (row.level || 0) + " " + (row.std_cat),
        }));

        const uniqueProLevelStdCat = [...new Set(dataWithLevel.map(item => item["Pro + Level+ std cat"]))];
        setProLevelStdCatOptions(uniqueProLevelStdCat);

        if (uniqueProLevelStdCat.length > 0) {
          setSelectedProLevelStdCat(uniqueProLevelStdCat[0]); 
        }
      })
      .catch(error => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    if (selectedProLevelStdCat) {
      axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`) 
        .then(response => {
          setLoading(false);
          const filteredStudents = response.data.filter(student => 
            (student.pro + " " + student.level + " " + student.std_cat) === selectedProLevelStdCat
          );
          setStudents(filteredStudents);
          const initialPositions = {};
          filteredStudents.forEach(student => {
            initialPositions[student.seat] = student.position || '-';
          });
          setPositionData(initialPositions);
        })
        .catch(error => {
          setLoading(false);
        });
    }
  }, [selectedProLevelStdCat]);

  const handlePositionChange = (seat, value) => {
    setPositionData(prevState => ({
      ...prevState,
      [seat]: value,
    }));
  };

  const updatePositions = () => {
    setIsLoading(true);
    setLoading(true);

    const positionArray = Object.entries(positionData).map(([seat, position]) => ({
      seat,
      position,
    }));

    axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/modifyPositions`, { positionData: positionArray })
      .then(response => {
        setLoading(false);
        setIsLoading(false);
        notifysuccess();
        
      })
      .catch(error => {
        setLoading(false);
        setIsLoading(false);
        notifyfailure();
      });
  };

  return (
    <div className="container">
      <h2>Modify Position</h2>

      <div className="select-container">
        <label>Select Pro + Level + std cat: </label>
        <select
          value={selectedProLevelStdCat}
          onChange={(e) => setSelectedProLevelStdCat(e.target.value)}
          style={{width:"130px"}}
        >
          {proLevelStdCatOptions.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {isLoading ? <p>Updating positions...</p> : null}

      <table>
  <thead>
      <tr>
      <th>S NO</th>
      <th>Name</th>
      <th>Seat</th>
      
      <th>Modified Position</th>
      </tr>
  </thead>
  <tbody>
    {students.map((student, index) => (
        <tr key={student.seat}>
        <td>{index + 1}</td> 
        <td>{student.name_of_students}</td>
        <td>{student.marks}</td>
        <td>
        <select
          value={positionData[student.seat] || student.position} 
          onChange={(e) => handlePositionChange(student.seat, e.target.value)}  
          
        >
            <option value="winner">winner</option>
            <option value="runnerUp">runnerUp</option>
            <option value="runner2">runner2</option>
            <option value="-">-</option>
            </select>
        </td>
        </tr>
    ))}
    </tbody>

</table>



      <button onClick={updatePositions} disabled={isLoading}>Update Positions</button>

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

export default ModifyPosition;
