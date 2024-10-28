import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import PropTypes from 'prop-types';
import db from '../firebaseConfig'; // Import your Firebase Firestore config
import './FetchLatLng.css'; // Import your CSS file
import Loading from './loading'; // Import the new Loading component


const FetchLatLng = ({ onFetchPlaces }) => {
    const [loading, setLoading] = useState(true);

    const fetchLatLng = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'places'));
            const places = [];

            const today = new Date(); // Current date and time in local time
            const formattedToday = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

            console.log(`Current date (formatted): ${formattedToday}`);
            
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const { lat, lng } = data.landmark || {}; 
                const address = data.address || 'Not available';
                const availability = data.availability || { from: 'Not available', to: 'Not available' };
                const charge = data.charge || 'Not available';
                const accessType = data.accessType || 'Not available'; // New field
                const dateRange = data.dateRange || { from: 'Not available', to: 'Not available' }; // New field

                // Check dateRange validity
                const dateRangeTo = dateRange.to; // Assuming dateRange.to is in 'YYYY-MM-DD'

                // Skip the place if dateRange.to is before today's date
                if (dateRangeTo && new Date(dateRangeTo) < today) {
                    console.log(`Skipping ${data.placeName}: dateRange.to is before today.`);
                    continue; // Skip this place
                }

                // Fetch reservations for the current place
                const reservationsSnapshot = await getDocs(collection(db, `places/${doc.id}/reservations`));
                const reservations = [];

                // Log reservation data
                // console.log(`Fetching reservations for place ID: ${doc.id}`);

                reservationsSnapshot.forEach((reservationDoc) => {
                    const reservationData = reservationDoc.data();
                    const checkinDate = reservationData.checkinDate; // Assuming checkinDate is stored as a string in 'YYYY-MM-DD' format
                    const checkinTime = reservationData.checkinTime || 'Not available';
                    const checkoutTime = reservationData.checkoutTime || 'Not available';

                    // Check if today's date matches the checkinDate
                    if (checkinDate === formattedToday) {
                        reservations.push({
                            reservationId: reservationDoc.id,
                            checkinTime,
                            checkoutTime,
                        });
                    }
                });

                // console.log(`Fetched Place - ID: ${doc.id}, Lat: ${lat}, Lng: ${lng}, Address: ${address}, Reservations Count: ${reservations.length}`);

                // Push place including new fields
                places.push({ 
                    id: doc.id, 
                    lat, 
                    lng, 
                    address, 
                    availability, 
                    charge, 
                    accessType, // Include accessType
                    dateRange, // Include dateRange
                    reservations // Include reservations (could be empty)
                });
            }

           
            onFetchPlaces(places);
        } catch (error) {
            console.error("Error fetching lat/lng from Firestore:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatLng();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchLatLng();
            setLoading(false); // Ensure loading is set to false after fetching
        };
    
        fetchData();
    
        // Optional: Set a timeout to stop loading after a certain time
        const timer = setTimeout(() => setLoading(false), 6000); // Stop loading after 10 seconds if not completed
    
        return () => clearTimeout(timer); // Clean up timeout on unmount
    }, []);
    
return (
    <div>
        {loading && <Loading />} {/* Use Loading component here */}
    </div>
);
};

FetchLatLng.propTypes = {
    onFetchPlaces: PropTypes.func.isRequired,
};

export default FetchLatLng;
