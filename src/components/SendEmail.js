// src/components/SendEmail.js
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Import your Firebase config
import emailjs from 'emailjs-com';

const SendEmail = () => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser; // Get current user
    if (user) {
      setUserEmail(user.email); 
      console.log(user.email);// Set user email if logged in
    }
  }, []);

  const handleSendEmail = () => {
    if (!userEmail) {
      alert("No user logged in!");
      return;
    }

    const templateParams = {
      to_email: userEmail, // User's email
      subject: "Your Subject Here",
      message: "This is a test message sent to you!",
    };

    emailjs.send(, , templateParams, )
      .then((response) => {
        console.log('Email sent successfully:', response);
        alert("Email sent successfully!");
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        alert("Failed to send email.");
      });
  };

  return (
    <div>
      <h1>Send Email</h1>
      <button onClick={handleSendEmail}>Send Email to Me</button>
    </div>
  );
};

export default SendEmail;
