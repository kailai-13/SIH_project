// src/components/BookingSystem.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './BookingSystem.css';

const BookingSystem = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    date: '',
    time: '',
    concerns: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const response = await apiService.getMyBookings();
      setMyBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Full name is required');
    }
    if (!formData.date) {
      throw new Error('Date is required');
    }
    if (!formData.time) {
      throw new Error('Time is required');
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      throw new Error('Please select a future date');
    }

    // Check if time is during business hours (9 AM - 5 PM)
    const [hours] = formData.time.split(':').map(Number);
    if (hours < 9 || hours >= 17) {
      throw new Error('Please select a time between 9:00 AM and 5:00 PM');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      await apiService.createBooking({
        name: formData.name.trim(),
        date: formData.date,
        time: formData.time,
        concerns: formData.concerns.trim() || null
      });

      setSuccess('Booking submitted successfully! A counselor will confirm your appointment soon.');
      setFormData(prev => ({
        name: prev.name,
        date: '',
        time: '',
        concerns: ''
      }));
      
      // Refresh bookings list
      await fetchMyBookings();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#2ecc71';
      case 'pending': return '#f39c12';
      case 'cancelled': return '#e74c3c';
      case 'completed': return '#95a5a6';
      default: return '#3498db';
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>Book a Counseling Session</h2>
        <p>Schedule a session with our wellness counselors.</p>
        
        <div className="booking-tabs">
          <button
            className={`tab-btn ${!showMyBookings ? 'active' : ''}`}
            onClick={() => setShowMyBookings(false)}
          >
            New Booking
          </button>
          <button
            className={`tab-btn ${showMyBookings ? 'active' : ''}`}
            onClick={() => setShowMyBookings(true)}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <strong>Success:</strong> {success}
        </div>
      )}

      {!showMyBookings ? (
        <div className="booking-form-section">
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Preferred Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDate()}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">Preferred Time *</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="concerns">Concerns or Topics (Optional)</label>
              <textarea
                id="concerns"
                name="concerns"
                value={formData.concerns}
                onChange={handleChange}
                disabled={loading}
                placeholder="Briefly describe what you'd like to discuss (optional)"
                rows="3"
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Booking...
                </span>
              ) : (
                'Book Session'
              )}
            </button>
          </form>
          
          <div className="booking-info">
            <h3>Counseling Services</h3>
            <p>Our certified counselors provide support for:</p>
            <ul>
              <li>Academic stress and pressure</li>
              <li>Anxiety and depression</li>
              <li>Time management and study skills</li>
              <li>Personal development and relationships</li>
              <li>Career guidance and life transitions</li>
            </ul>
            <div className="info-notes">
              <p><strong>✓ Confidential:</strong> All sessions are completely private</p>
              <p><strong>✓ Free:</strong> No cost for registered students</p>
              <p><strong>✓ Professional:</strong> Licensed mental health counselors</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-bookings-section">
          <div className="my-bookings-header">
            <h3>My Appointments</h3>
            <button onClick={fetchMyBookings} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
          
          {myBookings.length === 0 ? (
            <div className="empty-state">
              <p>You haven't made any bookings yet.</p>
              <button 
                onClick={() => setShowMyBookings(false)}
                className="action-btn"
              >
                Book Your First Session
              </button>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-header">
                    <div className="booking-date">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div 
                      className="booking-status"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status}
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span>{new Date(`2000-01-01 ${booking.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                    
                    {booking.concerns && (
                      <div className="detail-item">
                        <span className="detail-icon">💭</span>
                        <span>{booking.concerns}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>Booked on {new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSystem;
