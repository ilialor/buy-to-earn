/**
 * AilockClient - client for interacting with AI assistant service
 * with JWT authentication support
 */
export class AilockClient {
  constructor(baseUrl, token = '') {
    this.baseUrl = baseUrl;
    this.legacyToken = token; // Keep legacy token for backward compatibility
  }

  /**
   * Send message to the AI assistant
   * @param {string} sessionId - Session identifier
   * @param {string} message - User message
   * @returns {Promise<object>} - Assistant response
   */
  async sendMessage(sessionId, message) {
    // Import auth service for JWT tokens
    const authService = await import('../auth/index.js').then(module => module.default);
    
    const url = `${this.baseUrl}/api/v1/assistant/query`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add JWT token if available
    const jwtToken = authService.getAccessToken();
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    } else if (this.legacyToken) {
      // Fallback to legacy token if no JWT token
      headers['Authorization'] = `Bearer ${this.legacyToken}`;
    }
    
    const body = JSON.stringify({ sessionId, message });
    
    try {
      let response = await fetch(url, { method: 'POST', headers, body });
      
      // Handle authentication errors
      if (response.status === 401 && jwtToken) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Update token in headers and retry request
          headers['Authorization'] = `Bearer ${authService.getAccessToken()}`;
          response = await fetch(url, { method: 'POST', headers, body });
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ailock request failed');
      }
      return await response.json();
    } catch (error) {
      console.error(`Ailock API request failed: ${error.message}`);
      throw error;
    }
  }
}
