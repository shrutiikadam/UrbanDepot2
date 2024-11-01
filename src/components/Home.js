import React, { useEffect, useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  const [carLoaded, setCarLoaded] = useState(false);
  const [parkingVisible, setParkingVisible] = useState(false);
  useEffect(() => {
    // Start car movement after 1 second
    const timer = setTimeout(() => {
      setCarLoaded(true);
    }, 100); // Time for the car to start moving

    // Show parking image after 3 seconds
    const parkingTimer = setTimeout(() => {
      setParkingVisible(true);
    }, 2500); // 3 seconds after the car starts moving (1 second + 3 seconds)

    return () => clearTimeout(timer);
  }, []);

  
  return (
    <div classname="Landing-Page">
    <div className="landing">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bruno+Ace&display=swap" rel="stylesheet" />
      </head>
      <div className="hero-text">
  <div className="first-line-wrapper">
    <div className='first-row'>
    <div className='firstline1'>Let</div>
    <div className='title1'>URBANDEPOT</div>
    </div>
  <div className='firstline'>take you straight to your spot!</div>
  <div className='secondline1'><p className='secondline1'>Discover the easiest way to find and reserve parking in real-time—quick, convenient, and stress-free.</p></div>
  <div className="nav-links1">
    <Link to="/map" className="landing-button">Search Now</Link>
  </div>
  </div>
</div>
      
      <div className="hero-image">
        <img
          src="parking786.png"
          alt="Park"
          className={`park-image ${parkingVisible ? 'visible' : ''}`}
        />
        <img
          src="car123.png"
          alt="Car"
          className={`car-image ${carLoaded ? 'loaded' : ''}`}
        />
      </div>
   
      </div>
         <div class="ticker-container">
  <div class="ticker-text">
    <span>Parking Available</span>
  </div>
</div>
<div className='image1'>
<img
    src="image1.png"
    alt="img"
    className="image11"/>
<div className='secondpage'>
      <div className="tagline">
          <heading>With UrbanDepot Parking is</heading>
      </div>
      <div> 
        <section class="animation">
        <div class="first"><div>Secure</div></div>
        <div class="second"><div>Affordable</div></div>
        <div class="third"><div>Reliable</div></div>
        </section>
      </div>
      </div>
      

</div>
      </div>
      
  
  );
}

export default Home;