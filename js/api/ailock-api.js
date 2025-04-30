/**
 * Ailock API client module
 * Provides access to Ailock services for AI assistance and user profile management
 */

import API_CONFIG from '../config/config.js';

/**
 * Client for interacting with the Ailock API service
 */
class AilockClient {
  /**
   * Initialize the Ailock API client
   * @param {string} baseUrl - Base URL for API requests
   * @param {string} apiKey - API key for authentication
   */
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint to call
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {object} body - Request body (for POST, PATCH, etc.)
   * @returns {Promise<any>} - Promise with response data
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const options = {
      method,
      headers,
      credentials: 'include'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request error');
      }

      return await response.json();
    } catch (error) {
      console.error(`Ailock API request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    return this.request(`/user/profile/${userId}`);
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, profileData) {
    return this.request(`/user/profile/${userId}`, 'PATCH', profileData);
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result of operation
   */
  async changeUserPassword(userId, currentPassword, newPassword) {
    return this.request(`/user/password/${userId}`, 'POST', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updateUserPreferences(userId, preferences) {
    return this.request(`/user/preferences/${userId}`, 'PATCH', preferences);
  }

  /**
   * Get AI assistant response
   * @param {string} userId - User ID
   * @param {string} prompt - User prompt
   * @returns {Promise<Object>} AI response
   */
  async getAiResponse(userId, prompt) {
    return this.request('/ai/chat', 'POST', {
      userId,
      prompt
    });
  }
}

// Initialize and export the API client using configuration from config.js
import config from '../config/config.js';

// Use the AILOCK_API_URL and token from the configuration
export const ailockApi = new AilockClient(
  config.AILOCK_API_URL,
  config.AILOCK_TOKEN
);
