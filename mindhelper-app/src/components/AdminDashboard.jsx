// src/components/AdminDashboard.jsx
import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ bookings, moodLogs }) => {
  // Calculate chat usage (simulated for demo)
  const chatUsage = {
    totalConversations: 24,
    commonTopics: ['Stress', 'Anxiety', 'Motivation'],
    avgSessionLength: '4.2 minutes'
  };

  // Calculate mood distribution
  const moodCounts = {
    happy: moodLogs.filter(log => log.mood === 'happy').length,
    calm: moodLogs.filter(log => log.mood === 'calm').length,
    neutral: moodLogs.filter(log => log.mood === 'neutral').length,
    tired: moodLogs.filter(log => log.mood === 'tired').length,
    stressed: moodLogs.filter(log => log.mood === 'stressed').length,
    anxious: moodLogs.filter(log => log.mood === 'anxious').length
  };

  return (
    <div className="admin-container">
      <h2>Counselor Dashboard</h2>
      <p>Overview of platform usage and student engagement.</p>
      
      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Upcoming Bookings</h3>
          <div className="stat-number">{bookings.length}</div>
          <p>Counseling sessions scheduled</p>
        </div>
        
        <div className="stat-card">
          <h3>Mood Check-ins</h3>
          <div className="stat-number">{moodLogs.length}</div>
          <p>Student mood logs recorded</p>
        </div>
        
        <div className="stat-card">
          <h3>Chat Conversations</h3>
          <div className="stat-number">{chatUsage.totalConversations}</div>
          <p>AI support sessions</p>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Recent Bookings</h3>
          {bookings.length > 0 ? (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.name}</td>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No bookings yet.</p>
          )}
        </div>
        
        <div className="dashboard-section">
          <h3>Mood Distribution</h3>
          {moodLogs.length > 0 ? (
            <div className="mood-summary">
              {Object.entries(moodCounts).map(([mood, count]) => (
                count > 0 && (
                  <div key={mood} className="mood-item">
                    <span className="mood-name">{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                    <span className="mood-count">{count} ({Math.round((count / moodLogs.length) * 100)}%)</span>
                  </div>
                )
              ))}
            </div>
          ) : (
            <p>No mood data available.</p>
          )}
        </div>
        
        <div className="dashboard-section">
          <h3>Chat Usage Summary</h3>
          <div className="chat-stats">
            <p><strong>Total Conversations:</strong> {chatUsage.totalConversations}</p>
            <p><strong>Average Session Length:</strong> {chatUsage.avgSessionLength}</p>
            <p><strong>Common Topics:</strong> {chatUsage.commonTopics.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;