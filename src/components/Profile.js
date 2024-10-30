import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { FaCar, FaMapMarkerAlt, FaSignOutAlt, FaParking, FaMoneyBill, FaTrash, FaUserCircle, FaBell, FaCog } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './toastStyles.css';

const Profile = () => {
    const [bookings, setBookings] = useState([]);
    const [registeredPlaces, setRegisteredPlaces] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [notifications, setNotifications] = useState([]); // New state for notifications
    const [activeTab, setActiveTab] = useState('bookings'); 
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserEmail(user.email);
                const extractedName = extractNameFromEmail(user.email);
                setUserName(extractedName); 
                toast.success(`Hi, ${extractedName}! Welcome back!`);
                await fetchProfileData(user.email);
            } else {
                console.log("No user is signed in.");
                navigate('/login'); 
            }
        });

        return () => unsubscribe(); 
    }, [navigate]);

    const extractNameFromEmail = (email) => {
        const namePart = email.split('@')[0];
        const nameSegments = namePart.split(/[\._]/);
        const firstName = nameSegments[0].replace(/\d+/g, '');
        const lastName = nameSegments[1] ? nameSegments[1].replace(/\d+/g, '') : '';
        const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        return `${capitalizedFirstName} ${capitalizedLastName}`.trim();
    };

    const getInitials = (email) => {
        if (email) {
            const namePart = email.split('@')[0];
            const initials = namePart.split('.').map(name => name.charAt(0).toUpperCase()).join('');
            return initials;
        }
        return '';
    };

    const fetchProfileData = async (email) => {
        try {
            const bookingsRef = collection(db, 'users', email, 'bookings');
            const bookingsSnapshot = await getDocs(bookingsRef);
            const bookingsList = bookingsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBookings(bookingsList);

            const placesRef = collection(db, 'users', email, 'register');
            const placesSnapshot = await getDocs(placesRef);
            const placesList = placesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRegisteredPlaces(placesList);

            // Fetch notifications (example data)
            const notificationList = [
                { id: 1, message: "Your booking for Parking Spot A is confirmed!", date: "2024-10-28" },
                { id: 2, message: "Check-in reminder: Parking Spot B tomorrow at 10 AM.", date: "2024-10-29" },
            ];
            setNotifications(notificationList);

        } catch (error) {
            console.error('Error fetching profile data: ', error);
            toast.error('Error fetching profile data. Please try again.');
        }
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/login');
    };

    const handleDeletePlace = async (placeId) => {
        try {
            const user = auth.currentUser;
            if (user) {
                await deleteDoc(doc(db, 'users', user.email, 'register', placeId));
                setRegisteredPlaces((prevPlaces) => 
                    prevPlaces.filter((place) => place.id !== placeId)
                );
                toast.success('Place deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting place: ', error);
            toast.error('Error deleting place. Please try again.');
        }
    };

    const confirmDeletePlace = (placeId) => {
        const confirmToastId = toast(
            <div>
                <span>Are you sure you want to delete this place?</span>
                <button 
                    onClick={() => {
                        handleDeletePlace(placeId); 
                        toast.dismiss(confirmToastId);
                    }}
                    style={{ marginLeft: '10px' }}
                >
                    Yes
                </button>
                <button 
                    onClick={() => toast.dismiss(confirmToastId)} 
                    style={{ marginLeft: '10px' }}
                >
                    No
                </button>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
            }
        );
    };

    return (
        <div className="profile-container">
            <div className="header">
                <div className="avatar">
                    {getInitials(userEmail)}
                </div>
                <h2>Welcome, {userName}</h2>
            </div>
    
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'bookings' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <FaCar /> <span className="tab-text">Bookings</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'places' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('places')}
                >
                    <FaMapMarkerAlt /> <span className="tab-text">Registered Places</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'notifications' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <FaBell /> <span className="tab-text">Notifications</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'settings' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <FaCog /> <span className="tab-text">Settings</span>
                </button>
            </div>
    
            {activeTab === 'bookings' && (
                <div className="section">
                    <h3 className="section-heading">Your Bookings</h3>
                    <div className="section-space"></div>
                    {bookings.length > 0 ? (
                        <div className="card-container">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="card">
                                    <span className="badge">Active</span>
                                    <h4><FaParking /> Booking #{booking.id}</h4>
                                    <p><strong>License Plate:</strong> {booking.licensePlate}</p>
                                    <p><strong>Check-in:</strong> {booking.checkin}</p>
                                    <p><strong>Check-out:</strong> {booking.checkout}</p>
                                    <p><strong>Vehicle Type:</strong> {booking.vehicleType}</p>
                                    <p><FaMoneyBill /> <strong>Charge:</strong> Rs. {booking.total_amount}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No bookings found.</p>
                    )}
                </div>
            )}
    
            {activeTab === 'places' && (
                <div className="section">
                    <h3 className="section-heading">Registered Places</h3>
                    <div className="section-space"></div>
                    {registeredPlaces.length > 0 ? (
                        <div className="card-container">
                            {registeredPlaces.map((place) => (
                                <div key={place.id} className="card">
                                    <h4><FaMapMarkerAlt /> Place #{place.id}</h4>
                                    <p><strong>Place Name:</strong> {place.address}</p>
                                    <p><strong>Location:</strong> {place.parking_number}</p>
                                    <p><strong>Parking Spots:</strong> {place.charge}</p>
                                    <button
                                        className="delete-button"
                                        onClick={() => confirmDeletePlace(place.id)}
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No registered places found.</p>
                    )}
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="section">
                    <h3 className="section-heading">Notifications</h3>
                    <div className="section-space"></div>
                    {notifications.length > 0 ? (
                        <ul className="notification-list">
                            {notifications.map((notification) => (
                                <li key={notification.id} className="notification-item">
                                    <p>{notification.message}</p>
                                    <span className="notification-date">{notification.date}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No notifications found.</p>
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="section">
                    <h3 className="section-heading">Account Settings</h3>
                    <div className="section-space"></div>
                    <p>You can update your account information and preferences here.</p>
                    <button className="settings-button" onClick={() => navigate('/settings')}>
                        <FaCog /> Manage Account
                    </button>
                </div>
            )}
    
            <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
            </button>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
        </div>
    );
};

export default Profile;