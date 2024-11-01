
// src/components/Login.js
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styles from './Login.css';
import 'boxicons/css/boxicons.min.css';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between login and signup forms
  const [showForgotPassword, setShowForgotPassword] = useState(false); // To toggle the forgot password form
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
        navigate("/map"); 
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
      navigate("/map");
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
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false); // Hide the forgot password form after sending the email
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
      <img src="car.png" className="car-bg" />
    </div>
    <p className="words">Few Seconds Away From Solving Parking Issue!</p>
  </div>

  <div className="col col-2">
    <div className="btn-box">
      <button
        className={`btn ${!isSignUp ? "btn-1" : ""}`}
        onClick={() => setIsSignUp(false)}
      >
        LOG IN
      </button>
      <button
        className={`btn ${isSignUp ? "btn-2" : ""}`}
        onClick={() => setIsSignUp(true)}
      >
        SIGN UP
      </button>
    </div>

    {/* Sign-Up Form */}
    <div className={`register-form ${isSignUp ? "active" : ""}`}>
      <div className="form-title">
        <span>SIGN UP</span>
      </div>
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
          <div className="forgot-box">
            <a href="#">Forgot Password?</a>
          </div>
          <button className="input-submit" type="submit">
            <span>Sign Up</span>
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
     
      </form>
      <button className="google-btn" onClick={handleGoogleLogin}>
    <span className="google-icon">
        <i className="bx bxl-google"></i> {/* Google icon */}
    </span>
    <span>Continue with Google</span> {/* Text in a separate span */}
</button>



    </div>

    {/* Sign-In Form */}
    <div className={`login-form ${!isSignUp ? "active" : ""}`}>
      <div className="form-title">
        <span>LOGIN</span>
      </div>
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
            <span>LOG IN</span>
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
       
      </form>
      <button className="google-btn" onClick={handleGoogleLogin}>
    <span className="google-icon">
        <i className="bx bxl-google"></i> {/* Google icon */}
    </span>
    <span>Continue with Google</span> {/* Text in a separate span */}
</button>



    </div>
  </div>
</div>
</div>
  );
};

export default Login;