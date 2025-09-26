// src/App.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import './App.css';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, you would validate the token with the backend
      // For now, we'll just set a basic user object
      setUser({ name: 'User', email: 'user@demo.com' });
      setIsAdmin(token.includes('admin')); // Simple check for demo
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, admin = false) => {
    setUser(userData);
    setIsAdmin(admin);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('authToken');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <>
          <header className="app-header">
            <div className="header-content">
              <h1>Student Wellness Platform</h1>
              <div className="user-info">
                <span>Welcome, {user.name} ({isAdmin ? 'Counselor' : 'Student'})</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          </header>
          
          {isAdmin ? (
            <AdminDashboard user={user} />
          ) : (
            <StudentDashboard user={user} />
          )}
        </>
      )}
    </div>
  );
}

export default App;