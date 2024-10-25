import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firebase configuration
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'; // Import Firestore methods
import './ReservationForm.css';

const generateTimeOptions = () => {
  const options = [];
  const startTime = 0;
  const endTime = 24;
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

// Function to get the current local date in YYYY-MM-DD format
const getCurrentLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Country codes list
const countryCodes = [
  { code: '+1', name: 'United States' },
  { code: '+91', name: 'India' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+61', name: 'Australia' },
  { code: '+81', name: 'Japan' },
  // Add more country codes as needed
];

const ReservationForm = () => { // Removed userEmail from props
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const addressFromURL = queryParams.get('address') || ''; // Get address from URL
  const placeFromURL = queryParams.get('id') || ''; // Get place ID from URL



  const checkForOverlappingReservations = async () => {
    const reservationsRef = collection(db, 'places', formData.place, 'reservations');
    const q = query(reservationsRef, where("checkinDate", "==", formData.checkinDate));
    const snapshot = await getDocs(q);

    let isOverlapping = false;
    snapshot.forEach((doc) => {
      const existingReservation = doc.data();
      const existingCheckinTime = new Date(`${existingReservation.checkinDate}T${existingReservation.checkinTime}`);
      const existingCheckoutTime = new Date(`${existingReservation.checkoutDate}T${existingReservation.checkoutTime}`);
      const newCheckinTime = new Date(`${formData.checkinDate}T${formData.checkinTime}`);
      const newCheckoutTime = new Date(`${formData.checkoutDate}T${formData.checkoutTime}`);

      // Check for overlapping time
      if (
        (newCheckinTime >= existingCheckinTime && newCheckinTime < existingCheckoutTime) || // New check-in overlaps existing
        (newCheckoutTime > existingCheckinTime && newCheckoutTime <= existingCheckoutTime) || // New check-out overlaps existing
        (newCheckinTime <= existingCheckinTime && newCheckoutTime >= existingCheckoutTime) // New period completely overlaps existing
      ) {
        isOverlapping = true;
      }
    });

    return isOverlapping;
  };


  const [formData, setFormData] = useState({
    checkinDate: getCurrentLocalDate(),
    checkoutDate: getCurrentLocalDate(),
    checkinTime: '',
    checkoutTime: '',
    vehicleType: '',
    licensePlate: '',
    paymentMethod: '',
    name: '',
    email: '', // Start with an empty string instead of userEmail
    address: addressFromURL, // Autofill address here
    place: placeFromURL, // Autofill place here
    contactNumber: '',
    countryCode: '+91',
    termsAccepted: false,
  });

  const timeOptions = generateTimeOptions();

  // Update checkout date based on checkin date change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === 'checkinDate' && { checkoutDate: value }),
    }));
  };

  // Update checkout time based on checkin time
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === 'checkinTime' && { checkoutTime: '' }),
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Submitted');
    console.log('Form Data:', formData);
    // Validate contact number
    const cleanContactNumber = formData.contactNumber.replace(/\D/g, '');
    if (cleanContactNumber.length !== 10) {
      alert('Please enter a valid 10-digit contact number.');
      return;
    }


    const isOverlapping = await checkForOverlappingReservations();
    if (isOverlapping) {
      alert('This time slot is already booked. Please choose a different time.');
      return; // Exit if there's an overlap
    }
    const reservationData = {
      checkinDate: formData.checkinDate,
      checkoutDate: formData.checkoutDate,
      checkinTime: formData.checkinTime,
      checkoutTime: formData.checkoutTime,
      vehicleType: formData.vehicleType,
      licensePlate: formData.licensePlate,
      paymentMethod: formData.paymentMethod,
      name: formData.name,
      email: formData.email, // User-inputted email
      address: formData.address,
      place: formData.place,
      contactNumber: formData.contactNumber,
      countryCode: formData.countryCode,
      termsAccepted: formData.termsAccepted,
      checkin: `${formData.checkinDate} ${formData.checkinTime}`, // Combine date and time
      checkout: `${formData.checkoutDate} ${formData.checkoutTime}`, // Combine date and time
      createdAt: new Date().toISOString(), // Add timestamp
      total_amount: "50000", // Example amount in paise
    };

    try {
      const licensePlateId = `${formData.licensePlate}-${Date.now()}`;

      // Save reservation details to 'places' subcollection in Firestore
      await setDoc(doc(db, 'places', formData.place, 'reservations', licensePlateId), reservationData);

      // Save reservation details to 'users' subcollection in Firestore
      await setDoc(doc(db, 'users', formData.email, 'bookings', licensePlateId), reservationData);

      console.log("Reservation successfully saved!");

      // Navigate to the payment page
      navigate('/payment', { state: {address: formData.address, reservationData } });
    } catch (error) {
      console.error("Error saving reservation: ", error);
      alert("Error occurred while saving the reservation. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Parking Reservation Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contact Number:</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              style={{ marginRight: '1rem', width: '100px' }}
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.code} {country.name}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
              required
              pattern="\d{10}"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              required
              readOnly // Make it read-only to prevent editing
            />
          </div>
          <div className="form-group">
            <label>Place:</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              placeholder="Enter the place (e.g., Mumbai, Pune)"
              required
              readOnly // Make it read-only to prevent editing
            />
          </div>
        </div>

        <div className="date-row">
          <div className="form-group">
            <label>From Date:</label>
            <input
              type="date"
              name="checkinDate"
              value={formData.checkinDate}
              onChange={handleDateChange}
              required
            />
          </div>

          <div className="form-group">
            <label>To Date:</label>
            <input
              type="date"
              name="checkoutDate"
              value={formData.checkoutDate}
              min={formData.checkinDate}
              onChange={handleDateChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Check-In Time:</label>
          <select
            name="checkinTime"
            value={formData.checkinTime}
            onChange={handleTimeChange}
            required
          >
            <option value="">Select Check-In Time</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Check-Out Time:</label>
          <select
            name="checkoutTime"
            value={formData.checkoutTime}
            onChange={handleTimeChange}
            required
          >
            <option value="">Select Check-Out Time</option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Vehicle Type:</label>
          <input
            type="text"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            placeholder="Enter your vehicle type (e.g., Car, Bike)"
            required
          />
        </div>

        <div className="form-group">
          <label>License Plate:</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="Enter your vehicle's license plate"
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Method:</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              required
            />
            Accept Terms and Conditions
          </label>
        </div>

        <button type="submit" className="submit-button">Submit Reservation</button>
      </form>
    </div>
  );
};

export default ReservationForm;
