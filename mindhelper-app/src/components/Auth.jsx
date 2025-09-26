// src/components/Auth.jsx
import React, { useState } from 'react';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('student-login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (activeTab.includes('register') && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Simulate authentication (in real app, this would call an API)
    const userData = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      studentId: formData.studentId,
      ...(activeTab.includes('admin') && { role: 'admin' })
    };

    onLogin(userData, activeTab.includes('admin'));

    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      studentId: '',
      confirmPassword: ''
    });
  };

  const isLogin = activeTab.includes('login');
  const isStudent = activeTab.includes('student');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Student Wellness Platform</h1>
          <p>Supporting student mental health and well-being</p>
        </div>

        <div className="auth-tabs">
          <div className="role-selector">
            <button 
              className={`role-btn ${isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'student-login' : 'student-register')}
            >
              Student
            </button>
            <button 
              className={`role-btn ${!isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'admin-login' : 'admin-register')}
            >
              Counselor/Admin
            </button>
          </div>

          <div className="auth-type">
            <button 
              className={`auth-type-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-login' : 'admin-login')}
            >
              Login
            </button>
            <button 
              className={`auth-type-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-register' : 'admin-register')}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {isStudent && !isLogin && (
            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
              />
            </div>
          )}

          {!isStudent && isLogin && (
            <div className="form-group">
              <label htmlFor="adminCode">Admin Code</label>
              <input
                type="password"
                id="adminCode"
                name="adminCode"
                placeholder="Enter admin access code"
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-info">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                className="link-btn"
                onClick={() => setActiveTab(isStudent ? 'student-register' : 'admin-register')}
              >
                {isStudent ? 'Student' : 'Admin'} Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                className="link-btn"
                onClick={() => setActiveTab(isStudent ? 'student-login' : 'admin-login')}
              >
                {isStudent ? 'Student' : 'Admin'} Login
              </button>
            </p>
          )}
        </div>

        <div className="demo-accounts">
          <h3>Demo Accounts:</h3>
          <div className="demo-account-list">
            <div className="demo-account">
              <strong>Student:</strong> student@demo.com / password: 123456
            </div>
            <div className="demo-account">
              <strong>Admin:</strong> admin@demo.com / password: 123456
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;