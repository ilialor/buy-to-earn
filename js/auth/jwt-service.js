/**
 * Auth Service for JWT-based authentication
 * Handles login, token refresh, and user data management
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.accessToken = localStorage.getItem('access_token');
    
    // Check for token expiration
    this._setupTokenRefresh();
  }
  
  /**
   * Set up automatic token refresh
   * @private
   */
  _setupTokenRefresh() {
    // Check token every minute
    setInterval(() => {
      if (this.isAuthenticated()) {
        this._checkAndRefreshToken();
      }
    }, 60000); // 1 minute
    
    // Also check on page load
    this._checkAndRefreshToken();
  }
  
  /**
   * Check if token needs refresh
   * @private
   */
  async _checkAndRefreshToken() {
    if (!this.accessToken) return;
    
    try {
      // Decode JWT to check expiration
      const payload = this._parseJwt(this.accessToken);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (expirationTime - currentTime < 5 * 60 * 1000) {
        console.log('Token expires soon, refreshing...');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token:', error);
      this.logout();
    }
  }
  
  /**
   * Parse JWT token to get payload
   * @param {string} token - JWT token
   * @returns {object} Decoded payload
   * @private
   */
  _parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  }
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {Promise<object>} User data
   */
  async register(email, password, username) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username }),
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      // After successful registration, log in automatically
      return await this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User data
   */
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store access token
      this.accessToken = data.accessToken;
      localStorage.setItem('access_token', this.accessToken);
      
      // Load user profile
      await this.loadUserProfile();
      
      // Notify about user change
      document.dispatchEvent(new Event('userChanged'));
      
      return this.currentUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @returns {Promise<boolean>} Success status
   */
  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for refresh token cookie
      });
      
      if (!response.ok) {
        console.warn('Token refresh failed, logging out');
        this.logout();
        return false;
      }
      
      const data = await response.json();
      
      // Update access token
      this.accessToken = data.accessToken;
      localStorage.setItem('access_token', this.accessToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }
  
  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint to invalidate refresh token
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local data
    this.accessToken = null;
    this.currentUser = null;
    localStorage.removeItem('access_token');
    
    // Notify about user change
    document.dispatchEvent(new Event('userChanged'));
  }
  
  /**
   * Load user profile data
   * @returns {Promise<object>} User profile
   */
  async loadUserProfile() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token on 401
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            return this.loadUserProfile();
          } else {
            throw new Error('Authentication failed');
          }
        }
        throw new Error('Failed to load user profile');
      }
      
      this.currentUser = await response.json();
      return this.currentUser;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.accessToken;
  }
  
  /**
   * Get current user
   * @returns {object|null} Current user or null if not authenticated
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Get access token
   * @returns {string|null} Access token or null if not authenticated
   */
  getAccessToken() {
    return this.accessToken;
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
