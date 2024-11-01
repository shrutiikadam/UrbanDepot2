import React, { useState } from 'react';
import './Testimonials.css';

const testimonialsData = [
  {
    id: 1,
    text: "UrbanDepot made finding parking so easy! Highly recommend!",
    author: "John Doe"
  },
  {
    id: 2,
    text: "I love the real-time updates on available spots!",
    author: "Jane Smith"
  },
  {
    id: 3,
    text: "A stress-free parking experience!",
    author: "Mark Johnson"
  },
  {
    id: 4,
    text: "Affordable and reliable. I use it every time!",
    author: "Emily Davis"
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="testimonials-container">
      <h2>What Our Users Say</h2>
      <div className="testimonial-card">
        <p>"{testimonialsData[currentIndex].text}"</p>
        <h3>- {testimonialsData[currentIndex].author}</h3>
      </div>
      <div className="arrows">
        <button className="arrow" onClick={prevTestimonial}>&#10094;</button>
        <button className="arrow" onClick={nextTestimonial}>&#10095;</button>
      </div>
    </div>
  );
};

export default Testimonials;
