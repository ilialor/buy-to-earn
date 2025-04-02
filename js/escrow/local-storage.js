/**
 * Local Storage for Escrow
 * In-memory database simulator with localStorage persistence for escrow data
 */

class EscrowLocalStorage {
  constructor() {
    // Storage keys
    this.keys = {
      users: 'escrow_users',
      orders: 'escrow_orders'
    };
    
    // In-memory cache
    this.users = {};
    this.orders = {};
    
    // Load data from localStorage
    this._loadData();
    
    console.log('EscrowLocalStorage initialized');
  }
  
  // Private: Load data from localStorage
  _loadData() {
    try {
      const usersJson = localStorage.getItem(this.keys.users);
      if (usersJson) {
        this.users = JSON.parse(usersJson);
        console.log(`Loaded ${Object.keys(this.users).length} users from localStorage`);
      }
      
      const ordersJson = localStorage.getItem(this.keys.orders);
      if (ordersJson) {
        this.orders = JSON.parse(ordersJson);
        console.log(`Loaded ${Object.keys(this.orders).length} orders from localStorage`);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Initialize empty data
      this.users = {};
      this.orders = {};
      this._saveData();
    }
  }
  
  // Private: Save data to localStorage
  _saveData() {
    try {
      localStorage.setItem(this.keys.users, JSON.stringify(this.users));
      localStorage.setItem(this.keys.orders, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      
      // If localStorage is full, try to clear some space by removing old logs
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Trying to clear space...');
        
        // Find keys to remove (you might want to implement your own strategy)
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('log_') || key.includes('_log')) {
            localStorage.removeItem(key);
          }
        }
        
        // Try again
        try {
          localStorage.setItem(this.keys.users, JSON.stringify(this.users));
          localStorage.setItem(this.keys.orders, JSON.stringify(this.orders));
          console.log('Successfully saved data after clearing space');
        } catch (retryError) {
          console.error('Failed to save data even after clearing space:', retryError);
        }
      }
    }
  }
  
  // User methods
  getUser(userId) {
    return this.users[userId] || null;
  }
  
  getAllUsers() {
    return Object.values(this.users);
  }
  
  saveUser(userData) {
    if (!userData || !userData.user_id) {
      console.error('Invalid user data:', userData);
      return false;
    }
    
    this.users[userData.user_id] = userData;
    this._saveData();
    return true;
  }
  
  updateUser(userId, updateData) {
    const user = this.getUser(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return false;
    }
    
    // Apply updates
    this.users[userId] = { ...user, ...updateData };
    this._saveData();
    return true;
  }
  
  deleteUser(userId) {
    if (this.users[userId]) {
      delete this.users[userId];
      this._saveData();
      return true;
    }
    return false;
  }
  
  // Order methods
  getOrder(orderId) {
    return this.orders[orderId] || null;
  }
  
  getAllOrders() {
    return Object.values(this.orders);
  }
  
  saveOrder(orderData) {
    if (!orderData || !orderData.order_id) {
      console.error('Invalid order data:', orderData);
      return false;
    }
    
    this.orders[orderData.order_id] = orderData;
    this._saveData();
    return true;
  }
  
  updateOrder(orderId, updateData) {
    const order = this.getOrder(orderId);
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return false;
    }
    
    // Apply updates
    this.orders[orderId] = { ...order, ...updateData };
    this._saveData();
    return true;
  }
  
  deleteOrder(orderId) {
    if (this.orders[orderId]) {
      delete this.orders[orderId];
      this._saveData();
      return true;
    }
    return false;
  }
  
  // Query methods
  getUsersByType(userType) {
    return Object.values(this.users).filter(user => user.user_type === userType);
  }
  
  getOrdersByStatus(status) {
    return Object.values(this.orders).filter(order => order.status === status);
  }
  
  getOrdersByCreator(creatorId) {
    return Object.values(this.orders).filter(order => order.creator_id === creatorId);
  }
  
  getOrdersByContractor(contractorId) {
    return Object.values(this.orders).filter(order => order.contractor_id === contractorId);
  }
  
  getOrdersByContribution(userId) {
    return Object.values(this.orders).filter(order => 
      order.contributions && order.contributions[userId]
    );
  }
  
  // Clear all data
  clearAllData() {
    this.users = {};
    this.orders = {};
    this._saveData();
    console.log('All escrow data cleared');
  }
}

// Export the class
export default EscrowLocalStorage; 