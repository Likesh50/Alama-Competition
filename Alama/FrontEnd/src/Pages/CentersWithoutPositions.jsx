import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

const Message = styled.p`
  font-size: 1.2rem;
  color: ${(props) => (props.error ? 'red' : '#555')};
  margin-top: 20px;
`;

const CenterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 600px;
`;

const CenterItem = styled.li`
  font-size: 1.2rem;
  color: #444;
  background: #f9f9f9;
  margin: 10px 0;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

`;

const CentersWithoutPositions = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_ALAMA_Competition_URL}/centers-without-positions`);
        setCenters(response.data);
      } catch (err) {
        setError('Failed to fetch centers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  return (
    <Container>
      <Title>Centers Without Price</Title>
      {loading && <Message>Loading...</Message>}
      {error && <Message error>{error}</Message>}
      {!loading && !error && (
        <CenterList>
          {centers.map((center, index) => (
            <CenterItem key={index}>{center.centre_name}</CenterItem>
          ))}
        </CenterList>
      )}
    </Container>
  );
};

export default CentersWithoutPositions;
