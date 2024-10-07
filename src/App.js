import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebaseConfig'; // Make sure the path is correct
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import Navbar from './components/Navbar';
import Map from './components/Map';
import RazorpayPayment from './components/RazorpayPayment';
import RegisterPlace from './components/RegisterPlace';
import ReservationForm from './components/ReservationForm';
import SignUp from './components/SignUp';
import Login from './components/Login';
import SendEmail from './components/SendEmail';
import FetchLatLng from './components/FetchLatLng';

const App = () => {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Save user email
      } else {
        setUserEmail(""); // Clear email when no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  return (
    <Router>
      <div>
        <Navbar userEmail={userEmail} />
        <Routes>
          {/* <Route path="/" element={<Map />} />
          <Route path="/payment" element={<RazorpayPayment />} />
          <Route path="/register-place" element={<RegisterPlace />} />
          <Route path="/reservation" element={<ReservationForm />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={<Map />}/>
          <Route path="/demo" element={<FetchLatLng />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
