// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import AdminStats from './AdminStats';
import StudentManagement from './StudentManagement';
import BookingManagement from './BookingManagement';
import MoodAnalytics from './MoodAnalytics';
import { apiService } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify admin access
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(''); // Clear any previous errors
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await apiService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  if (error && !user) {
    return (
      <div className="dashboard error-state">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={onLogout} className="action-btn">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Student Wellness Platform</h1>
            <p className="header-subtitle">Counselor Dashboard</p>
          </div>
          <div className="header-actions">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.name}</span>
              <span className="user-role">({user?.role})</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              disabled={loading}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => handleTabChange('stats')}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => handleTabChange('bookings')}
        >
          <span className="nav-icon">📅</span>
          Bookings
        </button>
        <button 
          className={activeTab === 'students' ? 'active' : ''} 
          onClick={() => handleTabChange('students')}
        >
          <span className="nav-icon">👥</span>
          Students
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => handleTabChange('analytics')}
        >
          <span className="nav-icon">📈</span>
          Analytics
        </button>
      </nav>
      
      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'bookings' && <BookingManagement />}
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'analytics' && <MoodAnalytics />}
      </main>
    </div>
  );
};

export default AdminDashboard;
