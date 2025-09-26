// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import OllamaChatbot from './components/OllamaChatbot';
import BookingSystem from './components/BookingSystem';
import ResourceHub from './components/ResourceHub';
import MoodTracker from './components/MoodTracker';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [bookings, setBookings] = useState([]);
  const [moodLogs, setMoodLogs] = useState([]);

  // Function to add a new booking
  const addBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now() };
    setBookings([...bookings, newBooking]);
  };

  // Function to add a new mood log
  const addMoodLog = (moodLog) => {
    const newMoodLog = { ...moodLog, id: Date.now(), timestamp: new Date().toLocaleString() };
    setMoodLogs([...moodLogs, newMoodLog]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Student Wellness Platform</h1>
        <p>Supporting student mental health and well-being</p>
      </header>
      
      <nav className="main-nav">
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
        <button 
          className={activeTab === 'admin' ? 'active' : ''} 
          onClick={() => setActiveTab('admin')}
        >
          Counselor Dashboard
        </button>
      </nav>
      
      <main className="main-content">
        {activeTab === 'chatbot' && <OllamaChatbot />}
        {activeTab === 'booking' && <BookingSystem addBooking={addBooking} />}
        {activeTab === 'resources' && <ResourceHub />}
        {activeTab === 'mood' && <MoodTracker addMoodLog={addMoodLog} moodLogs={moodLogs} />}
        {activeTab === 'admin' && <AdminDashboard bookings={bookings} moodLogs={moodLogs} />}
      </main>
      
      <footer className="app-footer">
        <p>Student Wellness Platform - Demo Interface for Integration with Backend</p>
      </footer>
    </div>
  );
}

export default App;