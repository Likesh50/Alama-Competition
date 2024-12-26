import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

const CenterPositions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for summing up the values
  const [totalChampions, setTotalChampions] = useState(0);
  const [totalWinner, setTotalWinners] = useState(0);
  const [totalRunner1, setTotalRunnerUps] = useState(0);
  const [totalRunner2, setTotalRunner2] = useState(0);
  const [totalRunner3, setTotalRunner3] = useState(0);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/center-positions`);
        const fetchedData = response.data;

        // Sum up the values
        const Champion = fetchedData.reduce((acc, row) => acc + (parseInt(row.Champion) || 0), 0);
        const Winner = fetchedData.reduce((acc, row) => acc + (parseInt(row.Winner) || 0), 0);
        const runner1 = fetchedData.reduce((acc, row) => acc + (parseInt(row.runner1) || 0), 0);
        const runner2 = fetchedData.reduce((acc, row) => acc + (parseInt(row.runner2) || 0), 0);
        const runner3 = fetchedData.reduce((acc, row) => acc + (parseInt(row.runner3) || 0), 0);

        setTotalChampions(Champion);
        setTotalWinners(Winner);
        setTotalRunnerUps(runner1);
        setTotalRunner2(runner2);
        setTotalRunner3(runner3);

        setData(fetchedData);
      } catch (err) {
        setError('Failed to fetch center positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  return (
    <Container>
      <Title>Center Positions</Title>
      {loading && <Message>Loading...</Message>}
      {error && <Message error>{error}</Message>}
      {!loading && !error && (
        <Table>
          <thead>
            <tr>
              <TableHeader>Center Name</TableHeader>
              <TableHeader>Champion</TableHeader>
              <TableHeader>Winner</TableHeader>
              <TableHeader>Runner 1</TableHeader>
              <TableHeader>Runner 2</TableHeader>
              <TableHeader>Runner 3</TableHeader>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.centre_name}</TableCell>
                <TableCell>{row.Champion}</TableCell>
                <TableCell>{row.Winner}</TableCell>
                <TableCell>{row.runner1}</TableCell>
                <TableCell>{row.runner2}</TableCell>
                <TableCell>{row.runner3}</TableCell>
              </TableRow>
            ))}
          </tbody>
          <tfoot>
            <TableRow>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>{totalChampions}</strong></TableCell>
              <TableCell><strong>{totalWinner}</strong></TableCell>
              <TableCell><strong>{totalRunner1}</strong></TableCell>
              <TableCell><strong>{totalRunner2}</strong></TableCell>
              <TableCell><strong>{totalRunner3}</strong></TableCell>
            </TableRow>
          </tfoot>
        </Table>
      )}
    </Container>
  );
};

export default CenterPositions;
