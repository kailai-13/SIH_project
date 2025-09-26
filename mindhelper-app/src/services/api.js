// src/services/api.js - FIXED VERSION
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  removeToken() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }

  isStudent() {
    return this.user?.role === 'student';
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists - FIXED FORMAT
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      console.log(`With headers:`, config.headers);
      
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      console.log(`Response status: ${response.status}`);
      console.log(`Response data:`, data);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 error - removing token and reloading');
          this.removeToken();
          // Don't reload automatically, let the app handle it
          throw new Error('Authentication failed. Please login again.');
        }
        
        // Handle validation errors (422)
        if (response.status === 422 && data.detail) {
          const errorMessages = data.detail
            .map(err => `${err.loc?.slice(-1)[0] || 'field'}: ${err.msg}`)
            .join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    try {
      // First register the user
      const result = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      console.log('Registration successful:', result);
      
      // Then automatically log them in
      const loginResult = await this.login({
        email: userData.email,
        password: userData.password
      });
      
      return {
        success: true,
        user: loginResult.user,
        token: loginResult.token,
        is_admin: loginResult.is_admin
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('Login result:', result);
      
      // Handle both token formats
      const token = result.access_token || result.token;
      
      if (token) {
        this.setToken(token);
        
        // Get user details
        const userDetails = await this.getCurrentUser();
        this.setUser(userDetails);
        
        return {
          success: true,
          token: token,
          token_type: result.token_type || 'bearer',
          user: userDetails,
          is_admin: userDetails.role === 'admin'
        };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.token) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if server request fails
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser() {
    if (!this.token) {
      throw new Error('No authentication token');
    }
    return this.request('/auth/me');
  }

  // Chat endpoints
  async startChat() {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    return this.request('/chat/start', { method: 'POST' });
  }

  async sendMessage(message, sessionId = null) {
    if (!this.token) {
      throw new Error('Authentication required');
    }
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  // Booking endpoints
  async createBooking(bookingData) {
    return this.request('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async getAllBookings() {
    return this.request('/bookings/all');
  }

  // Mood endpoints
  async addMoodEntry(moodData) {
    return this.request('/mood/entry', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  }

  async getMoodHistory() {
    return this.request('/mood/history');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllUsers() {
    return this.request('/admin/users');
  }
}

export const apiService = new ApiService();
