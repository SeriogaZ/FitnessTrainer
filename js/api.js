/**
 * API Service for Auzins.lv Fitness Trainer
 * This file contains functions to interact with the backend API
 */

// Base URL for API requests
const API_BASE_URL = '/api';

/**
 * Fetch API wrapper with error handling
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function fetchAPI(url, options = {}) {
  try {
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Booking API functions
 */
const BookingAPI = {
  /**
   * Get all bookings for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Bookings data
   */
  getBookingsByDate: async (date) => {
    return fetchAPI(`/bookings/date/${date}`);
  },
  
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} - Created booking
   */
  createBooking: async (bookingData) => {
    return fetchAPI('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }
};

/**
 * Admin API functions
 */
const AdminAPI = {
  /**
   * Login as admin
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<Object>} - Auth token and admin data
   */
  login: async (username, password) => {
    const data = await fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    // Save auth token to localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },
  
  /**
   * Logout admin
   * @returns {Promise<Object>} - Logout result
   */
  logout: async () => {
    const data = await fetchAPI('/admin/logout');
    localStorage.removeItem('authToken');
    return data;
  },
  
  /**
   * Get all bookings (admin only)
   * @returns {Promise<Object>} - All bookings
   */
  getAllBookings: async () => {
    return fetchAPI('/bookings');
  },
  
  /**
   * Block a time slot
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @returns {Promise<Object>} - Blocked slot data
   */
  blockTimeSlot: async (date, time) => {
    return fetchAPI('/admin/block-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time })
    });
  },
  
  /**
   * Unblock a time slot
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @returns {Promise<Object>} - Unblock result
   */
  unblockTimeSlot: async (date, time) => {
    return fetchAPI('/admin/unblock-slot', {
      method: 'POST',
      body: JSON.stringify({ date, time })
    });
  }
};

/**
 * Settings API functions
 */
const SettingsAPI = {
  /**
   * Get current settings
   * @returns {Promise<Object>} - Settings data
   */
  getSettings: async () => {
    return fetchAPI('/settings');
  },
  
  /**
   * Update settings (admin only)
   * @param {Object} settingsData - New settings
   * @returns {Promise<Object>} - Updated settings
   */
  updateSettings: async (settingsData) => {
    return fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }
};

// Export API functions
const API = {
  Booking: BookingAPI,
  Admin: AdminAPI,
  Settings: SettingsAPI
};

// Make API available globally for browser environment
window.API = API;
