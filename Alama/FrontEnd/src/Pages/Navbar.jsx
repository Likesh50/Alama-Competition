import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = window.sessionStorage.getItem("role");

  const handleClick = () => {
    window.sessionStorage.clear();
    navigate('/');
  };

  const handleImage = () => {
    navigate("/dashboard");
  };

  return (
    <div className='navbar'>
      <div className='logo'>
        <img src={logo} alt="Logo" onClick={handleImage} />
      </div>

      <ul className='nav-links'>
        {role !== "Center" && (
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard">Home</Link>
          </li>
        )}

        {role === "Entry" && role !== "Center" && (
          <li className={location.pathname === '/dashboard/mark-entry' ? 'active' : ''}>
            <Link to="/dashboard/mark-entry">Mark Entry</Link>
          </li>
        )}
        
        {role !== "Entry" && role !== "Center" && (
          <>
            <li className={location.pathname === '/dashboard/modify-position' ? 'active' : ''}>
              <Link to="/dashboard/modify-position">Modify Position</Link>
            </li>
            <li className={location.pathname === '/dashboard/result' ? 'active' : ''}>
              <Link to="/dashboard/result">Result</Link>
            </li>
            <li className={location.pathname === '/dashboard/upload' ? 'active' : ''}>
              <Link to="/dashboard/upload">Upload</Link>
            </li>
          </>
        )}
      </ul>

      <button className='logout-button' onClick={handleClick}>Logout</button>
    </div>
  );
}

export default Navbar;
