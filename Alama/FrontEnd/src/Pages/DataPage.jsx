import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { HashLoader } from 'react-spinners';

const DataPage = () => {
  const [tableData, setTableData] = useState([]);
  const [uniqueCenters, setUniqueCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const recordsPerPage = 100;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/data2`);
        const processedData = res.data;

        const sortedData = processedData.sort((a, b) =>
          a.centre_name.localeCompare(b.centre_name)
        );

        setTableData(sortedData);
        setFilteredData(sortedData.filter(row => row.position !== '-' && row.position !== null));

        const uniqueCenters = [...new Set(sortedData.map(item => item.centre_name))];
        setUniqueCenters(uniqueCenters);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCenterSelect = (e) => {
    const center = e.target.value;
    setSelectedCenter(center);
    setFilteredData(
      tableData
        .filter(row => row.position !== '-' && row.position !== null)
        .filter(row => row.centre_name === center)
    );
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <Title>FINAL RESULTS</Title>
      <DropdownContainer>
        <label htmlFor="centerSelect">Select Center:</label>
        <select id="centerSelect" value={selectedCenter} onChange={handleCenterSelect}>
          <option value="">-- Select a center --</option>
          {uniqueCenters.map((center, idx) => (
            <option key={idx} value={center}>
              {center}
            </option>
          ))}
        </select>
      </DropdownContainer>

      <TableContainer className="table-responsive">
        <StyledTable className="table table-bordered table-striped mt-3">
          <tbody>
            <tr>
              <th>S. No.</th>
              <th>Name of Students</th>
              <th>Position</th>
              <th>Centre Name</th>
              <th>Seat</th>
              
            </tr>
            {currentRecords.map((row, index) => (
              <tr key={index}>
                <td style={{ color: "#FFA500" }}>{indexOfFirstRecord + index + 1}</td>
                <td style={{ color: "#FFA500" }}>{row.name_of_students}</td>
                <td style={{ color: "#FFA500" }}>{row.position}</td>
                <td style={{ color: "#FFA500" }}>{row.centre_name}</td>
                <td style={{ color: "#FFA500" }}>{row.seat}</td>
                
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>

      <PaginationControls>
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </PaginationControls>

      {loading && (
        <LoaderContainer>
          <HashLoader color="#501960" loading={loading} size={90} />
        </LoaderContainer>
      )}
    </Container>
  );
};

export default DataPage;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: 1px solid #ddd;
`;

const Title = styled.h2`
  text-align: center;
  color: #4d195e;
  margin-bottom: 40px;
  font-size: 2rem;
  letter-spacing: 1.5px;
`;

const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96%;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f1f5f9;
  border-radius: 10px;
  border: 1px solid #dfe6e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  label {
    font-weight: bold;
    color: #4d195e;
  }

  select {
    padding: 10px;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    outline: none;
    min-width: 200px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;

    label, select {
      width: 100%;
    }

    select {
      min-width: auto;
    }
  }
`;

const StyledTable = styled.table`
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #fff;

  th, td {
    padding: 15px;
    text-align: left;
    color: #555;
    width: 20%;
  }

  th {
    background-color: #4d195e;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    th, td {
      padding: 5px;
      font-size: 0.9rem;
    }

    tr {
      display: flex;
    }

    overflow-x: auto;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 20px;

  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  button {
    padding: 10px;
    margin: 0 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #dddddd;
    cursor: not-allowed;
  }

  span {
    font-size: 1.2rem;
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;
`;
