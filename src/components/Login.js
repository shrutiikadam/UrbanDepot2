// src/components/Login.js
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styles from './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState(null); 
  const [isSignUp, setIsSignUp] = useState(false);  // To toggle between login and signup forms
  const navigate = useNavigate();

  // Check if a user is logged in and update the email state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        setCurrentUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user.emailVerified) {
        alert("Login successful!");
        navigate("/"); 
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
      navigate("/");
    } catch (error) {
      alert(`Google Login Error: ${error.message}`);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      alert("Signup successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleToggle = () => {
    setIsSignUp(!isSignUp);  // Toggle between SignIn and SignUp
  };

  return (
    <div className="login-page">
    <div className={`form-container ${isSignUp ? "show-signup" : "show-login"}`}>
  <div className="col col-1">
    <div className="image-layer">
      <img src="/car.png" className="car-bg" />
    </div>
    <p className="words">Few Seconds Away From Solving Parking Issue!</p>
  </div>

  <div className="col col-2">
    <div className="btn-box">
      <button
        className={`btn ${!isSignUp ? "btn-1" : ""}`}
        onClick={() => setIsSignUp(false)}
      >
        Sign In
      </button>
      <button
        className={`btn ${isSignUp ? "btn-2" : ""}`}
        onClick={() => setIsSignUp(true)}
      >
        Sign Up
      </button>
    </div>

    {/* Sign-Up Form */}
    <div className={`register-form ${isSignUp ? "active" : ""}`}>
      <div className="form-title">
        <span>Sign Up</span>
      </div>
      {currentUserEmail && <p>Logged in as: {currentUserEmail}</p>}
      <form onSubmit={handleSignUp}>
        <div className="form-inputs">
          <div className="input-box">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="bx bx-envelope icon"></i>
          </div>
          <div className="input-box">
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="bx bx-lock-alt icon"></i>
          </div>
          <div className="input-box">
            <input
              className="input-field"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <i className="bx bx-lock-alt icon"></i>
          </div>
          <button className="input-submit" type="submit">
            <span>Sign Up</span>
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
        <div className="social-login">
          <i className="bx bxl-google"></i>
          <i className="bx bxl-facebook"></i>
          <i className="bx bxl-twitter"></i>
          <i className="bx bxl-github"></i>
        </div>
      </form>
      <button className="google-btn" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>

    {/* Sign-In Form */}
    <div className={`login-form ${!isSignUp ? "active" : ""}`}>
      <div className="form-title">
        <span>Sign In</span>
      </div>
      {currentUserEmail && <p>Logged in as: {currentUserEmail}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-inputs">
          <div className="input-box">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="bx bx-envelope icon"></i>
          </div>
          <div className="input-box">
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="bx bx-lock-alt icon"></i>
          </div>
          <div className="forgot-box">
            <a href="#">Forgot Password?</a>
          </div>
          <button className="input-submit" type="submit">
            <span>Sign In</span>
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
        <div className="social-login">
          <i className="bx bxl-google"></i>
          <i className="bx bxl-facebook"></i>
          <i className="bx bxl-twitter"></i>
          <i className="bx bxl-github"></i>
        </div>
      </form>
      <button className="google-btn" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>
  </div>
</div>
</div>
  );
};

export default Login;