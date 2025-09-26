// src/services/api.js
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

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.reload();
        }
        
        // Handle validation errors
        if (response.status === 422 && data.detail) {
          const errorMessages = data.detail
            .map(err => `${err.loc.join('.')}: ${err.msg}`)
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
    // First register the user
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Then automatically log them in
    const loginResult = await this.login({
      email: userData.email,
      password: userData.password
    });
    
    return {
      ...result,
      token: loginResult.access_token,
      token_type: loginResult.token_type
    };
  }

  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (result.access_token) {
      this.setToken(result.access_token);
      
      // Get user details
      try {
        const userDetails = await this.getCurrentUser();
        this.setUser(userDetails);
        
        return {
          success: true,
          token: result.access_token,
          token_type: result.token_type,
          user: userDetails,
          is_admin: userDetails.role === 'admin'
        };
      } catch (error) {
        console.error('Failed to get user details:', error);
        throw error;
      }
    }
    
    return result;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Chat endpoints
  async startChat() {
    return this.request('/chat/start', { method: 'POST' });
  }

  async sendMessage(message, sessionId = null) {
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
