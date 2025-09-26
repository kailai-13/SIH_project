// src/components/AdminStats.jsx
import React from 'react';
import './AdminStats.css';

const AdminStats = () => {
  // Sample data - in real app, this would come from API
  const stats = {
    totalStudents: 247,
    activeBookings: 18,
    moodCheckins: 156,
    chatSessions: 89,
    resourcesAccessed: 342
  };

  const recentActivities = [
    { id: 1, student: 'John Doe', action: 'Booked counseling session', time: '2 hours ago' },
    { id: 2, student: 'Sarah Smith', action: 'Completed mood check-in', time: '3 hours ago' },
    { id: 3, student: 'Mike Johnson', action: 'Accessed stress management resources', time: '5 hours ago' },
    { id: 4, student: 'Emily Chen', action: 'Chat session about anxiety', time: '1 day ago' }
  ];

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <div className="stat-number">{stats.totalStudents}</div>
          <p>Registered users</p>
        </div>
        
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <div className="stat-number">{stats.activeBookings}</div>
          <p>Upcoming sessions</p>
        </div>
        
        <div className="stat-card">
          <h3>Mood Check-ins</h3>
          <div className="stat-number">{stats.moodCheckins}</div>
          <p>This week</p>
        </div>
        
        <div className="stat-card">
          <h3>Chat Sessions</h3>
          <div className="stat-number">{stats.chatSessions}</div>
          <p>This month</p>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <strong>{activity.student}</strong> {activity.action}
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">View All Bookings</button>
          <button className="action-btn">Add New Resource</button>
          <button className="action-btn">Generate Report</button>
          <button className="action-btn">Send Announcement</button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;