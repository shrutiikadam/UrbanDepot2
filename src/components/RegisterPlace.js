import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import db, { auth } from '../firebaseConfig';
import emailjs from 'emailjs-com';
import './Register.css';
import { onAuthStateChanged } from 'firebase/auth';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ToastContainer, toast } from 'react-toastify'; // Import toast functionalities
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const mapsApiKey = process.env.REACT_APP_MAPS_API_KEY;

const emailJsServiceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const emailJsTemplateId = process.env.REACT_APP_EMAILJS_REGISTER;
const emailJsUserId = process.env.REACT_APP_EMAILJS_USER_ID;



const RegisterPlace = () => {
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
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
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState('1'); // State to store user's name // Step tracking
  const [slideDirection, setSlideDirection] = useState('');
  const [ownerEmail, setOwnerEmail] = useState(''); 
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const inputRef = useRef(null); // Reference for the search input
  const [prevStep, setPrevStep] = useState(null); // Track the previous step to determine the direction
  const [animationDirection, setAnimationDirection] = useState('next');
  const circles=document.querySelectorAll(".timeline-circle");
  const timeline1=document.querySelectorAll(".timeline-step");
  const buttons=document.querySelectorAll("button");


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserEmail(user.email); // Set user email from Firebase
      setOwnerEmail(user.email); // Autofill owner's email
      setUserName(user.displayName || user.email.split('@')[0]); // Set user name or fallback to email
    } else {
      setErrorMessage('No user is logged in. Please log in to register a place.');
    }
  });

    return () => unsubscribe(); // Cleanup subscription
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
          center: { lat: 20.5937, lng: 78.9629 }, // Default center
          zoom: 5,
        });
  
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);
        autocomplete.bindTo('bounds', map);
  
        markerRef.current = new window.google.maps.Marker({
          map: map,
          draggable: true,
          anchorPoint: new window.google.maps.Point(0, -29),
        });
  
        // Function to set marker position and update landmark
        const setMarkerPosition = (location) => {
          markerRef.current.setPosition(location);
          markerRef.current.setVisible(true);
          setLandmark({ lat: location.lat(), lng: location.lng() });
        };
  
        // Autocomplete listener
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
  
        // Live location logic
        if (useLiveLocation && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const liveLocation = new window.google.maps.LatLng(latitude, longitude);
              map.setCenter(liveLocation);
              setMarkerPosition(liveLocation);
              console.log("Live location:", { latitude, longitude });
            },
            (error) => {
              console.error("Error obtaining live location:", error);
              setErrorMessage('Unable to retrieve live location. Please enable location services.');
            }
          );
        }
  
        // Marker drag listener
        window.google.maps.event.addListener(markerRef.current, 'dragend', function () {
          const position = markerRef.current.getPosition();
          setLandmark({ lat: position.lat(), lng: position.lng() });
        });
      };
  
      loadScript(`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&libraries=places`);
    }
  }, [useLiveLocation, currentStep]);
  
  

  // Email notification function
  const handleSendEmail = async () => {
    if (!userEmail) {
      alert("No user logged in to send email to!");
      return;
    }

    const templateParams = {
      to_email: ownerEmail,
      message: `You have successfully registered a new place named "${placeName}" at address: ${address}.`,
    };

    try {
      await emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        templateParams,
        emailJsUserId
      );
      console.log('Email sent successfully');
      toast.success("Email sent successfully!");
        } catch (error) {
      console.error('Failed to send email:', error);
      alert("Failed to send email.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setErrorMessage('No user is logged in. Please log in to register a place.');

      return;
    }

  
    // Log submitted values for debugging
    console.log('Submitting with the following values:');
    console.log('User Email:', userEmail);

    console.log('Submitting with the following values:');
    console.log('Place Name:', placeName);
    console.log('Address:', address);
    console.log('Parking Number:', parkingNumber);
    console.log('From Time:', fromTime);
    console.log('To Time:', toTime);
    console.log('From Date:', fromDate);
    console.log('To Date:', toDate);
    console.log('Landmark Coordinates:', landmark);
    console.log('Access Type:', accessType);

    if (!placeName || !address || !fromTime || !toTime || !fromDate || !toDate ||
        (landmark.lat === null || landmark.lng === null)) {
        toast.error("Please fill in all the required fields.");
        return;
    }

    const placeData = {
        placeName,
        address,
        parking_number: parkingNumber || 'N/A',
        availability: { from: fromTime, to: toTime },
        dateRange: { from: fromDate, to: toDate },
        landmark,
        accessType,
        ownerEmail
    };


    try {
        const userDocRef = doc(db, 'users', userEmail);
        const registerDocRef = doc(userDocRef, 'register', `${placeName.replace(/\s+/g, '_')}-${Date.now()}`);
        await setDoc(registerDocRef, placeData);

        const placesDocRef = doc(db, 'places', placeName.replace(/\s+/g, '_'));
        await setDoc(placesDocRef, placeData);

        setErrorMessage('');
        handleSendEmail();
        setCurrentStep(1);
    } catch (error) {
        console.error('Error registering place:', error);
        toast.error("error");
        setErrorMessage('Error registering place. Please try again.');
        toast.error("error");
      }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setSlideDirection('out-left'); // Current slide moves left (exiting)
      setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1); // Move to next step
        setSlideDirection('in-right'); // New slide comes in from right (entering)
      }, 500); // Delay to let the slide-out animation complete
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setSlideDirection('out-right'); // Current slide moves right (exiting)
      setTimeout(() => {
        setCurrentStep((prevStep) => prevStep - 1); // Move to previous step
        setSlideDirection('in-left'); // New slide comes in from left (entering)
      }, 500); // Delay to let the slide-out animation complete
    }
  };
  

  
  return (
    <>
      <ToastContainer /> {/* Place the ToastContainer at the top level of your component */}
      <div className='form123'>
        <div className="register-place-container">
          <h2>Place Registration Form</h2>
          {userName && <h3>HI, welcome {userName}</h3>} {/* Displaying user's name */}

          {/* Timeline */}
          <div className="timeline">
            <div className={`timeline-step ${currentStep >= 1 ? 'completed' : ''}`}>
              <div className={`timeline-circle ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed-check' : ''}`}>
                {currentStep > 1 ? <span className="fas fa-check"></span> : '1'}
              </div>
              <p>Address</p>
            </div>

            <div className={`timeline-line ${currentStep > 1 ? 'filled' : ''}`}></div>

            <div className={`timeline-step ${currentStep >= 2 ? 'completed' : ''}`}>
              <div className={`timeline-circle ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed-check' : ''}`}>
                {currentStep > 2 ? <span className="fas fa-check"></span> : '2'}
              </div>
              <p>Details</p>
            </div>

            <div className={`timeline-line ${currentStep > 2 ? 'filled' : ''}`}></div>

            <div className={`timeline-step ${currentStep >= 3 ? 'completed' : ''}`}>
              <div className={`timeline-circle ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed-check' : ''}`}>
                {currentStep > 3 ? <span className="fas fa-check"></span> : '3'}
              </div>
              <p>Duration</p>
            </div>

            <div className={`timeline-line ${currentStep > 3 ? 'filled' : ''}`}></div>

            <div className={`timeline-step ${currentStep >= 4 ? 'completed' : ''}`}>
              <div className={`timeline-circle ${currentStep === 4 ? 'active' : ''}`}>
                4
              </div>
              <p>Location</p>
            </div>
          </div>

          <div className="slider">
            <form onSubmit={handleSubmit} className="register-place-form">
              <div className={`step-container ${currentStep === 1 ? 'active' : ''}`}>
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
                    <div className="register-owner-email">
                      <label>Owner's Email:</label>
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)} // Keep it editable
                        required
                      />
                    </div>

                    <div className="button-container">
                      <button type="button" onClick={handleNextStep}>Next</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`step-container ${currentStep === 2 ? 'active' : ''}`}>
                {currentStep === 2 && (
                  <div className="step">
                    <div className="register-place-parking-number">
                      <label>Parking Number (if any):</label>
                      <input
                        type="text"
                        value={parkingNumber}
                        onChange={(e) => setParkingNumber(e.target.value)}
                      />
                    </div>
                    <div className="register-place-time">
                      <label>From:</label>
                      <input
                        type="time"
                        value={fromTime}
                        onChange={(e) => setFromTime(e.target.value)}
                        required
                      />
                      <label>To:</label>
                      <input
                        type="time"
                        value={toTime}
                        onChange={(e) => setToTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="button-container">
                      <button type="button" onClick={handlePrevStep}>Back</button>
                      <button type="button" onClick={handleNextStep}>Next</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`step-container ${currentStep === 3 ? 'active' : ''}`}>
                {currentStep === 3 && (
                  <div className="step">
                    <div className="register-place-date">
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
                    <div className="access-type">
                      <label>Access Type:</label>
                      <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="button-container">
                      <button type="button" onClick={handlePrevStep}>Back</button>
                      <button type="button" onClick={handleNextStep}>Next</button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`step-container ${currentStep === 4 ? 'active' : ''}`}>
                {currentStep === 4 && (
                  <div className="step">
                    <div className="register-place-location">
                      <label>Location:</label>
                      <input
                        type="text"
                        ref={inputRef}
                        placeholder="Search for a location"
                      />
                      <div ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
                    </div>
                    <div className="live-location">
                      <label>
                        <input
                          type="checkbox"
                          checked={useLiveLocation}
                          onChange={(e) => setUseLiveLocation(e.target.checked)}
                        />
                        Use my live location
                      </label>
                    </div>
                    <div className="button-container">
                      <button type="button" onClick={handlePrevStep}>Back</button>
                      <button type="submit">Submit</button>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPlace;