/**
 * API Service for Auzins.lv Fitness Trainer
 * This file contains functions to interact with the backend API
 */

// Base URL for API requests
// Automatically detect if we need to use full URL (when opening HTML directly)
const API_BASE_URL = (window.location.protocol === 'file:' || window.location.port === '')
  ? 'http://localhost:5000/api'
  : '/api';

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
  
};

// Export API functions
const API = {
  Booking: BookingAPI,
  Settings: SettingsAPI
};
