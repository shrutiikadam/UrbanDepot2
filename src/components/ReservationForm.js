// src/components/ReservationForm.js
import React, { useState } from 'react';
import './Reservation.module.css'

const ReservationForm = () => {
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [parkingSpot, setParkingSpot] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const reservationData = {
      checkin,
      checkout,
      vehicleType,
      parkingSpot,
      licensePlate,
      paymentMethod,
      total_amount: "50000" // Example amount in paise
    };
    console.log(reservationData);
  };

  return (
    <div className="container">
      <h2>Parking Reservation Form</h2>
      <form onSubmit={handleSubmit}>
        <label>Check-In Time:</label>
        <input type="time" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
        
        <label>Check-Out Time:</label>
        <input type="time" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />

        <label>Type of Vehicle:</label>
        <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required>
          <option value="">Select Vehicle Type</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="truck">Truck</option>
          <option value="suv">SUV</option>
        </select>

        <label>Parking Spot Type:</label>
        <select value={parkingSpot} onChange={(e) => setParkingSpot(e.target.value)} required>
          <option value="">Select Parking Spot Type</option>
          <option value="open">Open</option>
          <option value="covered">Covered</option>
          <option value="underground">Underground</option>
        </select>

        <label>License Plate Number:</label>
        <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />

        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
          <option value="">Select Payment Method</option>
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
          <option value="cash">Cash</option>
          <option value="digital">Digital Wallet</option>
        </select>

        <input type="submit" value="Reserve Now" />
      </form>
    </div>
  );
};

export default ReservationForm;
