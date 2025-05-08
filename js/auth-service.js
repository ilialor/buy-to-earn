/**
 * Authentication Service for Ateira projects
 * Handles JWT authentication through Nginx API Gateway
 */

class AuthService {
  constructor() {
    // Используем window.apiBaseUrl вместо process.env, который не работает в браузере
    this.baseUrl = window.apiBaseUrl || window.API_BASE_URL || 'http://localhost';
    this.accessToken = localStorage.getItem('access_token') || null;
    this.refreshToken = this.getCookie('refresh_token') || null;
    this.currentUser = null;
    this.listeners = [];
    this.init();
  }

  init() {
    // Check if there's a saved user
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log('AuthService: User restored from localStorage', this.currentUser);
      } catch (e) {
        console.error('AuthService: Error restoring user', e);
        localStorage.removeItem('current_user');
      }
    }

    // Notify listeners if user exists
    if (this.currentUser) {
      this.notifyListeners();
    }
  }

  // Login through Nginx API Gateway
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Store tokens
      localStorage.setItem('access_token', this.accessToken);
      document.cookie = `refresh_token=${this.refreshToken}; path=/; HttpOnly; SameSite=None; Secure`;

      // Fetch user profile
      await this.loadUserProfile();

      return this.currentUser;
    } catch (error) {
      console.error('AuthService: Login failed', error);
      throw error;
    }
  }

  // Refresh tokens through Nginx API Gateway
  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'PUT', // Изменено с POST на PUT для соответствия API Gateway
        credentials: 'include', // Cookie передаются автоматически
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Update stored tokens
      localStorage.setItem('access_token', this.accessToken);
      document.cookie = `refresh_token=${this.refreshToken}; path=/; HttpOnly; SameSite=None; Secure`;

      return true;
    } catch (error) {
      console.error('AuthService: Token refresh failed', error);
      this.logout();
      return false;
    }
  }

  // Logout through Nginx API Gateway
  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'DELETE', // Изменено с POST на DELETE для соответствия API Gateway
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('AuthService: Logout request failed, clearing local data anyway', response.status);
      }

      // Clear local data
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=None; Secure';
      this.accessToken = null;
      this.refreshToken = null;
      this.currentUser = null;

      // Notify listeners
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('AuthService: Logout failed', error);
      return false;
    }
  }

  // Load user profile
  async loadUserProfile() {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const userData = await response.json();
      this.currentUser = userData;
      localStorage.setItem('current_user', JSON.stringify(userData));

      // Notify listeners
      this.notifyListeners();

      return userData;
    } catch (error) {
      console.error('AuthService: Failed to load user profile', error);
      return null;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Get Authorization header
  getAuthHeader() {
    return this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {};
  }

  // Add auth headers to fetch options
  addAuthHeaders(options = {}) {
    if (this.accessToken) {
      options.headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }
    options.credentials = 'include';
    return options;
  }

  // Add listener for auth state changes
  addAuthStateListener(listener) {
    this.listeners.push(listener);
    if (this.currentUser) {
      listener(this.currentUser);
    }
  }

  // Remove listener
  removeAuthStateListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners of auth state change
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('AuthService: Error in listener', e);
      }
    });
  }

  // Utility to get cookie by name
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}

// Export singleton instance
export default new AuthService();
