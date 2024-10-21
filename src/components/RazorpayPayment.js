import React, { useEffect, useState } from 'react';

const RazorpayPayment = () => {
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const paymentAmount = queryParams.get('amount'); // Get amount from URL params
        setAmount(paymentAmount); // Set the amount in state
    }, []);

    const razorpayApiKey = process.env.REACT_APP_RAZORPAY_API_KEY;

    const handlePayment = () => {
        if (!amount) {
            alert("Amount is not defined!");
            return;
        }

        const options = {
            key: razorpayApiKey,
            amount: (parseFloat(amount) * 100 ).toString(), // Razorpay requires amount in paise (e.g., Rs. 100.00 = 10000 paise)
            currency: "INR",
            name: "UrbanDepot",
            description: "Test Transaction",
            handler: function (response) {
                alert(`Payment ID: ${response.razorpay_payment_id}`);
            },
            prefill: {
                name: "Shruti Kadam",
                email: "shruti.kadam@example.com",
                contact: "9321530038"
            },
            theme: {
                color: "#F37254"
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    };

    return (
        <div>
            <h2>Pay with Razorpay</h2>
            <button onClick={handlePayment}>Pay Now</button>
        </div>
    );
};

export default RazorpayPayment;
