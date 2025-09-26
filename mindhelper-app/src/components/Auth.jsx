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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isLogin = activeTab.includes('login');
      const isStudent = activeTab.includes('student');

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (isLogin) {
        // Login
        const result = await apiService.login({
          email: formData.email,
          password: formData.password
        });
        
        onLogin(result, result.is_admin);
      } else {
        // Register
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? parseInt(formData.age) : null,
          student_id: formData.studentId
        };

        const result = await apiService.register(userData);
        onLogin(result, result.is_admin);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        studentId: '',
        confirmPassword: '',
        age: ''
      });

    } catch (error) {
      setError(error.message || 'Authentication failed');
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
          <p>Supporting student mental health and well-being</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="auth-tabs">
          <div className="role-selector">
            <button 
              type="button"
              className={`role-btn ${isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'student-login' : 'student-register')}
            >
              Student
            </button>
            <button 
              type="button"
              className={`role-btn ${!isStudent ? 'active' : ''}`}
              onClick={() => setActiveTab(isLogin ? 'admin-login' : 'admin-register')}
            >
              Counselor/Admin
            </button>
          </div>

          <div className="auth-type">
            <button 
              type="button"
              className={`auth-type-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-login' : 'admin-login')}
            >
              Login
            </button>
            <button 
              type="button"
              className={`auth-type-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setActiveTab(isStudent ? 'student-register' : 'admin-register')}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
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
                />
              </div>

              {isStudent && (
                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              )}

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
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
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
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="auth-info">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                className="link-btn"
                onClick={() => setActiveTab(isStudent ? 'student-register' : 'admin-register')}
                disabled={loading}
              >
                {isStudent ? 'Student' : 'Admin'} Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                className="link-btn"
                onClick={() => setActiveTab(isStudent ? 'student-login' : 'admin-login')}
                disabled={loading}
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