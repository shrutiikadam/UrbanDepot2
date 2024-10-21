import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import db, { auth } from '../firebaseConfig';
import emailjs from 'emailjs-com';
import './Register.css';
const mapsApiKey = process.env.REACT_APP_MAPS_API_KEY;

const RegisterPlace = () => {
  const [address, setAddress] = useState('');
  const [charge, setCharge] = useState('');
  const [parkingNumber, setParkingNumber] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [fromDate, setFromDate] = useState(''); // State for "from" date
  const [toDate, setToDate] = useState(''); // State for "to" date
  const [landmark, setLandmark] = useState({ lat: null, lng: null });
  const [useLiveLocation, setUseLiveLocation] = useState(false);
  const [accessType, setAccessType] = useState('public');
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      console.log('Logged-in user email:', user.email);
    }
  }, []);

  useEffect(() => {
    if (!useLiveLocation) {
      const loadScript = (src) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      };

      window.initMap = () => {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
        });

        const input = document.getElementById('pac-input');
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        markerRef.current = new window.google.maps.Marker({
          map: map,
          draggable: true,
          anchorPoint: new window.google.maps.Point(0, -29),
        });

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

          markerRef.current.setPosition(place.geometry.location);
          markerRef.current.setVisible(true);

          setLandmark({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        });

        window.google.maps.event.addListener(markerRef.current, 'dragend', function () {
          const position = markerRef.current.getPosition();
          setLandmark({ lat: position.lat(), lng: position.lng() });
        });
      };

      loadScript(`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&libraries=places`);
    }
  }, [useLiveLocation]);

  const handleSendEmail = async () => {
    if (!userEmail) {
      alert("No user logged in to send email to!");
      return;
    }

    const templateParams = {
      to_email: userEmail,
      subject: "Place Registration Successful",
      message: `You have successfully registered a new place at address: ${address}.`,
    };

    try {
      await emailjs.send(, , templateParams, );
      console.log('Email sent successfully');
      alert("Email sent successfully!");
    } catch (error) {
      console.error('Failed to send email:', error);
      alert("Failed to send email.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address || !charge || !fromTime || !toTime || !landmark.lat || !landmark.lng || !fromDate || !toDate) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    const placeData = {
      address: address,
      charge: charge,
      parking_number: parkingNumber || 'N/A',
      availability: { from: fromTime, to: toTime },
      dateRange: { from: fromDate, to: toDate }, // Include date range
      landmark: landmark,
      accessType: accessType,
    };

    try {
      await setDoc(doc(db, 'users', userEmail, 'register', `${address.replace(/\s+/g, '_')}-${Date.now()}`), placeData);
      const placesDocRef = doc(db, 'places', address.replace(/\s+/g, '_'));
      await setDoc(placesDocRef, placeData);

      setErrorMessage('');
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

        <label>From Date:</label> {/* New "from date" field */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          required
        />

        <label>To Date:</label> {/* New "to date" field */}
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          required
        />

        <label>Access Type:</label>
        <select value={accessType} onChange={(e) => setAccessType(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

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
          <button type="button" onClick={() => setUseLiveLocation(true)}>
            Fetch Current Location
          </button>
        ) : (
          <div>
            <input id="pac-input" className="controls" type="text" placeholder="Search Box" />
            <div ref={mapRef} id="map" style={{ height: '400px', width: '100%' }}></div>
          </div>
        )}

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button type="submit">Register Place</button>
      </form>
    </div>
  );
};

export default RegisterPlace;
