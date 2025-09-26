// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import './Dashboard.css';
import AdminStats from './AdminStats';
import StudentManagement from './StudentManagement';
import BookingManagement from './BookingManagement';
import MoodAnalytics from './MoodAnalytics';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
        <button 
          className={activeTab === 'students' ? 'active' : ''} 
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''} 
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Counselor Dashboard</h2>
          <p>Welcome, {user.name}. Here's an overview of platform activity.</p>
        </div>
        
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'bookings' && <BookingManagement />}
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'analytics' && <MoodAnalytics />}
      </main>
    </div>
  );
};

export default AdminDashboard;