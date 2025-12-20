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
  const [centerOptions, setCenterOptions] = useState([]); 
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedProLevelStdCat, setSelectedProLevelStdCat] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const notifysuccess = () => {
    toast.success('Updated Positions Successfully!', { position: "top-center", theme: "colored", transition: Zoom });
  };

  const notifyfailure = () => {
    toast.error('Error Updating Positions!', { position: "top-center", theme: "colored", transition: Zoom });
  };

  // Fetch dropdown data once
  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`)
      .then(response => {
        setLoading(false);
        const data = response.data;

        // Create combined options for Pro + Level + Std Cat
        const uniqueProLevelStdCat = [...new Set(
          data.map(item => `${item.pro || ''} ${item.level || ''} ${item.std_cat || ''}`)
        )];
        setProLevelStdCatOptions(uniqueProLevelStdCat);

        // Create unique center options
        const uniqueCenters = [...new Set(data.map(item => item.centre_name))];
        setCenterOptions(uniqueCenters);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch data when either dropdown changes
  useEffect(() => {
    if (!selectedCenter && !selectedProLevelStdCat) return;

    setLoading(true);
    axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`)
      .then(response => {
        setLoading(false);
        const data = response.data;

        let filteredStudents = [];
        if (selectedCenter) {
          filteredStudents = data.filter(s => s.centre_name === selectedCenter);
        } else if (selectedProLevelStdCat) {

          const parts = selectedProLevelStdCat.split(' ');
          const pro = parts[0];
          const std_cat = parts[parts.length - 1];
          const level = parts.slice(1, parts.length - 1).join(' ');

          filteredStudents = data.filter(s =>
            `${s.pro} ${s.level} ${s.std_cat}` === `${pro} ${level} ${std_cat}`
          );
        }

        setStudents(filteredStudents);

        const initialPositions = {};
        filteredStudents.forEach(student => {
          initialPositions[student.seat] = student.position || '-';
        });
        setPositionData(initialPositions);
      })
      .catch(() => setLoading(false));
  }, [selectedCenter, selectedProLevelStdCat]);

  const searchBySeatNumber = () => {
    if (!seatNumber) return;
    setLoading(true);
    axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2/seat/${seatNumber}`)
      .then(response => {
        setLoading(false);
        const student = response.data;
        setStudents([student]);
        setPositionData({ [student.seat]: student.position || '-' });
      })
      .catch(error => {
        setLoading(false);
        if (error.response?.status === 404) {
          toast.error('No student found with the given seat number', { position: "top-center", theme: "colored" });
        } else {
          toast.error('Error fetching student data', { position: "top-center", theme: "colored" });
        }
      });
  };

  const handlePositionChange = (seat, value) => {
    setPositionData(prev => ({ ...prev, [seat]: value }));
  };

  const updatePositions = () => {
    setIsLoading(true);
    setLoading(true);

    const positionArray = Object.entries(positionData).map(([seat, position]) => ({ seat, position }));

    axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/modifyPositions`, { positionData: positionArray })
      .then(() => {
        setLoading(false);
        setIsLoading(false);
        notifysuccess();
      })
      .catch(() => {
        setLoading(false);
        setIsLoading(false);
        notifyfailure();
      });
  };

  return (
    <div className="container">
      <h2>Modify Position</h2>

      <div className="select-container" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Center Name Dropdown */}
        <div>
          <label>Center Name: </label>
          <select
            value={selectedCenter}
            onChange={(e) => {
              setSelectedCenter(e.target.value);
              setSelectedProLevelStdCat(''); // clear other dropdown
            }}
            disabled={!!selectedProLevelStdCat} // disable if other selected
          >
            <option value="">Select Center</option>
            {centerOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Pro + Level + Std Cat Dropdown */}
        <div>
          <label>Pro + Level + Std Cat: </label>
          <select
            value={selectedProLevelStdCat}
            onChange={(e) => {
              setSelectedProLevelStdCat(e.target.value);
              setSelectedCenter(''); // clear other dropdown
            }}
            disabled={!!selectedCenter} // disable if other selected
          >
            <option value="">Select Pro + Level + Std Cat</option>
            {proLevelStdCatOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search by Seat */}
      <div className="search-container">
        <label>Search by Seat Number: </label>
        <input 
          type="text" 
          value={seatNumber} 
          onChange={(e) => setSeatNumber(e.target.value)} 
          placeholder="Enter seat number"
          style={{ width: "150px", marginRight: "10px" }}
        />
        <button onClick={searchBySeatNumber}>Search</button>
      </div>

      {isLoading && <p>Updating positions...</p>}

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>S NO</th>
            <th>Name</th>
            <th>Center Name</th>
            <th>Pro</th>
            <th>Level</th>
            <th>Category</th>
            <th>Marks</th>
            <th>Modified Position</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.seat}>
              <td>{index + 1}</td>
              <td>{student.name_of_students}</td>
              <td>{student.centre_name}</td>
              <td>{student.pro}</td>
              <td>{student.level}</td>
              <td>{student.std_cat}</td>
              <td>{student.marks}</td>
              <td>
                <select
                  value={positionData[student.seat] || student.position || '-'}
                  onChange={(e) => handlePositionChange(student.seat, e.target.value)}
                >
                  <option value="Champion">Champion</option>
                  <option value="Winner">Winner</option>
                  <option value="Runner1">Runner1</option>
                  <option value="Runner2">Runner2</option>
                  <option value="Runner3">Runner3</option>
                  <option value="-">-</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={updatePositions} disabled={isLoading} style={{ marginLeft: "45%" }}>
        Update Positions
      </button>

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)',
        }}>
          <HashLoader color="#501960" loading={loading} size={90} />
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ModifyPosition;
