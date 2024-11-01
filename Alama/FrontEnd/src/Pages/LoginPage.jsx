import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_ALAMA_Competition_URL}/login`, { username, password });
            const { token, role } = response.data;
            window.sessionStorage.setItem('token', token);
            window.sessionStorage.setItem('loginStatus', true);
            window.sessionStorage.setItem('role',role);
            setRole(role);
            navigate('dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='loginpage'>
      <div className="login-form">
        <div className="flower-logo">
          <img src={logo} alt="Logo" />
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email" 
              id="username"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Sign in</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
