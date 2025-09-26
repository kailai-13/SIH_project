// src/components/AdminStats.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './AdminStats.css';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setError('');
      const [statsData, usersData, bookingsData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAllUsers(),
        apiService.getAllBookings()
      ]);

      setStats(statsData.stats);
      setUsers(usersData.users || []);
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
  };

  // Get recent activities from bookings and users
  const getRecentActivities = () => {
    const activities = [];
    
    // Add recent bookings
    bookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
      .forEach(booking => {
        activities.push({
          id: `booking-${booking.id}`,
          student: booking.user_name,
          action: `Booked counseling session for ${booking.date} at ${booking.time}`,
          time: formatTimeAgo(booking.created_at),
          type: 'booking'
        });
      });

    // Add recent user registrations
    users
      .filter(user => user.role === 'student')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2)
      .forEach(user => {
        activities.push({
          id: `user-${user.user_id}`,
          student: user.name,
          action: 'Registered on the platform',
          time: formatTimeAgo(user.created_at),
          type: 'registration'
        });
      });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return time.toLocaleDateString();
  };

  const quickActions = [
    {
      title: 'View All Bookings',
      action: () => window.location.hash = '#bookings',
      icon: '📅'
    },
    {
      title: 'Manage Students',
      action: () => window.location.hash = '#students',
      icon: '👥'
    },
    {
      title: 'View Analytics',
      action: () => window.location.hash = '#analytics',
      icon: '📈'
    },
    {
      title: 'Refresh Data',
      action: handleRefresh,
      icon: '🔄'
    }
  ];

  if (loading) {
    return (
      <div className="admin-stats loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-stats error">
        <div className="error-state">
          <h3>⚠️ Unable to Load Dashboard</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <div className="admin-stats">
      <div className="stats-header">
        <h2>Platform Overview</h2>
        <button 
          onClick={handleRefresh} 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Warning:</strong> {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <div className="stat-number">{stats?.student_users || 0}</div>
            <p>{stats?.active_users || 0} active users</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <div className="stat-number">{stats?.total_bookings || 0}</div>
            <p>{stats?.pending_bookings || 0} pending</p>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">💭</div>
          <div className="stat-content">
            <h3>Mood Entries</h3>
            <div className="stat-number">{stats?.total_mood_entries || 0}</div>
            <p>Mental health check-ins</p>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>Counselors</h3>
            <div className="stat-number">{stats?.admin_users || 0}</div>
            <p>Platform administrators</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activities">
          <h3>Recent Activities</h3>
          {recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`activity-item ${activity.type}`}>
                  <div className="activity-icon">
                    {activity.type === 'booking' ? '📅' : '👤'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <strong>{activity.student}</strong> {activity.action}
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent activities to display</p>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            {quickActions.map((action, index) => (
              <button 
                key={index} 
                className="action-btn"
                onClick={action.action}
                disabled={refreshing && action.title === 'Refresh Data'}
              >
                <span className="action-icon">{action.icon}</span>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <h4>Platform Health</h4>
          <div className="health-indicators">
            <div className="indicator">
              <span className="indicator-dot success"></span>
              <span>API Status: Online</span>
            </div>
            <div className="indicator">
              <span className="indicator-dot success"></span>
              <span>Database: Connected</span>
            </div>
            <div className="indicator">
              <span className="indicator-dot warning"></span>
              <span>Last Updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
