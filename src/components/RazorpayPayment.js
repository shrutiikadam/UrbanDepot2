import React, { useEffect, useState } from 'react'; // Import useState and useEffect
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import db from '../firebaseConfig'; // Adjust the path to your Firebase config
import './RazorpayPayment.css';
import emailjs from 'emailjs-com';

import { ToastContainer, toast } from 'react-toastify'; // Import toast functionalities
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles


const razorpayApiKey = process.env.REACT_APP_RAZORPAY_API_KEY;

const RazorpayPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure address, placeName, and reservationData from location.state
  const { 
    address, 
    place, 
    reservationData 
  } = location.state;

  // Extract reservation details
  const { 
    checkinDate, 
    checkoutDate, 
    checkinTime, 
    checkoutTime, 
    name, 
    email, 
    contactNumber,
    vehicleType 
  } = reservationData;

  const [ownerEmail, setOwnerEmail] = useState(''); 
  
  // State for owner's email
  useEffect(() => {
    if (!location.state || !place) {
      console.error("location.state or place is missing. Check if 'place' is correctly passed.");
      return;
    }
  
    const fetchOwnerEmail = async () => {
      try {
        const placeDocRef = doc(db, 'places', place);
        const placeDoc = await getDoc(placeDocRef);
        
        if (placeDoc.exists()) {
          const ownerEmail = placeDoc.data().ownerEmail;
          setOwnerEmail(ownerEmail);
          console.log('Owner Email:', ownerEmail);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error("Error fetching owner email:", error);
        toast.success("fetched owner's email");
      }
    };
  
    fetchOwnerEmail();
  }, [place, location.state]);
  

  // Function to calculate total amount based on time difference
  const calculateTotalAmount = () => {
    const checkin = new Date(`${checkinDate}T${checkinTime}`);
    const checkout = new Date(`${checkoutDate}T${checkoutTime}`);
    const differenceInHours = (checkout - checkin) / (1000 * 60 * 60); // Convert milliseconds to hours
    
    // Define hourly rates
    const hourlyRates = {
      bike: 20, // Hourly rate for bike in INR
      car: 30   // Hourly rate for car in INR
    };

    // Determine the hourly rate based on vehicle type
    const hourlyRate = vehicleType === 'car' ? hourlyRates.car : hourlyRates.bike;

    const platformFeePercentage = 0.05; // Platform fee of 5%
    
    const totalAmount = differenceInHours * hourlyRate * 100; // Convert to paise (assuming 1 INR = 100 paise)
    const platformFee = totalAmount * platformFeePercentage; // Calculate platform fee
    const finalTotalAmount = totalAmount + platformFee; // Final amount including platform fee

    return {
      hourlyRate,
      platformFee,
      totalAmount: finalTotalAmount.toFixed(0) // Return total amount as a string
    };
  };

  const { hourlyRate, platformFee, totalAmount } = calculateTotalAmount();

  const handlePayment = () => {

    const options = {
      key: razorpayApiKey,
      amount: totalAmount, // Use the total amount calculated
      currency: "INR",
      name: "UrbanDepot",
      description: "Parking Reservation Payment",
      handler: async function (response) {
        // On successful payment, navigate to the ticket page
        console.log('Payment Response:', response); // Log the payment response
        
        // Call sendEmailToOwner to send the email
        await sendEmailToOwner(response.razorpay_payment_id);
        
        navigate('/ticket', { 
          state: {
            paymentId: response.razorpay_payment_id,
            address,
            place,
            reservationData: {
              checkinDate,
              checkoutDate,
              checkinTime,
              checkoutTime,
              name,
              email,
              contactNumber,
              vehicleType
            },
            totalAmount: (totalAmount / 100).toFixed(2) // Total amount in INR
          }
        });
      },
      prefill: {
        name: name, // Use name from reservation data
        email: email, // Use email from reservation data
        contact: contactNumber, // Use contact number from reservation data
      },
      theme: {
        color: "#F37254"
      }
    };
  
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };
  
  const sendEmailToOwner = async (paymentId) => {
    console.log("Entered emailing function");
    const templateParams = {
      to_email: ownerEmail,
      user_name: name,
      user_email: email,
      contactnumber: contactNumber,
      place: place,
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      checkinTime: checkinTime,
      checkoutTime: checkoutTime,
      vehicleType: vehicleType,
      paymentId: paymentId,
      totalAmount: (totalAmount / 100).toFixed(2) // Total amount in INR
    };
  
    try {
      console.log("Sending email with parameters:", templateParams);
      const response = await emailjs.send(
        'service_dxp7k7a', // Replace with your EmailJS service ID
        'template_9jt8h3k', // Replace with your EmailJS template ID
        templateParams,
        'WfUPqJH0cRzftZSDI' // Replace with your EmailJS user ID
      );
      console.log('Email sent successfully!', response.status, response.text);
      toast.success('NOTIFIED THE OWNER SUCCESSFULY!'); // Show success alert
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email. Please try again.'); // Show error alert
    }
  };
  


  return (
    
    <div className="rzp-container">
      <h2 className="rzp-title">Pay with Razorpay</h2>
      <h4 className="rzp-subtitle">Reservation Details:</h4>
      <p className="rzp-paragraph"><strong>Address:</strong> {address}</p>
      <p className="rzp-paragraph"><strong>Place:</strong> {place}</p>
      <p className="rzp-paragraph">Check-in Date: {checkinDate}</p>
      <p className="rzp-paragraph">Check-out Date: {checkoutDate}</p>
      <p className="rzp-paragraph">Check-in Time: {checkinTime}</p>
      <p className="rzp-paragraph">Check-out Time: {checkoutTime}</p>
      <p className="rzp-paragraph">Vehicle Type: {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}</p>
      
      <div className="billing-details">
        <h4 className="rzp-bill-header">Billing Details:</h4>
        <div className="rzp-bill">
          <div className="rzp-bill-item">
            <span>Hourly Rate:</span>
            <span>₹{hourlyRate.toFixed(2)}</span>
          </div>
          <div className="rzp-bill-item">
            <span>Platform Fee (5%):</span>
            <span>₹{(platformFee / 100).toFixed(2)}</span>
          </div>
          <div className="rzp-bill-item">
            <span>Total Amount:</span>
            <span>₹{(totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
  
      <button className="rzp-button" onClick={handlePayment}>Pay Now</button>
      <ToastContainer/>
      </div>
    
  );
};

export default RazorpayPayment;
