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
        <Link to="/">Home</Link>
        <Link to="/register-place">Register Place</Link>
        <Link to="/reservation">Reservation</Link>
        <Link to="/payment">Pay</Link>
        <Link to="/signup">SignUp</Link>
        <Link to="/login">Login</Link>
        <Link to="/demo">DEMO</Link>
        <Link to="/profile">profile</Link>
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
