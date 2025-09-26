// src/components/StudentDashboard.jsx
import React, { useState } from 'react';
import './Dashboard.css';
import OllamaChatbot from './OllamaChatbot';
import BookingSystem from './BookingSystem';
import ResourceHub from './ResourceHub';
import MoodTracker from './MoodTracker';

const StudentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [bookings, setBookings] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);

  const addBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now(), studentId: user.studentId };
    setBookings([...bookings, newBooking]);
  };

  const addMoodLog = (moodLog) => {
    const newMoodLog = { 
      ...moodLog, 
      id: Date.now(), 
      studentId: user.studentId,
      studentName: user.name,
      timestamp: new Date().toLocaleString() 
    };
    setMoodLogs([...moodLogs, newMoodLog]);
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'chatbot' ? 'active' : ''} 
          onClick={() => setActiveTab('chatbot')}
        >
          AI Support
        </button>
        <button 
          className={activeTab === 'booking' ? 'active' : ''} 
          onClick={() => setActiveTab('booking')}
        >
          Book Counseling
        </button>
        <button 
          className={activeTab === 'resources' ? 'active' : ''} 
          onClick={() => setActiveTab('resources')}
        >
          Resource Hub
        </button>
        <button 
          className={activeTab === 'mood' ? 'active' : ''} 
          onClick={() => setActiveTab('mood')}
        >
          Mood Tracker
        </button>
      </nav>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome back, {user.name}!</h2>
          <p>How are you feeling today?</p>
        </div>
        
        {activeTab === 'chatbot' && <OllamaChatbot />}
        {activeTab === 'booking' && <BookingSystem addBooking={addBooking} />}
        {activeTab === 'resources' && <ResourceHub />}
        {activeTab === 'mood' && <MoodTracker addMoodLog={addMoodLog} moodLogs={moodLogs} />}
      </main>
    </div>
  );
};

export default StudentDashboard;