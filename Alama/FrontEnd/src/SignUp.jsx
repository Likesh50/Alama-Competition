import React, { useState } from "react";
import './SignUpPage.css'; // Import the custom CSS file
import axios from "axios";
import logo from './assets/logo.png';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error signing up');
      }

      // Clear form on success
      setEmail('');
      setPassword('');
      setRole('');
      setError('');

      alert('User created successfully!');
      navigate('/dashboard'); // Navigate to dashboard after successful sign up
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='signup-page'>
      <div className="signup-form-container">
        <div className="signup-logo-container">
          <img src={logo} alt="Logo" className="signup-logo" />
        </div>
        <form onSubmit={handleSignUp}>
          <div className="signup-form-group">
            <input
              type="email"
              id="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <input
              type="password"
              id="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="signup-form-group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Entry">Entry</option>
              <option value="Developer">Developer</option>
            </select>
          </div>
          <button onClick={handleSignUp} className="signup-button">Sign Up</button>
        </form>
        {error && <p className="signup-error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SignUp;
