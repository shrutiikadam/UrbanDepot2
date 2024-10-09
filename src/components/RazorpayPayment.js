// src/components/RazorpayPayment.js
import React from 'react';
const razorpayApiKey = process.env.REACT_APP_RAZORPAY_API_KEY;
const RazorpayPayment = () => {
  const handlePayment = () => {
    const options = {
      "key": razorpayApiKey,
      "amount": "50000",
      "currency": "INR",
      "name": "UrbanDepot",
      "description": "Test Transaction",
      "handler": function (response) {
        alert(`Payment ID: ${response.razorpay_payment_id}`);
      },
      "prefill": {
        "name": "Shruti Kadam",
        "email": "shruti.kadam@example.com",
        "contact": "9321530038"
      },
      "theme": {
        "color": "#F37254"
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div>
      <h2>Pay with Razorpay</h2>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default RazorpayPayment;
