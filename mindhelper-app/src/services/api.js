// src/services/api.js
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
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
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.reload();
        }
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (result.token) {
      this.setToken(result.token);
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
}

export const apiService = new ApiService();