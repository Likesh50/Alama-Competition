import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import logo from '../assets/logo.png';
// Styled components
const Container = styled.div`
  padding: 20px;
  font-family: 'Arial', sans-serif;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const Dropdown = styled.select`
  margin-bottom: 20px;
  padding: 10px;
  font-size: 1rem;
`;

const Table = styled.table`
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const TableHeader = styled.th`
  background-color: #f4f4f4;
  color: #444;
  padding: 10px;
  text-align: center;
  border-bottom: 2px solid #ddd;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }

  &:hover {
    background-color: #f1f1f1;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: ${(props) => (props.error ? 'red' : '#555')};
`;

const PrintButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const PrintOnlyContent = styled.div`
  display: none;

  @media print {
    display: block;
    text-align: center;
    margin-bottom: 20px;

    .logos {
      max-width: 150px;
      margin-bottom: 10px;
    }

    .title {
      font-size: 1.5rem;
      font-weight: bold;

      .small-text {
        font-size: 0.8rem;
        vertical-align: super;
      }
    }
      tfoot {
    display: table-row-group;
  }

    hr {
      margin-top: 10px;
    }
  }
`;

const CenterPositions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('All');

  const [totals, setTotals] = useState({
    totalChampions: 0,
    totalWinners: 0,
    totalRunner1: 0,
    totalRunner2: 0,
    totalRunner3: 0,
  });

  const tableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: 'Center Positions',
  });

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/center-positions`);
        const fetchedData = response.data;

        calculateTotals(fetchedData);
        setData(fetchedData);
      } catch (err) {
        setError('Failed to fetch center positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const calculateTotals = (filteredData) => {
    const totalChampions = filteredData.reduce((acc, row) => acc + (parseInt(row.Champion) || 0), 0);
    const totalWinners = filteredData.reduce((acc, row) => acc + (parseInt(row.Winner) || 0), 0);
    const totalRunner1 = filteredData.reduce((acc, row) => acc + (parseInt(row.runner1) || 0), 0);
    const totalRunner2 = filteredData.reduce((acc, row) => acc + (parseInt(row.runner2) || 0), 0);
    const totalRunner3 = filteredData.reduce((acc, row) => acc + (parseInt(row.runner3) || 0), 0);
    const totalpart = filteredData.reduce((acc, row) => acc + (parseInt(row.total_participants) || 0), 0);
    const totalprize = filteredData.reduce((acc, row) => acc + (parseInt(row.total_prizes) || 0), 0);

    setTotals({ totalChampions, totalWinners, totalRunner1, totalRunner2, totalRunner3,totalpart,totalprize });
  };

  const handleCenterChange = (event) => {
    const selected = event.target.value;
    setSelectedCenter(selected);

    if (selected === 'All') {
      calculateTotals(data);
    } else {
      const filteredData = data.filter((row) => row.centre_name === selected);
      calculateTotals(filteredData);
    }
  };

  const filteredData = selectedCenter === 'All' ? data : data.filter((row) => row.centre_name === selectedCenter);

  return (
    <Container>
      <Title>Center Positions</Title>
      <PrintButton onClick={handlePrint} style={{marginRight:"50px"}}>Print</PrintButton>
      {loading && <Message>Loading...</Message>}
      {error && <Message error>{error}</Message>}
      {!loading && !error && (
        <>
        
          <Dropdown value={selectedCenter} onChange={handleCenterChange}>
            <option value="All">All Centers</option>
            {Array.from(new Set(data.map((row) => row.centre_name))).map((center) => (
              <option key={center} value={center}>
                {center}
              </option>
            ))}
          </Dropdown>
          <div ref={tableRef}>
            <PrintOnlyContent>
              <img className="logos" src={logo} alt="Logo" />
              <div className="title">
                <span>12</span>
                <span style={{ color: '#C0C0C0' }} className="small-text">th</span> STATE LEVEL COMPETITION
              </div>
              <hr />
            </PrintOnlyContent>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Center Name</TableHeader>
                  <TableHeader>Champion</TableHeader>
                  <TableHeader>Winner</TableHeader>
                  <TableHeader>Runner 1</TableHeader>
                  <TableHeader>Runner 2</TableHeader>
                  <TableHeader>Total Participant</TableHeader>
                  <TableHeader>Total prize</TableHeader>

                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.centre_name}</TableCell>
                    <TableCell>{row.Champion}</TableCell>
                    <TableCell>{row.Winner}</TableCell>
                    <TableCell>{row.runner1}</TableCell>
                    <TableCell>{row.runner2}</TableCell>
                    <TableCell>{row.total_participants}</TableCell>
                    <TableCell>{row.total_prizes}</TableCell>

                  </TableRow>
                ))}
              </tbody>
              
                <TableRow>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell><strong>{totals.totalChampions}</strong></TableCell>
                  <TableCell><strong>{totals.totalWinners}</strong></TableCell>
                  <TableCell><strong>{totals.totalRunner1}</strong></TableCell>
                  <TableCell><strong>{totals.totalRunner2}</strong></TableCell>
                  <TableCell><strong>{totals.totalpart}</strong></TableCell>
                  <TableCell><strong>{totals.totalprize}</strong></TableCell>
                </TableRow>
              
            </Table>
          </div>
          
        </>
      )}
    </Container>
  );
};

export default CenterPositions;
