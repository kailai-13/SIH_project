// src/services/api.js
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
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

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
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
    await this.request('/auth/logout', { method: 'POST' });
    this.removeToken();
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

  async endChat() {
    return this.request('/chat/end', { method: 'POST' });
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

  async getMoodAnalytics() {
    return this.request('/mood/analytics');
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

export const apiService = new ApiService();