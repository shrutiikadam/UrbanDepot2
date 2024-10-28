// src/components/Loading.js

import React from 'react';
import './loading.css'; // Import the CSS file for styling
import carImage from './images/sports-car.png'; // Adjust the path if necessary

const Loading = () => {
    return (
        <div className="loading-indicator">
            <div className="car-animation">
                <img src={carImage} alt="Loading car" className="loading-car" />
            </div>
        </div>
    );
};

export default Loading;
