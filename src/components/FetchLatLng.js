// src/FetchLatLng.js
import React, { useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from '../firebaseConfig'; // Import your Firebase Firestore config

const FetchLatLng = ({ onFetchPlaces }) => {
    const fetchLatLng = async () => {
        try {
            // Fetch all documents from the 'places' collection
            const querySnapshot = await getDocs(collection(db, 'places'));
            const places = []; // Array to hold places

            // Loop through the documents and extract latitude and longitude
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const { lat, lng } = data.landmark; // Adjust according to your Firestore structure
                console.log(`Fetched Place - ID: ${doc.id}, Lat: ${lat}, Lng: ${lng}`); // Log each fetched place
                places.push({ id: doc.id, lat, lng }); // Add place to array
            });

            // Call the onFetchPlaces prop with the fetched places
            console.log("All fetched places:", places); // Log the complete array of places
            onFetchPlaces(places); // Pass the places array to the parent
        } catch (error) {
            console.error("Error fetching lat/lng from Firestore:", error);
        }
    };

    // Fetch lat/lng when the component mounts
    useEffect(() => {
        fetchLatLng();
    }, []);

    return null; // No need to render anything
};

export default FetchLatLng;
