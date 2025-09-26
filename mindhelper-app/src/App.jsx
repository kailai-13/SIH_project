// src/App.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      // Try to get user info
      apiService.getCurrentUser()
        .then(userInfo => {
          setUser(userInfo);
          setIsAdmin(userInfo.is_admin || false);
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, admin = false) => {
    setUser(userData);
    setIsAdmin(admin);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setIsAdmin(false);
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
        <div className="dashboard">
          <header className="app-header">
            <h1>Welcome to Student Wellness Platform</h1>
            <div className="user-info">
              <p>Hello, {user.name} ({isAdmin ? 'Counselor' : 'Student'})</p>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </header>
          
          <main className="main-content">
            <div className="welcome-message">
              <h2>Authentication Successful! 🎉</h2>
              <p>Your backend is working correctly.</p>
              <div className="user-details">
                <h3>User Information:</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {isAdmin ? 'Administrator/Counselor' : 'Student'}</p>
                <p><strong>User ID:</strong> {user.user_id}</p>
              </div>
              
              <div className="next-steps">
                <h3>Next Steps:</h3>
                <ul>
                  <li>✅ Authentication is working</li>
                  <li>✅ Backend connection established</li>
                  <li>🔲 Implement chat interface</li>
                  <li>🔲 Add booking system</li>
                  <li>🔲 Create mood tracker</li>
                  <li>🔲 Build admin dashboard</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;