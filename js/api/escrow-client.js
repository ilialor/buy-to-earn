/**
 * EscrowClient - Client for working with Escrow API
 * Handles all requests to the Escrow API backend
 */

export class EscrowClient {
  /**
   * Initialize the Escrow API client
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
    // Import auth service for JWT tokens
    const authService = await import('../auth/index.js').then(module => module.default);
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add JWT token if available
    const token = authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (this.apiKey) {
      // Fallback to API key if no JWT token
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const options = {
      method,
      headers,
      credentials: 'include' // Important for cookies
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(url, options);
      
      // Handle authentication errors
      if (response.status === 401 && token) {
        // Try to refresh token
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Update token in headers and retry request
          headers['Authorization'] = `Bearer ${authService.getAccessToken()}`;
          options.headers = headers;
          response = await fetch(url, options);
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request error');
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  // User Methods

  /**
   * Create a new user
   * @param {Object} userData - User data (name, email, type, initialBalance)
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userData) {
    try {
      // Пытаемся создать пользователя через API
      const result = await this.request('/users', 'POST', userData);
      return result;
    } catch (error) {
      console.warn('Ошибка при создании пользователя на сервере:', error);
      
      // Создаем локальный фиктивный ID в формате 'local-{timestamp}-{random}'
      const temporaryId = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Возвращаем временный объект пользователя
      return {
        id: temporaryId,
        name: userData.name,
        email: userData.email,
        type: userData.type,
        balance: userData.initialBalance || 0,
        createdAt: new Date().toISOString(),
        // Добавляем флаг, указывающий, что это локальный пользователь
        _isLocalOnly: true
      };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  /**
   * Update user balance
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add (positive) or subtract (negative)
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserBalance(userId, amount) {
    return this.request(`/users/${userId}/balance`, 'PATCH', { amount });
  }

  // Order Methods

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    return this.request('/orders', 'POST', orderData);
  }

  /**
   * Create a group order
   * @param {Object} groupOrderData - Group order data
   * @returns {Promise<Object>} Created group order
   */
  async createGroupOrder(groupOrderData) {
    return this.request('/group-orders', 'POST', groupOrderData);
  }

  /**
   * Get all orders
   * @returns {Promise<Array>} List of orders
   */
  async getOrders() {
    console.log('Getting orders from Escrow API');
    console.log('Request from EscrowClient: ', this);
    return this.request('/orders');
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }
  
  /**
   * Get all users from the system
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    return this.request('/users');
  }

  /**
   * Fund an order
   * @param {string} orderId - Order ID
   * @param {Object} fundData - Funding data (customerId, amount)
   * @returns {Promise<Object>} Updated order
   */
  async fundOrder(orderId, fundData) {
    return this.request(`/orders/${orderId}/fund`, 'POST', fundData);
  }

  /**
   * Assign contractor to order
   * @param {string} orderId - Order ID
   * @param {Object} assignData - Assignment data (contractorId)
   * @returns {Promise<Object>} Updated order
   */
  async assignContractor(orderId, assignData) {
    return this.request(`/orders/${orderId}/assign`, 'POST', assignData);
  }

  /**
   * Mark milestone as complete
   * @param {string} orderId - Order ID
   * @param {string} milestoneId - Milestone ID
   * @param {Object} completionData - Completion data
   * @returns {Promise<Object>} Updated milestone and created act
   */
  async completeMilestone(orderId, milestoneId, completionData) {
    return this.request(`/orders/${orderId}/milestones/${milestoneId}/complete`, 'POST', completionData);
  }

  /**
   * Vote for representative in group order
   * @param {string} orderId - Order ID
   * @param {Object} voteData - Vote data
   * @returns {Promise<Object>} Updated order with vote information
   */
  async voteForRepresentative(orderId, voteData) {
    return this.request(`/orders/${orderId}/vote`, 'POST', voteData);
  }

  // Acts Methods

  /**
   * Create an act
   * @param {Object} actData - Act data
   * @returns {Promise<Object>} Created act
   */
  async createAct(actData) {
    return this.request('/acts', 'POST', actData);
  }

  /**
   * Sign an act
   * @param {string} actId - Act ID
   * @param {Object} signData - Signing data (userId)
   * @returns {Promise<Object>} Updated act
   */
  async signAct(actId, signData) {
    return this.request(`/acts/${actId}/sign`, 'POST', signData);
  }

  /**
   * Reject an act
   * @param {string} actId - Act ID
   * @param {Object} rejectData - Rejection data (userId, reason)
   * @returns {Promise<Object>} Updated act
   */
  async rejectAct(actId, rejectData) {
    return this.request(`/acts/${actId}/reject`, 'POST', rejectData);
  }

  // Documents Methods

  /**
   * Create a document
   * @param {Object} documentData - Document data
   * @returns {Promise<Object>} Created document
   */
  async createDocument(documentData) {
    return this.request('/documents', 'POST', documentData);
  }

  /**
   * Generate a document using AI
   * @param {string} type - Document type (DoR, Roadmap, DoD)
   * @param {Object} documentData - Document data for generation
   * @returns {Promise<Object>} Generated document
   */
  async generateDocument(type, documentData) {
    return this.request(`/documents/generate/${type}`, 'POST', documentData);
  }

  /**
   * Validate a deliverable
   * @param {Object} validationData - Validation data
   * @returns {Promise<Object>} Validation result
   */
  async validateDeliverable(validationData) {
    return this.request('/documents/validate', 'POST', validationData);
  }
}
