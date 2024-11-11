import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import background from '../assets/login.jpg';

const LoginPageContainer = styled.div`
  background-image: url(${background});
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoginForm = styled.div`
  background-color: rgba(244, 244, 244, 0.9);
  padding: 60px 30px;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
  width: 80%;
  max-width: 350px;
  text-align: center;

  @media (min-width: 768px) {
    padding: 80px 50px;
    width: 300px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 20px;

  img {
    width: 150px;
    height: auto;
    border-radius: 10px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    border-color: #1e620a;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  background-color: #1e620a;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #145107;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 10px;
`;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/login`, { username, password });
      const { token, role } = response.data;
      window.sessionStorage.setItem('token', token);
      window.sessionStorage.setItem('loginStatus', true);
      window.sessionStorage.setItem('role', role);
      if (role === 'Center') {
        navigate('dashboard/data');
      } else {
        navigate('dashboard'); // Fallback for other roles, if needed
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <LoginPageContainer>
      <LoginForm>
        <LogoContainer>
          <img src={logo} alt="Logo" />
        </LogoContainer>
        <form onSubmit={handleLogin}>
          <FormGroup>
            <Input
              type="email"
              id="username"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Input
              type="password"
              id="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <SubmitButton type="submit">Sign in</SubmitButton>
        </form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginForm>
    </LoginPageContainer>
  );
}

export default LoginPage;
