import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import PropTypes from 'prop-types';
import db from '../firebaseConfig'; // Import your Firebase Firestore config
import './FetchLatLng.css'; // Import your CSS file

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
                
                // Skip if the place is not verified
                if (!data.verified) {
                    console.log(`Skipping ${data.placeName}: not verified.`);
                    continue; // Skip this place
                }

                const { lat, lng } = data.landmark || {}; 
                const address = data.address || 'Not available';
                const availability = data.availability || { from: 'Not available', to: 'Not available' };
                const charge = data.charge || 'Not available';
                const accessType = data.accessType || 'Not available';
                const dateRange = data.dateRange || { from: 'Not available', to: 'Not available' };

                // Check dateRange validity
                const dateRangeTo = dateRange.to; 

                // Skip the place if dateRange.to is before today's date
                if (dateRangeTo && new Date(dateRangeTo) < today) {
                    console.log(`Skipping ${data.placeName}: dateRange.to is before today.`);
                    continue; // Skip this place
                }

                // Fetch reservations for the current place
                const reservationsSnapshot = await getDocs(collection(db, `places/${doc.id}/reservations`));
                const reservations = [];

                console.log(`Fetching reservations for place ID: ${doc.id}`);

                reservationsSnapshot.forEach((reservationDoc) => {
                    const reservationData = reservationDoc.data();
                    const checkinDate = reservationData.checkinDate;
                    const checkinTime = reservationData.checkinTime || 'Not available';
                    const checkoutTime = reservationData.checkoutTime || 'Not available';

                    if (checkinDate === formattedToday) {
                        reservations.push({
                            reservationId: reservationDoc.id,
                            checkinTime,
                            checkoutTime,
                        });
                    }
                });

                console.log(`Fetched Place - ID: ${doc.id}, Lat: ${lat}, Lng: ${lng}, Address: ${address}, Reservations Count: ${reservations.length}`);

                places.push({ 
                    id: doc.id, 
                    lat, 
                    lng, 
                    address, 
                    availability, 
                    charge, 
                    accessType, 
                    dateRange, 
                    reservations 
                });
            }

            console.log("All fetched places:", places);
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

    return (
        <div>
            {loading && (
                <div className="loading-indicator">
                    <div className="spinner"></div><br/>
                    <p>Wait a while...</p> {/* Show spinner when loading */}
                </div>
            )}
        </div>
    );
};

FetchLatLng.propTypes = {
    onFetchPlaces: PropTypes.func.isRequired,
};

export default FetchLatLng;
