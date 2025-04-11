/**
 * Mock API Implementation for Testing
 * This file provides mock implementations of API services for testing
 */

// Mock API responses
const mockResponses = {
  // User responses
  userRegistration: {
    success: true,
    data: {
      id: 'mock-user-id',
      type: 'CUSTOMER',
      name: 'Test User',
      email: 'test@example.com',
      balance: 1000
    }
  },
  
  currentUser: {
    success: true,
    data: {
      id: 'mock-user-id',
      type: 'CUSTOMER',
      name: 'Test User',
      email: 'test@example.com',
      balance: 1000
    }
  },
  
  // Order responses
  orderCreation: {
    success: true,
    data: {
      id: 'mock-order-id',
      title: 'Test Order',
      description: 'Test order description',
      creatorId: 'mock-user-id',
      status: 'PENDING',
      totalAmount: 300,
      fundedAmount: 0,
      milestones: [
        { id: 'mock-milestone-1', description: 'First milestone', amount: 100, status: 'PENDING' },
        { id: 'mock-milestone-2', description: 'Second milestone', amount: 200, status: 'PENDING' }
      ]
    }
  },
  
  orderList: {
    success: true,
    data: {
      createdOrders: [
        {
          id: 'mock-order-id',
          title: 'Test Order',
          description: 'Test order description',
          creatorId: 'mock-user-id',
          status: 'PENDING',
          totalAmount: 300,
          fundedAmount: 0,
          milestones: [
            { id: 'mock-milestone-1', description: 'First milestone', amount: 100, status: 'PENDING' },
            { id: 'mock-milestone-2', description: 'Second milestone', amount: 200, status: 'PENDING' }
          ]
        }
      ],
      participatedOrders: []
    }
  },
  
  orderFunding: {
    success: true,
    data: {
      id: 'mock-order-id',
      fundedAmount: 100,
      status: 'FUNDED'
    }
  },
  
  // Milestone responses
  milestoneCompletion: {
    success: true,
    data: {
      id: 'mock-milestone-1',
      status: 'COMPLETED'
    }
  },
  
  actSigning: {
    success: true,
    data: {
      id: 'mock-milestone-1',
      status: 'ACCEPTED'
    }
  }
};

// Mock user service
export const mockUserService = {
  registerUserWithEscrow: async (user) => {
    console.log('Mock: Registering user with Escrow API', user);
    return mockResponses.userRegistration;
  },
  
  getCurrentUser: async () => {
    console.log('Mock: Getting current user from Escrow API');
    return mockResponses.currentUser;
  },
  
  getUserBalance: async () => {
    console.log('Mock: Getting user balance from Escrow API');
    return { success: true, data: { balance: 1000 } };
  }
};

// Mock order service
export const mockOrderService = {
  createOrder: async (orderData) => {
    console.log('Mock: Creating order in Escrow API', orderData);
    return mockResponses.orderCreation;
  },
  
  getUserOrders: async () => {
    console.log('Mock: Getting user orders from Escrow API');
    return mockResponses.orderList;
  },
  
  fundOrder: async (orderId, fundData) => {
    console.log(`Mock: Funding order ${orderId} with data`, fundData);
    return mockResponses.orderFunding;
  }
};

// Mock milestone service
export const mockMilestoneService = {
  completeMilestone: async (orderId, milestoneId) => {
    console.log(`Mock: Completing milestone ${milestoneId} for order ${orderId}`);
    return mockResponses.milestoneCompletion;
  },
  
  signAct: async (orderId, milestoneId) => {
    console.log(`Mock: Signing act for milestone ${milestoneId} for order ${orderId}`);
    return mockResponses.actSigning;
  }
};

// Mock UI utilities
export const mockUiUtils = {
  showLoading: (message) => {
    console.log(`Mock: Show loading with message: ${message}`);
  },
  
  hideLoading: () => {
    console.log('Mock: Hide loading');
  },
  
  showNotification: (message, type) => {
    console.log(`Mock: Show notification of type ${type}: ${message}`);
  },
  
  handleApiError: (error) => {
    console.log('Mock: Handling API error', error);
  }
};

// Mock payment wrapper
export const mockPaymentWrapper = {
  processDeposit: async (amount) => {
    console.log(`Mock: Processing deposit of ${amount}`);
    return { success: true, data: { amount, txId: 'mock-tx-id' } };
  },
  
  handlePaymentEvent: (event) => {
    console.log('Mock: Handling payment event', event);
    return true;
  }
};

// Export mock Escrow API
export const mockEscrowApi = {
  userService: mockUserService,
  orderService: mockOrderService,
  milestoneService: mockMilestoneService,
  uiUtils: mockUiUtils,
  paymentWrapper: mockPaymentWrapper,
  
  // Storage sync with mock implementation
  StorageSync: {
    syncOrder: (apiOrder, storage) => {
      console.log('Mock: Syncing order with local storage', apiOrder);
      if (!storage) return false;
      
      // Convert API order to local storage format
      const localOrder = {
        order_id: apiOrder.id,
        title: apiOrder.title,
        description: apiOrder.description,
        creator_id: apiOrder.creatorId,
        contractor_id: apiOrder.contractorId || null,
        total_cost: apiOrder.totalAmount || 0,
        escrow_balance: apiOrder.fundedAmount || 0,
        status: apiOrder.status || 'PENDING',
        milestones: (apiOrder.milestones || []).map((m, idx) => ({
          milestone_id: m.id || idx.toString(),
          description: m.description,
          amount: m.amount,
          status: m.status || 'PENDING'
        }))
      };
      
      // Save to local storage
      storage.saveOrder(localOrder);
      return localOrder;
    },
    
    syncUser: (apiUser, storage) => {
      console.log('Mock: Syncing user with local storage', apiUser);
      if (!storage) return false;
      
      // Convert API user to local storage format
      const localUser = {
        user_id: apiUser.id,
        name: apiUser.name || apiUser.email,
        type: apiUser.type || 'CUSTOMER',
        balance: apiUser.balance || 0
      };
      
      // Save to local storage
      storage.saveUser(localUser);
      return localUser;
    },
    
    syncOrderList: (apiOrders, storage) => {
      console.log('Mock: Syncing order list with local storage', apiOrders);
      return apiOrders.map(order => this.syncOrder(order, storage));
    },
    
    getTestStorage: () => {
      return window._testEscrowStorage;
    }
  }
};

export default mockEscrowApi;
