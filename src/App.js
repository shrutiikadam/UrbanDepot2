import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Map from './components/Map';
import RazorpayPayment from './components/RazorpayPayment';
import RegisterPlace from './components/RegisterPlace';
import ReservationForm from './components/ReservationForm';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Availability from './components/Availability';
import Profile from './components/Profile';
import Ticket from './components/Ticket';
import FetchPlaceName from './components/FetchPlaceName';
import LandingPage from './components/LandingPage';
import AdminPage from './components/AdminPage';
import AdminSidebar from './components/AdminSidebar';
import Home from './components/Home';
import NavHome from './components/NavHome';

const App = () => {
  const [userEmail, setUserEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {location.pathname === '/home' ? <NavHome /> : <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/payment" element={<RazorpayPayment />} />
        <Route path="/register-place" element={<RegisterPlace />} />
        <Route path="/reservation" element={<ReservationForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/demo" element={<Availability placeId="zGK4ChrgmCIEpU88d4dz" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ticket" element={<Ticket userEmail={userEmail} />} />
        <Route path="/fetch" element={<FetchPlaceName />} />
        <Route path='/map' element={<Map/>} />
        <Route path='/adminpage' element={<AdminPage />} />
        <Route path='/adminside' element={<AdminSidebar />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </div>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
