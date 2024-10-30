// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from "../firebaseConfig"; // Ensure the path is correct
import './NavHome.css';
import userIcon from './images/per123.svg';

const NavHome = ({ userEmail }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      alert("Logged out successfully!"); // Optional alert for feedback
    } catch (error) {
      alert(`Logout Error: ${error.message}`);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className='nav1'>
      <head>
      <link href="https://fonts.googleapis.com/css2?family=Bruno+Ace&family=Exo+2:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
      </head>
      <h1 className='title'>Find. Park. Relax.</h1>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/register-place">List your spot</Link>
        <Link to="/reservation">Reserve a spot</Link>
        <div className="dropdown">
        <div 
  className="hamburger-container" 
  onClick={toggleDropdown} 
  style={{ ":hover": { boxShadow: "0 4px 8px gray" } }}
>
  {/* Your content here */}

          <div className="hamburger-icon">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          <div className="person icon" style={{ backgroundImage: `url(${userIcon})` }}></div>
          </div>
        
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      {userEmail && (
        <div className="user-info">
          <span>{userEmail}</span> {/* Display user email */}
          <button onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>
      )}
    </nav>
  );
};

export default NavHome;