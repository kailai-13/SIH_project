// src/components/BookingSystem.jsx
import React, { useState } from 'react';
import './BookingSystem.css';

const BookingSystem = ({ addBooking }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.date && formData.time) {
      addBooking(formData);
      setSubmitted(true);
      setFormData({ name: '', date: '', time: '' });
      
      // Reset submitted status after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="booking-container">
      <h2>Book a Counseling Session</h2>
      <p>Schedule a session with our wellness counselors.</p>
      
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Preferred Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">Preferred Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="submit-btn">Book Session</button>
        
        {submitted && (
          <div className="success-message">
            Booking submitted successfully! A counselor will confirm your appointment soon.
          </div>
        )}
      </form>
      
      <div className="booking-info">
        <h3>Counseling Services</h3>
        <p>Our certified counselors provide support for:</p>
        <ul>
          <li>Academic stress and pressure</li>
          <li>Anxiety and depression</li>
          <li>Time management and study skills</li>
          <li>Personal development</li>
        </ul>
        <p>Sessions are confidential and free for all students.</p>
      </div>
    </div>
  );
};

export default BookingSystem;