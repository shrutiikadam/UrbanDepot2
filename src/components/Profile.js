import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig'; // Assuming firebaseConfig is correctly set up
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css'; // Assume you have some styles here

const Profile = () => {
    const [bookings, setBookings] = useState([]);
    const [registeredPlaces, setRegisteredPlaces] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    setUserEmail(user.email);

                    // Fetch bookings
                    const bookingsRef = collection(db, 'users', user.email, 'bookings');
                    const bookingsSnapshot = await getDocs(bookingsRef);
                    const bookingsList = bookingsSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setBookings(bookingsList);

                    // Fetch registered places (optional if you have this functionality)
                    const placesRef = collection(db, 'users', user.email, 'register');
                    const placesSnapshot = await getDocs(placesRef);
                    const placesList = placesSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setRegisteredPlaces(placesList);
                }
            } catch (error) {
                console.error("Error fetching profile data: ", error);
                alert("Error fetching profile data. Please try again.");
            }
        };

        fetchProfileData();
    }, []);

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    return (
        <div className={styles.profileContainer}>
            <h2>User Profile</h2>
            <p>Email: {userEmail}</p>

            <div className={styles.section}>
                <h3>Your Bookings</h3>
                {bookings.length > 0 ? (
                    <ul className={styles.list}>
                        {bookings.map((booking) => (
                            <li key={booking.id}>
                                <p><strong>License Plate:</strong> {booking.licensePlate}</p>
                                <p><strong>Check-in:</strong> {booking.checkin}</p>
                                <p><strong>Check-out:</strong> {booking.checkout}</p>
                                <p><strong>Parking Spot:</strong> {booking.parkingSpot}</p>
                                <p><strong>Vehicle Type:</strong> {booking.vehicleType}</p>
                                <p><strong>Charge:</strong> Rs. {booking.charge}</p>
                                <p><strong>Payment Method:</strong> {booking.paymentMethod}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No bookings found.</p>
                )}
            </div>

            <div className={styles.section}>
                <h3>Registered Places</h3>
                {registeredPlaces.length > 0 ? (
                    <ul className={styles.list}>
                        {registeredPlaces.map((place) => (
                            <li key={place.id}>
                                <p><strong>Place Name:</strong> {place.address}</p>
                                <p><strong>Location:</strong> {place.parking_number}</p>
                                <p><strong>Parking Spots:</strong> {place.charge}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No registered places found.</p>
                )}
            </div>

            <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Profile;
