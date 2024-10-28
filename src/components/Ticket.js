import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Ticket.css';
import ticketImage from './images/ticket.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from 'emailjs-com';
import { QRCodeCanvas } from 'qrcode.react'; // Update import

const Ticket = ({ userEmail }) => {
  const location = useLocation();
  const { 
    address = 'N/A', 
    place,
    paymentId, 
    reservationData, 
    totalAmount 
  } = location.state || {};

  // Define EmailJS variables
  const emailJsServiceId = "service_47vx99l";
  const emailJsTemplateId = "template_ozillze";
  const emailJsUserId = "-gQSz38aytXtBOMib";

  useEffect(() => {
    console.log("Service ID:", emailJsServiceId);
    console.log("Template ID:", emailJsTemplateId);
    console.log("User ID:", emailJsUserId);

    if (userEmail) {
      console.log('Logged in user email:', userEmail);
    } else {
      console.log('No user is logged in.');
    }
  }, [userEmail]);

  const downloadPDF = async () => {
    const input = document.getElementById('ticket-container');
    const canvas = await html2canvas(input);
    const data = canvas.toDataURL('image/png');

    const pdfWidth = 297; 
    const pdfHeight = 100; 
    const pdf = new jsPDF('l', 'mm', [pdfWidth, pdfHeight]); 

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, (pdfWidth * canvas.height) / canvas.width);
    pdf.save('ticket.pdf');
  };

  const sendEmail = async () => {
    const templateParams = {
      to_email: userEmail,
      address: address,
      place: place,
      name: reservationData.name,
      vehicleType: reservationData.vehicleType,
      checkinDate: reservationData.checkinDate,
      checkoutDate: reservationData.checkoutDate,
      checkinTime: reservationData.checkinTime,
      checkoutTime: reservationData.checkoutTime,
      totalAmount: totalAmount,
      paymentId: paymentId,
    };
    console.log('Template parameters:', templateParams);
    
    try {
      const response = await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        templateParams,
        emailJsUserId
      );

      console.log('Email sent successfully!', response.status, response.text);
      alert("Email sent successfully!");
    } catch (err) {
      console.error('Failed to send email:', err);
      alert("Failed to send email.");
    }
  };

  return (
    <div className="ticket-wrapper">
      <div
        className="ticket-container"
        style={{ backgroundImage: `url(${ticketImage})` }}
        id="ticket-container"
      >
        <div className="ticket-header">TICKET DETAILS</div>
        <div className="ticket-details">
          <p>
            <strong>Address:</strong> {address}
          </p>
          <p>
            <strong>Place:</strong> {place}
          </p>
          <div className="ticket-detail">Vehicle Type: {reservationData.vehicleType}</div>
          <div className="ticket-detail">Check-in: {reservationData.checkinDate}</div>
          <div className="ticket-detail">Check-out: {reservationData.checkoutDate}</div>
          <div className="ticket-detail">Check-in Time: {reservationData.checkinTime}</div>
          <div className="ticket-detail">Check-out Time: {reservationData.checkoutTime}</div>
          <div className="ticket-footer">Total Paid: ₹{totalAmount}</div>
        </div>
  
        <div className="qr-code">
          <QRCodeCanvas
            value={`Payment ID: ${paymentId}, Total: ₹${totalAmount}`}
            size={230}
            level="H"
          />
        </div>
      </div>
  
      {/* Button Container placed outside ticket-container */}
      <div className="button-container">
        <button className="ticket-button" onClick={downloadPDF}>
          Download Ticket PDF
        </button>
        <button className="ticket-button" onClick={sendEmail}>
          Send Ticket via Email
        </button>
      </div>
    </div>
  );
  
};

export default Ticket;


