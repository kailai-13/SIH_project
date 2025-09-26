// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (userData, admin = false) => {
    setUser(userData);
    setIsAdmin(admin);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
  };

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