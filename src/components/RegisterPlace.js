import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import db, { auth } from '../firebaseConfig'; // Import your Firestore and auth instances
import emailjs from 'emailjs-com'; // Import emailjs
import './Register.css'

const RegisterPlace = () => {
  const [address, setAddress] = useState('');
  const [charge, setCharge] = useState('');
  const [parkingNumber, setParkingNumber] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [landmark, setLandmark] = useState({ lat: null, lng: null });
  const [useLiveLocation, setUseLiveLocation] = useState(false); // Option to toggle live location
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [userEmail, setUserEmail] = useState(''); // State for storing user's email
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const markerRef = useRef(null); // Reference for the marker

  useEffect(() => {
    const user = auth.currentUser; // Get the current user
    if (user) {
      setUserEmail(user.email); // Set the logged-in user's email
    }
  }, []);

  useEffect(() => {
    if (useLiveLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          setLandmark({ lat: latitude, lng: longitude });
        }, (error) => {
          console.error("Error fetching location:", error);
          alert("Unable to retrieve your location. Please allow location access.");
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    } else {
      const loadScript = (src) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      };

      window.initMap = () => {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // Default centered location (India)
          zoom: 5,
        });

        const input = document.getElementById("pac-input");
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", map);

        markerRef.current = new window.google.maps.Marker({
          map: map,
          draggable: true, // Allow dragging the marker
          anchorPoint: new window.google.maps.Point(0, -29),
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
          }

          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }

          markerRef.current.setPosition(place.geometry.location);
          markerRef.current.setVisible(true);

          setLandmark({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        });

        window.google.maps.event.addListener(markerRef.current, 'dragend', function () {
          const position = markerRef.current.getPosition();
          setLandmark({ lat: position.lat(), lng: position.lng() });
        });
      };

      loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBjTZXOhNWhf1Bu_ez9zanz0mAiDXJAG8I&callback=initMap&libraries=places");
    }
  }, [useLiveLocation]);

  const handleSendEmail = async () => {
    if (!userEmail) {
      alert("No user logged in to send email to!");
      return;
    }

    const templateParams = {
      to_email: userEmail, // User's email
      subject: "Place Registration Successful",
      message: `You have successfully registered a new place at address: ${address}.`,
    };

    try {
      await emailjs.send('service_jqajw2l', 'template_od7gyfk', templateParams, 'lmjzjf2u4E96BI8-H');
      console.log('Email sent successfully');
      alert("Email sent successfully!");
    } catch (error) {
      console.error('Failed to send email:', error);
      alert("Failed to send email.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for missing required fields (except Parking Number)
    if (!address || !charge || !fromTime || !toTime || !landmark.lat || !landmark.lng) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    const placeData = {
      address: address,
      charge: charge,
      parking_number: parkingNumber || 'N/A', // Optional field
      availability: { from: fromTime, to: toTime }, // Store from and to under one field called availability
      landmark: landmark, // Store landmark (lat, lng)
    };

    try {
      await addDoc(collection(db, 'places'), placeData);
      console.log('Place registered successfully');
      setErrorMessage(''); // Clear error message on successful submission

      // Send email after successful registration
      handleSendEmail();
    } catch (error) {
      console.error('Error registering place:', error);
      setErrorMessage('Error registering place. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Register Place</h2>
      <form onSubmit={handleSubmit}>
        <label>Address:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <label>Charge:</label>
        <input
          type="number"
          value={charge}
          onChange={(e) => setCharge(e.target.value)}
          required
        />

        <label>Parking Number (if any):</label>
        <input
          type="text"
          value={parkingNumber}
          onChange={(e) => setParkingNumber(e.target.value)}
        />

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

        <label>Landmark:</label>
        <div>
          <input
            type="radio"
            id="liveLocation"
            name="landmarkOption"
            value="live"
            checked={useLiveLocation}
            onChange={() => setUseLiveLocation(true)}
          />
          <label htmlFor="liveLocation">Use Live Location</label>

          <input
            type="radio"
            id="searchLocation"
            name="landmarkOption"
            value="search"
            checked={!useLiveLocation}
            onChange={() => setUseLiveLocation(false)}
          />
          <label htmlFor="searchLocation">Search for Landmark</label>
        </div>

        {useLiveLocation ? (
          <button type="button" onClick={() => setUseLiveLocation(true)}>Fetch Current Location</button>
        ) : (
          <>
            <input id="pac-input" ref={searchBoxRef} type="text" placeholder="Search Landmark" />
            <div id="map" ref={mapRef} style={{ height: "300px", width: "100%", marginTop: "10px" }}></div>
          </>
        )}

        <button type="submit">Register</button>
      </form>

      {/* Error message if required fields are missing */}
      {errorMessage && (
        <p style={{ color: 'red' }}>{errorMessage}</p>
      )}

      {/* Show selected location */}
      {landmark.lat && landmark.lng && (
        <p>
          Selected Landmark: Latitude: {landmark.lat}, Longitude: {landmark.lng}
        </p>
      )}
    </div>
  );
};

export default RegisterPlace;
