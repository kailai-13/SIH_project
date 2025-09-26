// src/components/Auth.jsx
import React, { useState } from 'react';
import { apiService } from '../services/api';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('student-login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    confirmPassword: '',
    age: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const fillDemoAccount = (isAdmin = false) => {
    setFormData({
      name: isAdmin ? 'Demo Admin' : 'Demo Student',
      email: isAdmin ? 'admin@demo.com' : 'student@demo.com',
      password: '123456',
      confirmPassword: '123456',
      studentId: isAdmin ? '' : 'STU12345',
      age: '21'
    });
    setActiveTab(isAdmin ? 'admin-login' : 'student-login');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isLogin = activeTab.includes('login');
      const isStudent = activeTab.includes('student');

      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      if (!isLogin) {
        if (!formData.name) throw new Error('Name is required');
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      let result;
      if (isLogin) {
        result = await apiService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await apiService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? parseInt(formData.age) : null,
          student_id: formData.studentId
        });
      }

      if (result.success) {
        onLogin(result, result.is_admin);
      } else {
        throw new Error(result.detail || 'Authentication failed');
      }

    } catch (error) {
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = activeTab.includes('login');
  const isStudent = activeTab.includes('student');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Student Wellness Platform</h1>
          <p>Mental Health Support System</p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="demo-buttons">
          <button 
            type="button"
            className="demo-btn student"
            onClick={() => fillDemoAccount(false)}
            disabled={loading}
          >
            Use Demo Student Account
          </button>
          <button 
            type="button"
            className="demo-btn admin"
            onClick={() => fillDemoAccount(true)}
            disabled={loading}
          >
            Use Demo Admin Account
          </button>
        </div>

        <div className="auth-tabs">
          <div className="role-selector">
            <button 
              type="button"
              className={`role-btn ${isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'student-login' : 'student-register')}
              disabled={loading}
            >
              Student
            </button>
            <button 
              type="button"
              className={`role-btn ${!isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'admin-login' : 'admin-register')}
              disabled={loading}
            >
              Counselor
            </button>
          </div>

          <div className="auth-type">
            <button 
              type="button"
              className={`auth-type-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-login' : 'admin-login')}
              disabled={loading}
            >
              Login
            </button>
            <button 
              type="button"
              className={`auth-type-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-register' : 'admin-register')}
              disabled={loading}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
          )}

          {!isLogin && isStudent && (
            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Optional student ID"
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="16"
                max="100"
                disabled={loading}
                placeholder="Your age"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              disabled={loading}
              placeholder="At least 6 characters"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                disabled={loading}
                placeholder="Re-enter your password"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">Processing...</span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-info">
          <p className="demo-hint">
            <strong>Tip:</strong> Use the demo buttons above for quick testing
          </p>
          <p className="password-hint">
            Demo accounts password: <code>123456</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;