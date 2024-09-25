import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">LOGOTYPE</div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
        <div className="menu-icon">&#9776;</div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1>UI/UX DESIGN</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <a href="#about" className="cta-button">Click Here</a>
        </div>
        <div className="hero-image">
          <img src="your-image-path-here.png" alt="Hero" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
