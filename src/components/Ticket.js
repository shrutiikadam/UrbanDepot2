import React from 'react';
import { useLocation } from 'react-router-dom';
import './Ticket.css';
import ticketImage from '../images/ticket.png';  // Import the image

const Ticket = () => {
  const location = useLocation();
  const { paymentId, reservationData, totalAmount } = location.state;

  return (
    <div className="ticket-container" style={{ backgroundImage: `url(${ticketImage})` }}>
      <div className="ticket-header">Parking Ticket</div>

      <div className="ticket-detail">Payment ID: {paymentId}</div>
      <div className="ticket-detail">Name: {reservationData.name}</div>
      <div className="ticket-detail">Email: {reservationData.email}</div>
      <div className="ticket-detail">Contact: {reservationData.contactNumber}</div>
      <div className="ticket-detail">Vehicle Type: {reservationData.vehicleType}</div>
      <div className="ticket-detail">Check-in: {reservationData.checkinDate}</div>
      <div className="ticket-detail">Check-out: {reservationData.checkoutDate}</div>
      <div className="ticket-footer">Total Paid: ₹{totalAmount}</div>
    </div>
  );
};

export default Ticket;