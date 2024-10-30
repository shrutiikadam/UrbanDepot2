import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import db, { auth, storage } from '../firebaseConfig'; 
import emailjs from 'emailjs-com';
import './Register.css';
import { onAuthStateChanged } from 'firebase/auth';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Tesseract from 'tesseract.js';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import './toastStyles.css'; 

const mapsApiKey = process.env.REACT_APP_MAPS_API_KEY;


const RegisterPlace = () => {
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [name,setName]=useState('');
  const [parkingNumber, setParkingNumber] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [landmark, setLandmark] = useState({ lat: null, lng: null });
  const [useLiveLocation, setUseLiveLocation] = useState(false);
  const [accessType, setAccessType] = useState('public');
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState(''); 
  const [currentStep, setCurrentStep] = useState(1);
  
  const [aashaarcard, setAadharCard] = useState(null);
  const [nocLetter, setNocLetter] = useState(null);
  const [buildingPermission, setBuildingPermission] = useState(null);
  const [placePicture, setPlacePicture] = useState(null);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const inputRef = useRef(null);

  const [aadharName, setAadharName] = useState(''); // State to hold the name extracted from Aadhar
  const [isAadharValid, setIsAadharValid] = useState(null); // State to track Aadhar validity


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserName(user.displayName || user.email.split('@')[0]);
      } else {
        setErrorMessage('No user is logged in. Please log in to register a place.');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    if (currentStep === 4) {
      window.initMap = () => {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
        });

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
        autocomplete.bindTo('bounds', map);

        markerRef.current = new window.google.maps.Marker({
          map: map,
          draggable: true,
          anchorPoint: new window.google.maps.Point(0, -29),
        });

        const setMarkerPosition = (location) => {
          markerRef.current.setPosition(location);
          markerRef.current.setVisible(true);
          setLandmark({ lat: location.lat(), lng: location.lng() });
        };

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) {
            window.alert('No details available for input: ' + place.name);
            return;
          }
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
          setMarkerPosition(place.geometry.location);
        });

        if (useLiveLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const liveLocation = new window.google.maps.LatLng(latitude, longitude);
              map.setCenter(liveLocation);
              setMarkerPosition(liveLocation);
            },
            (error) => {
              console.error("Error obtaining live location:", error);
              setErrorMessage('Unable to retrieve live location. Please enable location services.');
            }
          );
        }

        window.google.maps.event.addListener(markerRef.current, 'dragend', function () {
          const position = markerRef.current.getPosition();
          setLandmark({ lat: position.lat(), lng: position.lng() });
        });
      };

      loadScript(`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&libraries=places`);
    }
  }, [useLiveLocation, currentStep]);

  const handleSendEmail = async () => {
    if (!userEmail) {
      alert("No user logged in to send email to!");
      return;
    }
    
    const templateParams = {
      to_email: userEmail,
      subject: "Place Registration Successful",
      message: `You have successfully registered a new place named "${placeName}" at address: ${address}.`,
    };

    try {
      await emailjs.send('service_jqajw2l', 'template_od7gyfk', templateParams, 'lmjzjf2u4E96BI8-H');
      console.log('Email sent successfully');
      toast.success("Email sent successfully!",{
        style: {
          backgroundColor: '#28a745', // Success green
          color: '#fff',
          fontSize: '16px',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      alert("Failed to send email.");
    }
  };

  const processOCR = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m), // Log progress
      });
      console.log('Extracted text:', text); // Log extracted text to the console
      toast.success("Text extracted successfully!", {
        style: {
          backgroundColor: '#28a745',
          color: '#fff',
          fontSize: '16px',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error('Error during OCR processing:', error);
      toast.error("Failed to extract text from the document.", {
        style: {
          fontSize: '16px',
          borderRadius: '8px',
        },
      });
    }
  };

  // Function to upload a file to Firebase Storage and return the download URL
  const uploadFile = async (file) => {
    const storageRef = ref(storage, `documents/${userEmail}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setErrorMessage('No user is logged in. Please log in to register a place.');
      return;
    }
  
    if (!placeName || !address || !fromTime || !toTime || !fromDate || !toDate || !name ||
      (landmark.lat === null || landmark.lng === null) || !aashaarcard || !nocLetter || !buildingPermission || !placePicture) {  
      setErrorMessage('Please fill in all the required fields and upload all documents.');
      toast.error("Please fill in all the required fields and upload all documents.",{
        style: {
          fontSize: '16px',
          borderRadius: '8px',
          draggable: true,
        },
      })
      return;
    }
  
    try {
      // Upload files and get URLs
      const aashaarcardUrl = await uploadFile(aashaarcard);
      const nocLetterUrl = await uploadFile(nocLetter);
      const buildingPermissionUrl = await uploadFile(buildingPermission);
      const placePictureUrl = await uploadFile(placePicture);
  
      // Add verified: false to placeData
      const placeData = {
        placeName,
        address,
        name,
        parking_number: parkingNumber || 'N/A',
        availability: { from: fromTime, to: toTime },
        dateRange: { from: fromDate, to: toDate },
        landmark,
        accessType,
        verified: false, // Default value set here
        documents: {
          aashaarcard: aashaarcardUrl,
          nocLetter: nocLetterUrl,
          buildingPermission: buildingPermissionUrl,
          placePicture: placePictureUrl,
        },
      };
  
      const userDocRef = doc(db, 'users', userEmail);
      const registerDocRef = doc(userDocRef, 'register', `${placeName.replace(/\s+/g, '_')}-${Date.now()}`);
      await setDoc(registerDocRef, placeData);
  
      const placesDocRef = doc(db, 'places', placeName.replace(/\s+/g, '_'));
      await setDoc(placesDocRef, placeData);
  
      setErrorMessage('');
      handleSendEmail();
      setCurrentStep(1); // Reset to the first step after submission
    } catch (error) {
      console.error('Error registering place:', error);
      setErrorMessage('Error registering place. Please try again.');
    }
  };  

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    setter(file);
    processOCR(file);
};

// Function to validate Aadhaar number format
const isValidAadhaar = (aadhaarNumber) => {
  const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
  return aadhaarPattern.test(aadhaarNumber);
};

// Function to check if it is an Aadhaar card by looking for keywords
const isAadhaarCard = (ocrText) => {
  const keywords = [ "Aadhaar"];
  
  // Check if at least one of the keywords is found in the OCR text
  return keywords.some(keyword => ocrText.includes(keyword));
};

// Function to validate Aadhaar card by checking the number and keywords
const validateAadhaarCard = (ocrText) => {
  const aadhaarNumberMatch = ocrText.match(/\b[2-9]{1}[0-9]{11}\b/);
  
  if (aadhaarNumberMatch && isValidAadhaar(aadhaarNumberMatch[0]) && isAadhaarCard(ocrText)) {
    console.log("The uploaded document is a valid Aadhaar card.");
    // You can proceed with further logic here if it’s a valid Aadhaar card
  } else {
    console.log("The uploaded document is not a valid Aadhaar card.");
    // Handle invalid Aadhaar card case
  }
};

// Example usage with OCR extracted text
const ocrText = "Unique Identification Authority of India, Government of India, 234567890123, DOB: 01/01/1990";
validateAadhaarCard(ocrText);


  return (
    <div className='form123'>
      <div className="register-place-container">
        <h2>Place Registration Form</h2>
        {userName && <h3>HI, welcome {userName}</h3>}

        <div className="slider">
          <form onSubmit={handleSubmit} className="register-place-form">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="step">
                <div className="register-place-name">
                  <label>Place Name:</label>
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    required
                  />
                </div>
                <div className="register-place-address">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="your-name">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="button-container">
                  <button type="button" onClick={() => setCurrentStep(2)}>Next</button>
                </div>
              </div>
            )}

            {/* Step 2: Document Uploads */}
            {currentStep === 2 && (
              <div className="step">
                <div className="register-place-documents">
                <label>Upload Aadhaar Card:</label>
                <input type="file" onChange={(e) => handleFileChange(e, setAadharCard, true)} accept="image/*" required />
                </div>
                <div className="register-place-documents">
                  <label>Upload NOC Letter:</label>
                  <input type="file" onChange={(e) => handleFileChange(e, setNocLetter)} accept="image/*" required />
                </div>
                <div className="register-place-documents">
                  <label>Upload Building Permission Letter:</label>
                  <input type="file" onChange={(e) => handleFileChange(e, setBuildingPermission)} accept="image/*" required />
                </div>
                <div className="register-place-documents">
                  <label>Upload Picture of the Place:</label>
                  <input type="file" onChange={(e) => handleFileChange(e, setPlacePicture)} accept="image/*" required />
                </div>
                <div className="button-container">
                  <button type="button" onClick={() => setCurrentStep(1)}>Back</button>
                  <button type="button" onClick={() => setCurrentStep(3)}>Next</button>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="step">
                <div className="register-place-parking">
                  <label>Number of Parking Slots:</label>
                  <input
                    type="text"
                    value={parkingNumber}
                    onChange={(e) => setParkingNumber(e.target.value)}
                  />
                </div>
                <div className="register-place-availability">
                  <label>From Time:</label>
                  <input
                    type="time"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    required
                  />
                  <label>To Time:</label>
                  <input
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    required
                  />
                </div>
                <div className="register-place-date-range">
                  <label>From Date:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                  <label>To Date:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </div>
                <div className="button-container">
                  <button type="button" onClick={() => setCurrentStep(2)}>Back</button>
                  <button type="button" onClick={() => setCurrentStep(4)}>Next</button>
                </div>
              </div>
            )}

            {/* Step 4: Map */}
            {currentStep === 4 && (
              <div className="step">
                <h3>Set Location on the Map</h3>
                <div>
                  <input type="text" ref={inputRef} placeholder="Search for a place" />
                  <button type="button" onClick={() => setUseLiveLocation(!useLiveLocation)}>
                    {useLiveLocation ? 'Use Custom Location' : 'Use Live Location'}
                  </button>
                </div>
                <div ref={mapRef} className="map" style={{ width: '100%', height: '400px' }}></div>
                <div className="button-container">
                  <button type="button" onClick={() => setCurrentStep(3)}>Back</button>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          </form>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterPlace;
