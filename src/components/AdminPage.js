
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import db from '../firebaseConfig';
import AdminSidebar from './AdminSidebar';
import './AdminPage.css';

const AdminPage = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('statistics');
    const [activeSubTab, setActiveSubTab] = useState('verified'); 
    const [bookings, setBookings] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [totalPlaces, setTotalPlaces] = useState(0);
    const [activeBookings, setActiveBookings] = useState(0);
    const [feedbackScore, setFeedbackScore] = useState(0);
    const [mostPopularPlace, setMostPopularPlace] = useState('');
    const [recentRegistrations, setRecentRegistrations] = useState(0);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'places'));
            const fetchedPlaces = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedPlaces.push({
                    id: doc.id,
                    ...data,
                });
            });

            setPlaces(fetchedPlaces);
            setTotalPlaces(fetchedPlaces.length);
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPlace = async (placeId) => {
        try {
            const placeRef = doc(db, 'places', placeId);
            await updateDoc(placeRef, {
                verified: true,
            });
            setPlaces((prevPlaces) =>
                prevPlaces.map((place) =>
                    place.id === placeId ? { ...place, verified: true } : place
                )
            );
            alert('Place verified successfully!');
        } catch (error) {
            console.error("Error verifying place:", error);
            alert('Failed to verify place. Please try again.');
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'bookings'));
            const fetchedBookings = [];
            let activeCount = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedBookings.push({
                    id: doc.id,
                    ...data,
                });
                if (data.status === 'active') activeCount += 1; // Assuming active status is marked as "active"
            });

            setBookings(fetchedBookings);
            setTotalBookings(querySnapshot.size);
            setActiveBookings(activeCount);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeedbackScore = async () => {
        try {
            const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
            let totalScore = 0;
            let count = 0;

            feedbackSnapshot.forEach((doc) => {
                totalScore += doc.data().score || 0; // Default score to 0 if missing
                count += 1;
            });

            setFeedbackScore(count ? (totalScore / count).toFixed(1) : 0);
        } catch (error) {
            console.error("Error fetching feedback score:", error);
        }
    };

    const fetchMostPopularPlace = async () => {
        try {
            const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
            const placeCount = {};

            bookingsSnapshot.forEach((doc) => {
                const placeId = doc.data().placeId;
                placeCount[placeId] = (placeCount[placeId] || 0) + 1;
            });

            const popularPlaceId = Object.keys(placeCount).reduce((a, b) => placeCount[a] > placeCount[b] ? a : b, '');
            setMostPopularPlace(popularPlaceId || 'N/A');
        } catch (error) {
            console.error("Error fetching most popular place:", error);
        }
    };

    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                setTotalUsers(usersSnapshot.size);
            } catch (error) {
                console.error("Error fetching total users:", error);
            }
        };

        const fetchRecentRegistrations = async () => {
            try {
                const placesSnapshot = await getDocs(collection(db, 'places'));
                const recentCount = placesSnapshot.docs.filter((doc) => {
                    const registrationDate = doc.data().registrationDate?.toDate();
                    return registrationDate && (Date.now() - registrationDate) / (1000 * 60 * 60 * 24) <= 7;
                }).length;

                setRecentRegistrations(recentCount);
            } catch (error) {
                console.error("Error fetching recent registrations:", error);
            }
        };

        // Load all statistics
        fetchTotalUsers();
        fetchBookings();
        fetchPlaces();
        fetchFeedbackScore();
        fetchMostPopularPlace();
        fetchRecentRegistrations();
    }, []);

    const verifiedPlaces = places.filter((place) => place.verified);
    const nonVerifiedPlaces = places.filter((place) => !place.verified);

    return (
        <div className="admin-page">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="main-content">
                {activeTab === 'statistics' && (
                    <div className="statistics-overview">
                    <h2>Statistics Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Users</h3>
                            <p>{totalUsers}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Bookings</h3>
                            <p>{totalBookings}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Active Bookings</h3>
                            <p>{activeBookings}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Registered Places</h3>
                            <p>{totalPlaces}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Recent Registrations</h3>
                            <p>{recentRegistrations} in last 7 days</p>
                        </div>
                        <div className="stat-card">
                            <h3>Feedback Score</h3>
                            <p>{feedbackScore} / 5</p>
                        </div>
                        <div className="stat-card">
                            <h3>Most Popular Place</h3>
                            <p>{mostPopularPlace || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                )}

                {activeTab === 'registered' && (
                    <div>
                        <div className="tabs">
                            <button
                                className={`tab-button ${activeSubTab === 'verified' ? 'active' : ''}`}
                                onClick={() => setActiveSubTab('verified')}
                            >
                                Verified
                            </button>
                            <button
                                className={`tab-button ${activeSubTab === 'nonVerified' ? 'active' : ''}`}
                                onClick={() => setActiveSubTab('nonVerified')}
                            >
                                Non-Verified
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading-indicator">Loading...</div>
                        ) : (
                            <div className="place-list">
                                {activeSubTab === 'verified' && verifiedPlaces.map((place) => (
                                    <div key={place.id} className="place-card">
                                        <h3>{place.placeName || 'Unknown Place'}</h3>
                                        <p><strong>Address:</strong> {place.address}</p>
                                        <p><strong>Charge:</strong> {place.charge}</p>
                                        <p><strong>Access Type:</strong> {place.accessType}</p>
                                        <p><strong>Availability:</strong> {place.availability.from} - {place.availability.to}</p>
                                        <p><strong>Verified:</strong> Yes</p>
                                    </div>
                                ))}

                                {activeSubTab === 'nonVerified' && nonVerifiedPlaces.map((place) => (
                                    <div key={place.id} className="place-card">
                                        <h3>{place.placeName || 'Unknown Place'}</h3>
                                        <p><strong>Address:</strong> {place.address}</p>
                                        <p><strong>Charge:</strong> {place.charge}</p>
                                        <p><strong>Access Type:</strong> {place.accessType}</p>
                                        <p><strong>Availability:</strong> {place.availability.from} - {place.availability.to}</p>
                                        <p><strong>Verified:</strong> No</p>
                                        <button
                                            className="verify-button"
                                            onClick={() => handleVerifyPlace(place.id)}
                                        >
                                            Verify
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="bookings-section">
                    <h2>All Bookings</h2>
                    {loading ? (
                        <div className="loading-indicator">Loading...</div>
                    ) : (
                        <div className="booking-list">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="booking-card">
                                    <h3>Booking ID: {booking.id}</h3>
                                    <p><strong>User:</strong> {booking.userId}</p>
                                    <p><strong>Place:</strong> {booking.placeId}</p>
                                    <p><strong>Date:</strong> {booking.date}</p>
                                    <p><strong>Status:</strong> {booking.status}</p>
                                    <p><strong>Charge:</strong> {booking.charge}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}
                
                {activeTab === 'profile' && (
                    <div>Profile Content</div>
                )}
                
                {activeTab === 'settings' && (
                    <div>Settings Content</div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
