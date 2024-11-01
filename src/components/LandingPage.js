// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './LandingPage.css';

// const LandingPage = () => {
//   const navigate = useNavigate();
//   const [fadeOut, setFadeOut] = useState(false);
//   const mainContainerRef = useRef(null);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === 'Enter') {
//         setFadeOut(true);
//         setTimeout(() => navigate('/home'), 1200);
//       }
//     };

//     // Attach the event listener to document for global key events
//     document.addEventListener('keydown', handleKeyDown);

//     // Cleanup the event listener on component unmount
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [navigate]);

//   const handleContainerClick = () => {
//     // Refocus on the main container to capture "Enter" after any click
//     if (mainContainerRef.current) {
//       mainContainerRef.current.focus();
//     }
//   };

//   return (
//     <div
//       className={`main ${fadeOut ? 'fade-out' : ''}`}
//       onClick={handleContainerClick}
//       ref={mainContainerRef}
//       tabIndex="0" // Allows focusing on the div
//     >
//       <div className="overlay-text">
//         <h1>Discover the Future of Urban Parking with <span>URBANDEPOT</span></h1>
//         <p>Press Enter to Explore a Smarter Way to Park</p>
//       </div>
//       <div className="background-iframe">
//         <iframe
//           src="https://my.spline.design/cylindersanimationcopy-80d59ccefb4c60a36ab21784ac5be47f/"
//           style={{ width: '100%', height: '100%', border: 'none' }}
//           title="Spline 3D Scene"
//         ></iframe>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;



import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Typed from 'typed.js';

const LandingPage = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const el = React.useRef(null);

  useEffect(() => {
    const options = {
      strings: ["Welcome to URBANDEPOT", "Discover the Future of Urban Parking"],
      typeSpeed: 50,
      backSpeed: 25,
      loop: true,
    };

    const typed = new Typed(el.current, options);

    return () => {
      typed.destroy();
    };
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      setFadeOut(true);
      setTimeout(() => navigate('/home'), 1200); // Match this timeout to the animation duration
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`main ${fadeOut ? 'fade-out' : ''}`}>
      <div className="overlay-text">
        <h1 ref={el}></h1> {/* Using ref for typing effect */}
        <p>Press Enter to Explore a Smarter Way to Park</p>
      </div>
      <div className="background-iframe">
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
