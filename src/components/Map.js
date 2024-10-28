import React, { useEffect, useRef, useState } from "react";
import './Map.css';
import FetchLatLng from './FetchLatLng';

const mapsApiKey = process.env.REACT_APP_MAPS_API_KEY;

const Map = () => {
    const [places, setPlaces] = useState([]);
    const mapRef = useRef(null);
    const [userMarker, setUserMarker] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState({});
    const [searchMarkers, setSearchMarkers] = useState([]); // State to hold markers
    const [directionsSteps, setDirectionsSteps] = useState([]); 
    const [loading, setLoading] = useState(true); // Loading state

    const onFetchPlaces = (newPlaces) => {
        console.log("Fetched places:", newPlaces);
        setPlaces(newPlaces);
    };

    useEffect(() => {
        const loadScript = (src) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        };

        window.initMap = () => {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 19.0760, lng: 72.8777 }, // Centered on Mumbai
                zoom: 11,
            });

            setMapInstance(map);
            setLoading(false); // Map loading finished

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    const userMarkerInstance = new window.google.maps.Marker({
                        position: userLocation,
                        map,
                        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    });
                    setUserMarker(userMarkerInstance);
                    map.setCenter(userLocation);
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }

            const renderer = new window.google.maps.DirectionsRenderer();
            renderer.setMap(map);
            setDirectionsRenderer(renderer);
        };

        loadScript(`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&libraries=places`);
    }, []);

    const searchNearbyPlaces = () => {
        const searchInput = document.getElementById("pac-input").value;
        if (!searchInput) {
            alert("Please enter a location to search.");
            return;
        }
    
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchInput }, (results, status) => {
            if (status === "OK" && results[0]) {
                const searchLocation = results[0].geometry.location;
                const searchRadius = 10000; // 10 km radius
    
                // Filter places within the search radius based on distance to search location
                const filteredPlaces = places.filter((place) => {
                    const placeLocation = new window.google.maps.LatLng(place.lat, place.lng);
                    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                        searchLocation,
                        placeLocation
                    );
    
                    return distance <= searchRadius;
                });
    
                // Use filtered places and apply additional filters (time, date, access type) if needed
                filterPlacesByCriteria(filteredPlaces, searchLocation);
            } else {
                alert("Could not find location: " + status);
            }
        });
    };
    
    // Modify filterPlacesByCriteria to accept filtered places
    const filterPlacesByCriteria = (filteredPlaces = places, searchLocation) => {
        const fromTime = document.getElementById("from-time").value;
        const toTime = document.getElementById("to-time").value;
        const fromDate = document.getElementById("from-date").value;
        const toDate = document.getElementById("to-date").value;
        const selectedAccessType = document.getElementById("access-type").value;
    
        // Parse time and date values
        const fromTimeDate = new Date(`1970-01-01T${fromTime}:00Z`);
        const toTimeDate = new Date(`1970-01-01T${toTime}:00Z`);
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
    
        // Filter based on criteria, using only places within the search radius
        const finalFilteredPlaces = filteredPlaces.filter(place => {
            if (!place.availability || !place.dateRange) return false;
    
            const placeFromTime = new Date(`1970-01-01T${place.availability.from}:00Z`);
            const placeToTime = new Date(`1970-01-01T${place.availability.to}:00Z`);
            const placeDateRangeFrom = new Date(place.dateRange.from);
            const placeDateRangeTo = new Date(place.dateRange.to);
            const isTimeValid = fromTimeDate >= placeFromTime && toTimeDate <= placeToTime;
            const isDateValid = placeDateRangeFrom <= toDateObj && placeDateRangeTo >= fromDateObj;
            const isAccessTypeValid = selectedAccessType === "" || place.accessType === selectedAccessType;
    
            return isTimeValid && isDateValid && isAccessTypeValid;
        });
    
        updateMapMarkers(finalFilteredPlaces, searchLocation);
    };
    
    const updateMapMarkers = (filteredPlaces, searchLocation) => {
        if (!mapInstance) {
            console.error("Map instance is not initialized.");
            return;
        }
    
        searchMarkers.forEach(marker => marker.setMap(null));
        setSearchMarkers([]);
    
        filteredPlaces.forEach(place => {
            const marker = new window.google.maps.Marker({
                position: { lat: place.lat, lng: place.lng },
                map: mapInstance,
                title: place.address || place.id,
            });
    
            marker.addListener("click", () => {
                setSelectedPlace(place);
                setPopupVisible(true);
            });
    
            setSearchMarkers(prevMarkers => [...prevMarkers, marker]);
        });
    
        if (searchLocation) {
            mapInstance.setCenter(searchLocation);
            mapInstance.setZoom(13); // Optional: Adjust zoom level based on proximity
        }
    };
    

     const getDirections = () => {
        if (!directionsRenderer || !userMarker || !selectedPlace) {
            alert("Ensure a place is selected and user location is detected.");
            return;
        }

        const travelModeSelect = document.getElementById("travel-mode");
        const travelMode = travelModeSelect.value || window.google.maps.TravelMode.DRIVING; // Default to DRIVING

        const request = {
            origin: userMarker.getPosition(), // User's current location
            destination: { lat: selectedPlace.lat, lng: selectedPlace.lng }, // Selected place
            travelMode: travelMode,
        };
        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(request, (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
                directionsRenderer.setMap(mapInstance); // Render route on the map

                // Extract and set directions steps
                const steps = result.routes[0].legs[0].steps.map((step, index) => (
                    <li key={index}>{step.instructions.replace(/<[^>]*>/g, "")} - {Math.round(step.distance.value / 1000)} km</li>
                ));
                setDirectionsSteps(steps);
            } else {
                alert("Directions request failed due to " + status);
            }
        });
    };

    const proceedToBook = (place) => {
        const query = `?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.id)}&charge=${place.chargeAvailability}&id=${selectedPlace.id}&address=${place.address}`;
        window.location.href = `/reservation${query}`;
    };

    return (
        <div className="map-container">
        <div className="map-search">
        <h1><center>Find your perfect parking spot on UrbanDepot </center></h1>
            <div className="park-search-div">
                <label>
                    <span>Locality for parking</span>
                    <input id="pac-input" type="text" placeholder="Anywhere" />
                </label>
            </div>
            <select id="travel-mode">
  <option value="DRIVING">Driving</option>
  <option value="WALKING">Walking</option>
  <option value="BICYCLING">Bicycling</option>
  <option value="TRANSIT">Transit</option>
</select>

            <div className="map-row-2">
                <div className="date">
                    <div className="from-date">
                        <label>From Date:</label>
                        <input type="date" id="from-date" />
                    </div>
                    <div className="to-date">
                        <label>To Date:</label>
                        <input type="date" id="to-date" />
                    </div>
                </div>
                <div className="time">
                    <div className="from-time">
                        <label>From Time:</label>
                        <input type="time" id="from-time" />
                    </div>
                    <div className="to-time">
                        <label>To Time:</label>
                        <input type="time" id="to-time" />
                    </div>
                </div>
                <div className="access-type">
                    <label>Access Type:</label>
                    <select id="access-type">
                        <option value="">Any</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <button onClick={searchNearbyPlaces}>
                    Search Nearby
                </button>
            </div>
        </div>
        <div id="map" ref={mapRef}></div>

        

            {/* Popup for displaying selected place details */}
            {popupVisible && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'white',
                        padding: '10px',
                        border: '1px solid #ccc',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    }}
                >
                    
                    <h3>Place: {selectedPlace.id}</h3>
                    <p>Address: {selectedPlace.address}</p>
                    <p>Availability From: {selectedPlace.availability.from}</p>
                    <p>Availability To: {selectedPlace.availability.to}</p>
                    {/* Display dateRange and accessType */}
                    <p>Date Range: From {selectedPlace.dateRange?.from} To {selectedPlace.dateRange?.to}</p>
                    <p>Access Type: {selectedPlace.accessType}</p>
                    {/* Show booked slots */}
                    <h4>  🚫 Already booked slots:</h4>
                    <ul style={{ color: 'red' }}>
                        {selectedPlace.reservations && selectedPlace.reservations.length > 0 ? (
                            selectedPlace.reservations.map((reservation, index) => (
                                <li key={index}>
                                    {reservation.checkinTime} - {reservation.checkoutTime}
                                </li>
                            ))
                        ) : (
                            <li>No bookings available</li>
                        )}
                    </ul>
                    <button onClick={() => proceedToBook(selectedPlace)}>Proceed to Pay</button>
                    <button onClick={() => getDirections()}>Get Directions</button>
                    <button onClick={() => setPopupVisible(false)}>Close</button>
                </div>
            )}
            {directionsSteps.length > 0 && (
            <div className="directions-box">
                <h4>Directions:</h4>
                <ul>{directionsSteps}</ul>
            </div>
        )}

        <FetchLatLng onFetchPlaces={onFetchPlaces} />
        </div>
    );
};

export default Map;
