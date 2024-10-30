import React, { useEffect, useCallback } from 'react'; // Ensure useEffect and useCallback are imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle keydown events
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      navigate('/home'); // Change '/map' to the correct route for your map page
    }
  }, [navigate]);

  // Use effect to add and clean up the event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="main">
      <div style={{ width: '100%', height: '100vh' }}>
        <iframe
          src="https://my.spline.design/cylindersanimationcopy-80d59ccefb4c60a36ab21784ac5be47f/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Spline 3D Scene"
        ></iframe>
      </div>
    </div>
  );
};

export default LandingPage;
