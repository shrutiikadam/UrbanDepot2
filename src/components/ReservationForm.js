import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore'; 
import { db, auth } from '../firebaseConfig'; 
import styles from './Reservation.module.css'; 

const ReservationForm = () => {
    const navigate = useNavigate();
    const [checkinTime, setCheckinTime] = useState('');
    const [checkoutTime, setCheckoutTime] = useState('');
    const [checkinDate, setCheckinDate] = useState('');
    const [checkoutDate, setCheckoutDate] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [parkingSpot, setParkingSpot] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [charge, setCharge] = useState('');
    const [id, setId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    
    // New fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [totalAmount, setTotalAmount] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const chargeAmount = queryParams.get('charge');
        const fetchedId = queryParams.get('id');  
        setId(fetchedId);

        const user = auth.currentUser;
        if (user) {
            setUserEmail(user.email);
            setEmail(user.email);  // Update email state
        }

        if (fetchedId) {
            const fetchCharge = async () => {
                const placeDocRef = doc(db, 'places', fetchedId);
                const placeDoc = await getDoc(placeDocRef);
                if (placeDoc.exists()) {
                    const placeData = placeDoc.data();
                    setCharge(placeData.charge); 
                    setTotalAmount(placeData.charge); // Set total amount
                } else {
                    console.error("Place document not found for ID: ", fetchedId);
                }
            };
            fetchCharge();
        }

        if (chargeAmount && !isNaN(chargeAmount)) {
            setCharge(chargeAmount);
            setTotalAmount(chargeAmount);
        }
    }, [id]);

    // Function to check if the time slot is already booked
    const isSlotBooked = async () => {
        const checkinDateTime = new Date(`${checkinDate}T${checkinTime}`);
        const checkoutDateTime = new Date(`${checkoutDate}T${checkoutTime}`);

        const reservationsRef = collection(db, 'places', id, 'reservations');
        const reservationQuery = query(reservationsRef, where('checkinDate', '==', checkinDate));

        const querySnapshot = await getDocs(reservationQuery);
        let timeConflict = false;

        querySnapshot.forEach((doc) => {
            const reservation = doc.data();
            const existingCheckinTime = new Date(`${reservation.checkinDate}T${reservation.checkinTime}`);
            const existingCheckoutTime = new Date(`${reservation.checkoutDate}T${reservation.checkoutTime}`);

            // Check if the new reservation's time overlaps with any existing reservations
            if ((checkinDateTime >= existingCheckinTime && checkinDateTime < existingCheckoutTime) ||
                (checkoutDateTime > existingCheckinTime && checkoutDateTime <= existingCheckoutTime)) {
                timeConflict = true;
            }
        });

        return timeConflict;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate check-in and check-out times
        if (new Date(`${checkinDate}T${checkinTime}`) >= new Date(`${checkoutDate}T${checkoutTime}`)) {
            alert("Check-out time must be after check-in time.");
            return;
        }

        // Check if the slot is already booked
        const slotConflict = await isSlotBooked();
        if (slotConflict) {
            alert("This slot is already booked for the selected time range.");
            return;
        }

        // Create a booking object
        const bookingDetails = {
            name,
            email,
            contactNumber,
            countryCode,
            checkinTime,
            checkoutTime,
            checkinDate,
            checkoutDate,
            vehicleType,
            parkingSpot,
            licensePlate,
            paymentMethod,
            total_amount: totalAmount, // Total amount
            createdAt: new Date().toISOString() // Add a timestamp
        };
        console.log('Saving to Firestore with:', {
            id,
            userEmail,
            bookingDetails,
        });

        try {
            const bookingId = `${licensePlate}-${Date.now()}`;

            // Save booking details to the subcollection
            await setDoc(doc(db, 'places', id, 'reservations', bookingId), bookingDetails);
            const userDocRef = doc(db, 'users', userEmail);  // Correct path for the user
    const bookingCollectionRef = collection(userDocRef, 'bookings');  // Subcollection

    // Save the booking details in the user's 'bookings' subcollection
    await setDoc(doc(bookingCollectionRef, bookingId), bookingDetails);
            navigate(`/payment?amount=${totalAmount}`);
        } catch (error) {
            console.error("Error saving booking details: ", error);
            alert("Error saving booking details. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Parking Reservation Form</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <label>Contact Number:</label>
                <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                
                <label>Country Code:</label>
                <input type="text" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required />
                
                <label>Check-In Date:</label>
                <input type="date" value={checkinDate} onChange={(e) => setCheckinDate(e.target.value)} required />

                <label>Check-In Time:</label>
                <input type="time" value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} required />
                
                <label>Check-Out Date:</label>
                <input type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} required />
                
                <label>Check-Out Time:</label>
                <input type="time" value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} required />
                
                <label>Vehicle Type:</label>
                <input type="text" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />

                <label>Parking Spot:</label>
                <input type="text" value={parkingSpot} onChange={(e) => setParkingSpot(e.target.value)} required />

                <label>License Plate:</label>
                <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />

                <label>Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
                    <option value="">Select Payment Method</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="net-banking">Net Banking</option>
                </select>

                <div>
                    <p>Total Charge: Rs. {totalAmount}</p>
                </div>

                <button type="submit">Confirm Reservation</button>
            </form>
        </div>
    );
};

export default ReservationForm;
