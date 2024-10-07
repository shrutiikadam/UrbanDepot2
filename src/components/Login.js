// src/components/Login.js
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebaseConfig"; 
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState(null); // State to hold current user's email
  const navigate = useNavigate();

  // Check if a user is logged in and update the email state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email); // Set the current user's email
      } else {
        setCurrentUserEmail(null); // Reset the email if no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        alert("Login successful!");
        navigate("/"); // Redirect to homepage
      } else {
        alert("Please verify your email before logging in.");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert("Google login successful!");
      navigate("/");  // Redirect to homepage
    } catch (error) {
      alert(`Google Login Error: ${error.message}`);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {currentUserEmail && <p>Logged in as: {currentUserEmail}</p>} {/* Display current user's email */}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button className="google-btn" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>
  );
};

export default Login;
