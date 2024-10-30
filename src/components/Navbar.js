// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from "../firebaseConfig"; // Ensure the path is correct
import './Navbar.css';

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
    <nav>
      <h1>Map App</h1>
      <div className="nav-links">
        <Link to="/map">HOME</Link>
        <Link to="/register-place">REGISTER PLACE</Link>
        <Link to="/profile">PROFILE</Link>
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

export default Navbar;