// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from "../firebaseConfig"; // Ensure the path is correct
import './Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

const Navbar = ({ userEmail }) => {
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      alert("Logged out successfully!"); // Optional alert for feedback
    } catch (error) {
      alert(`Logout Error: ${error.message}`);
    }
  };

  return (
    <nav className="urban-navbar">
      <h1 className="urban-navbar-title"><strong>URBANDEPOT</strong></h1>
      <div className="urban-navbar-links">
      <Link to="/map">
  <i className="fas fa-home"></i> {/* Home icon */}
  <span></span> {/* Home text */}
</Link>

        <Link to="/register-place">LIST YOUR SPACE</Link>
        <Link to="/profile">PROFILE</Link>
      </div>
      {userEmail && (
        <div className="urban-navbar-user-info">
          <span className="urban-navbar-user-email">{userEmail}</span> {/* Display user email */}
          <button className="urban-navbar-logout-btn" onClick={handleLogout}>Logout</button> {/* Logout button */}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
