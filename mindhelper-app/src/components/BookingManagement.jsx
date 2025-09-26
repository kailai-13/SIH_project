// src/components/BookingManagement.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getAllBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdating(bookingId);
      // For now, update locally (you can add API endpoint later)
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    } catch (error) {
      console.error('Failed to update booking:', error);
      setError(error.message || 'Failed to update booking');
    } finally {
      setUpdating(null);
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => booking.status === filter);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="booking-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <div className="booking-management">
      <div className="booking-header">
        <h2>Booking Management</h2>
        <button onClick={fetchBookings} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="booking-stats">
        <div className="stat-item">
          <span className="stat-number">{statusCounts.all}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statusCounts.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statusCounts.confirmed}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{statusCounts.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="booking-filters">
        <h3>Filter by Status:</h3>
        <div className="filter-buttons">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${statusCounts[status]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>
              {filter === 'all' 
                ? 'No bookings have been made yet.'
                : `No ${filter} bookings found.`}
            </p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">#{booking.id.slice(-8)}</div>
                  <div 
                    className="booking-status"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Student:</span>
                    <span className="detail-value">{booking.user_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(booking.date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{formatTime(booking.time)}</span>
                  </div>
                  {booking.concerns && (
                    <div className="detail-row">
                      <span className="detail-label">Concerns:</span>
                      <span className="detail-value">{booking.concerns}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        className="action-btn confirm"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        disabled={updating === booking.id}
                      >
                        ✓ Confirm
                      </button>
                      <button
                        className="action-btn cancel"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        disabled={updating === booking.id}
                      >
                        ✗ Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      className="action-btn complete"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      disabled={updating === booking.id}
                    >
                      ✓ Mark Complete
                    </button>
                  )}
                  {updating === booking.id && (
                    <div className="updating-indicator">Updating...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
