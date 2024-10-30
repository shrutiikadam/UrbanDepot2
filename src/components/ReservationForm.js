import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import Tesseract from 'tesseract.js'; // Import Tesseract.js
import './ReservationForm.css';


// Generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(time);
    }
  }
  return options;
};

// Get current local date in YYYY-MM-DD format
const getCurrentLocalDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
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

const ReservationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const addressFromURL = queryParams.get('address') || '';
  const placeFromURL = queryParams.get('id') || '';
  const [ocrText, setOcrText] = useState('');
  const [step, setStep] = useState(1); // Track the current step
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [licenseValidationMessage, setLicenseValidationMessage] = useState(''); // State for license validation message
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    countryCode: '+91',
    checkinDate: getCurrentLocalDate(),
    checkoutDate: getCurrentLocalDate(),
    checkinTime: '',
    checkoutTime: '',
    vehicleType: '',
    licensePlate: '',
    paymentMethod: 'credit_card', // Default value
    termsAccepted: false,
    licensePhoto: null, // To store the uploaded license photo
    platePhoto: null, // To store the uploaded plate photo
    address: addressFromURL,
    place: placeFromURL,
    createdAt: new Date().toISOString(), // Capture creation date
    total_amount: "50000", // Example amount in paise
    extractedName: '' // To store the extracted name from the license
  });

  const timeOptions = generateTimeOptions();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
      }));

      // Run OCR on the license photo to validate it
      if (name === 'licensePhoto') {
        const text = await runOCR(files[0]);
        if (text) {
          setFormData((prevData) => ({
            ...prevData,
            extractedName: text.trim() // Store the extracted name for comparison
          }));
        }
      }
    }
  };

  // Function to run OCR
  const runOCR = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });

      setOcrText(text); // Set the OCR text to state

      const nameMatch = text.match(/name\s*:\s*([a-zA-Z\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        const extractedName = nameMatch[1].trim();
        setFormData((prevData) => ({
          ...prevData,
          extractedName: extractedName
        }));
      } else {
        setLicenseValidationMessage('Name not found on the license. Please ensure the photo is clear and properly scanned.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setLicenseValidationMessage('Error during OCR processing. Please try again.');
    }
  };

  const validateLicense = () => {
    const nameMatch = ocrText.match(/name\s*:\s*([a-zA-Z\s]+)/i);
    const normalizedExtractedName = nameMatch && nameMatch[1]
      ? nameMatch[1].replace(/\s+/g, ' ').trim().toUpperCase() // Normalize extracted name
      : '';

    const normalizedUserName = formData.name
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim() // Remove leading/trailing whitespace
      .toUpperCase(); // Convert to uppercase

    // Clean names to remove non-ASCII characters
    const cleanedExtractedName = normalizedExtractedName.replace(/[^\x20-\x7E]/g, '');
    const cleanedUserName = normalizedUserName.replace(/[^\x20-\x7E]/g, '');

    console.log("Extracted Name:", cleanedExtractedName);
    console.log("User Name:", cleanedUserName);

    // Compare while allowing for trailing characters
    const namesMatch = cleanedExtractedName.startsWith(cleanedUserName);

    if (!namesMatch) {
        console.error("Names do not match:", cleanedExtractedName, "!==", cleanedUserName);
    } else {
        console.log("Names match!");
    }

    return namesMatch;
};

const isValidLicense = (text) => {
  const keywords = [
      'DRIVER LICENSE',
      'LICENSE',
      'IDENTIFICATION',
      'ID',
      'DEPARTMENT OF MOTOR VEHICLES',
      'DMV',
      // Add more relevant terms based on your region or requirements
  ];

  const regex = new RegExp(keywords.join('|'), 'i');
  return regex.test(text);
};

  
  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setErrorMessage('');
    setLicenseValidationMessage('');

    // Calculate the start and end times for the reservation
    const requestedCheckin = new Date(`${formData.checkinDate}T${formData.checkinTime}:00`);
    const requestedCheckout = new Date(`${formData.checkoutDate}T${formData.checkoutTime}:00`);

    // Validate the license name against the user's name
    if (!validateLicense()) {
      setLicenseValidationMessage('The name on the license does not match the provided name. Please upload a valid license.');
      return;
    }

    try {
      // Check for existing reservations that conflict with the requested times
      const reservationsRef = collection(db, 'places', formData.place, 'reservations');
      const snapshot = await getDocs(reservationsRef);
      
      let conflict = false;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const existingCheckin = new Date(data.checkin);
        const existingCheckout = new Date(data.checkout);

        // Check for overlap
        if (
          (requestedCheckin >= existingCheckin && requestedCheckin < existingCheckout) || // New check-in is during existing reservation
          (requestedCheckout > existingCheckin && requestedCheckout <= existingCheckout) || // New check-out is during existing reservation
          (requestedCheckin <= existingCheckin && requestedCheckout >= existingCheckout) // New reservation fully covers existing
        ) {
          conflict = true;
        }
      });

      if (conflict) {
        setErrorMessage('This time slot is already booked. Please choose a different time.');
        return; // Exit early if there’s a conflict
      }

      // Prepare to upload files to Firebase Storage
      const licensePhotoRef = ref(storage, `licenses/${formData.licensePlate}-${Date.now()}.jpg`);
      const platePhotoRef = ref(storage, `plates/${formData.licensePlate}-${Date.now()}.jpg`);

      // Upload the files
      const licenseUploadTask = uploadBytes(licensePhotoRef, formData.licensePhoto);
      const plateUploadTask = uploadBytes(platePhotoRef, formData.platePhoto);

      // Wait for both uploads to complete
      const [licenseSnapshot, plateSnapshot] = await Promise.all([licenseUploadTask, plateUploadTask]);

      // Get download URLs
      const licensePhotoURL = await getDownloadURL(licenseSnapshot.ref);
      const platePhotoURL = await getDownloadURL(plateSnapshot.ref);

      // Prepare reservation data
      const reservationData = {
        ...formData,
        licensePhoto: licensePhotoURL,
        platePhoto: platePhotoURL,
        checkin: `${formData.checkinDate} ${formData.checkinTime}`,
        checkout: `${formData.checkoutDate} ${formData.checkoutTime}`,
      };

      const licensePlateId = `${formData.licensePlate}-${Date.now()}`;

      // Save reservation details to Firestore
      await setDoc(doc(db, 'places', formData.place, 'reservations', licensePlateId), reservationData);
      await setDoc(doc(db, 'users', formData.email, 'bookings', licensePlateId), reservationData);

      console.log("Reservation successfully saved!");
      navigate('/payment', { state: { address: formData.address,place:formData.place ,reservationData } });
    } catch (error) {
      console.error("Error saving reservation: ", error);
      alert("Error occurred while saving the reservation. Please try again.");
    }
  };

  // Render steps based on current step
  const renderStep = () => {
    return (
      <div>
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Error message display */}
        {licenseValidationMessage && <div className="license-validation-message">{licenseValidationMessage}</div>} {/* License validation message */}
        {step === 1 && (
          <>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
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
            <button onClick={handleNextStep}>Next</button>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Reservation Dates</h2>
            <div className="form-group">
              <label>From Date:</label>
              <input
                type="date"
                name="checkinDate"
                value={formData.checkinDate}
                onChange={handleChange}
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
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-in Time:</label>
              <select name="checkinTime" value={formData.checkinTime} onChange={handleChange} required>
                <option value="">Select Time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Check-out Time:</label>
              <select name="checkoutTime" value={formData.checkoutTime} onChange={handleChange} required>
                <option value="">Select Time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <button onClick={handlePrevStep}>Back</button>
            <button onClick={handleNextStep}>Next</button>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Vehicle Information</h2>
            <div className="form-group">
              <label>Vehicle Type:</label>
              <input type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>License Plate:</label>
              <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Upload License Photo:</label>
              <input type="file" name="licensePhoto" accept="image/*" onChange={handleFileChange} required />
            </div>
            <div className="form-group">
              <label>Upload Plate Photo:</label>
              <input type="file" name="platePhoto" accept="image/*" onChange={handleFileChange} required />
            </div>
            <button onClick={handlePrevStep}>Back</button>
            <button onClick={handleSubmit}>Submit</button>
          </>
        )}
      </div>
    );
  };

  return (
    <form>
      {renderStep()}
    </form>
  );
};

export default ReservationForm;
