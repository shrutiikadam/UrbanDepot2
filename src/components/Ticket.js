import React from 'react';
import { useLocation } from 'react-router-dom';
import './Ticket.css';
import ticketImage from './ticket.png';  // Import the image

const Ticket = () => {
  const location = useLocation();
  const { paymentId, reservationData, totalAmount } = location.state;
  const { address, place } = location.state || {};
  console.log('Ticket Data:', location.state);
  console.log(reservationData);
  console.log (address)
  return (
    <div className="ticket-container" style={{ backgroundImage: `url(${ticketImage})` }}>
      <div className="ticket-header">Parking Ticket</div>
    
      <div className="ticket-detail">Payment ID: {paymentId}</div>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Place:</strong> {place}</p>
      <div className="ticket-detail">Name: {reservationData.name}</div>
      <div className="ticket-detail">Email: {reservationData.email}</div>
      <div className="ticket-detail">Contact: {reservationData.contactNumber}</div>
      <div className="ticket-detail">Vehicle Type: {reservationData.vehicleType}</div>
      <div className="ticket-detail">Check-in: {reservationData.checkinDate}</div>
      <div className="ticket-detail">Check-out: {reservationData.checkoutDate}</div>
      <div className="ticket-detail">Check-in: {reservationData.checkinTime}</div>
      <div className="ticket-detail">Check-out: {reservationData.checkoutTime}</div>
      <div className="ticket-footer">Total Paid: ₹{totalAmount}</div>
    </div>
  );
};

export default Ticket;