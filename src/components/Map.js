import React, { useEffect, useRef, useState } from "react";
import { FaDirections } from 'react-icons/fa';
import './Map.css';
import FetchLatLng from './FetchLatLng';
const mapsApiKey = process.env.REACT_APP_MAPS_API_KEY;
console.log(mapsApiKey)
const Map = () => {
    const [places, setPlaces] = useState([]);
    const mapRef = useRef(null);
    const [searchMarker, setSearchMarker] = useState(null);
    const [userMarker, setUserMarker] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState({});

    const onFetchPlaces = (newPlaces) => {
        setPlaces(newPlaces); // Update the places state with the fetched data
    };

    useEffect(() => {
        console.log(mapsApiKey)
        const loadScript = (src) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        };

        window.initMap = () => {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 20.5937, lng: 78.9629 }, // Centered on India
                zoom: 5,
            });

            // Set user marker to current location
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
                    map.setCenter(userLocation); // Center the map on the user's location
                });
            } else {
                alert("Geolocation is not supported by this browser.");
            }

            const service = new window.google.maps.places.PlacesService(map);
            setDirectionsService(new window.google.maps.DirectionsService());
            const renderer = new window.google.maps.DirectionsRenderer();
            renderer.setMap(map);
            setDirectionsRenderer(renderer);

            const input = document.getElementById("pac-input");
            const autocomplete = new window.google.maps.places.Autocomplete(input);
            autocomplete.bindTo("bounds", map);

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) {
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }

                map.setCenter(place.geometry.location);
                map.setZoom(15);

                if (searchMarker) {
                    searchMarker.setMap(null); // Remove previous marker
                }

                const newSearchMarker = new window.google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                });
                setSearchMarker(newSearchMarker);

                // Open the popup with the place details
                setSelectedPlace({
                    name: place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
                setPopupVisible(true);

                // Use setTimeout to ensure the elements exist before setting their values
                setTimeout(() => {
                    const latInput = document.getElementById("place-lat");
                    const lngInput = document.getElementById("place-lng");

                    if (latInput && lngInput) {
                        latInput.value = place.geometry.location.lat();
                        lngInput.value = place.geometry.location.lng();
                    }
                }, 0); // Delay execution slightly to ensure elements are present
            });

            // Set markers for fetched places
            // Set markers for fetched places
        places.forEach(place => {
            const marker = new window.google.maps.Marker({
                position: { lat: place.lat, lng: place.lng },
                map: map,
                title: place.id, // Optional: Title can be the document ID or name
            });

            // Add click event listener to the marker
            marker.addListener("click", () => {
                // Set the selected place
                setSelectedPlace({
                    name: place.id, // or any other property you want to display
                    lat: place.lat,
                    lng: place.lng,
                });
                setPopupVisible(true);
            });
        });
        };

        loadScript(`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap&libraries=places`);
    }, [places]); // Only run when places changes

    const searchNearbyPlaces = () => {
        const searchInput = document.getElementById("pac-input").value;
        const travelMode = document.getElementById("travel-mode").value;

        const request = {
            location: userMarker.getPosition(),
            radius: "500",
            query: searchInput,
        };

        const service = new window.google.maps.places.PlacesService(mapRef.current);
        service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const place = results[0];
                const destination = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };

                if (searchMarker) {
                    searchMarker.setMap(null);
                }

                const newSearchMarker = new window.google.maps.Marker({
                    position: destination,
                    map: mapRef.current,
                    title: place.name,
                });
                setSearchMarker(newSearchMarker);

                // Open the popup with the place details
                setSelectedPlace({
                    name: place.name,
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
                setPopupVisible(true);

                const requestDirections = {
                    origin: userMarker.getPosition(),
                    destination: destination,
                    travelMode: window.google.maps.TravelMode[travelMode],
                };

                directionsService.route(requestDirections, (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        directionsRenderer.setDirections(result);
                        document.getElementById("directions-panel").innerHTML =
                            "<h3>Directions</h3>" +
                            result.routes[0].legs[0].steps.map((step) => `<p>${step.instructions}</p>`).join("");
                    } else {
                        window.alert("Directions request failed due to " + status);
                    }
                });
            }
        });
    };

    const closeRegisterForm = () => {
        document.getElementById("register-form").style.display = "none";
    };
    const proceedToBook = (place) => {
        // Assuming you want to pass the place information as query parameters
        const query = `?lat=${place.lat}&lng=${place.lng}&name=${encodeURIComponent(place.name)}`;
        window.location.href = `/reservation${query}`;
    };

    const getDirections = () => {
        if (directionsService && userMarker) {
            const requestDirections = {
                origin: userMarker.getPosition(),
                destination: { lat: selectedPlace.lat, lng: selectedPlace.lng },
                travelMode: window.google.maps.TravelMode.DRIVING, // Adjust travel mode as needed
            };

            directionsService.route(requestDirections, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                    document.getElementById("directions-panel").innerHTML =
                        "<h3>Directions</h3>" +
                        result.routes[0].legs[0].steps.map((step) => `<p>${step.instructions}</p>`).join("");
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            });
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <div id="map" ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
            <input
                id="pac-input"
                type="text"
                placeholder="Search Box"
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    zIndex: 1,
                    width: "200px",
                    padding: "5px",
                    borderRadius: "5px",
                }}
            />
            <select id="travel-mode" style={{ position: "absolute", top: "50px", left: "10px" }}>
                <option value="DRIVING">Driving</option>
                <option value="WALKING">Walking</option>
                <option value="BICYCLING">Bicycling</option>
                <option value="TRANSIT">Transit</option>
            </select>
            <button onClick={searchNearbyPlaces} style={{ position: "absolute", top: "100px", left: "10px" }}>
                Search Nearby
            </button>

            <div
                id="directions-panel"
                style={{
                    position: "absolute",
                    top: "150px",
                    left: "10px",
                    maxHeight: "400px",
                    overflowY: "scroll",
                    border: "1px solid #ccc",
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                    zIndex: 2,
                }}
            ></div>

            <div id="register-form" style={{ display: "none" }}>
                {/* Registration form can be added here */}
                <h2>Register Place</h2>
                <button onClick={closeRegisterForm}>Close</button>
            </div>

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
                    <h3>{selectedPlace.name}</h3>
                    <p>Latitude: {selectedPlace.lat}</p>
                    <p>Longitude: {selectedPlace.lng}</p>
                    <button onClick={() => proceedToBook(selectedPlace)}>Proceed to Book</button>
                    <button onClick={getDirections}><FaDirections /> Get Directions</button>
                    <button onClick={() => setPopupVisible(false)}>Close</button>
                </div>
            )}
            <FetchLatLng onFetchPlaces={onFetchPlaces} />
        </div>
    );
};

export default Map;
