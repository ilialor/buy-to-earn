/**
 * Storage Synchronization Module
 * Provides synchronization between local storage and Escrow API
 */
import MockEscrowStorage from './mock-storage.js';

// Function to synchronize local storage order with API response
export function syncOrderWithLocalStorage(apiOrder, localStorage) {
  // Use test storage if no storage provided (for testing)
  localStorage = localStorage || getTestStorage();
  if (!apiOrder) return null;
  
  try {
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
    localStorage.saveOrder(localOrder);
    
    return localOrder;
  } catch (error) {
    console.error('Failed to sync order with local storage:', error);
    return null;
  }
}

// Function to synchronize local storage user with API response
export function syncUserWithLocalStorage(apiUser, localStorage) {
  // Use test storage if no storage provided (for testing)
  localStorage = localStorage || getTestStorage();
  if (!apiUser) return null;
  
  try {
    // Convert API user to local storage format
    const localUser = {
      user_id: apiUser.id,
      name: apiUser.name || apiUser.email,
      type: apiUser.type || 'CUSTOMER',
      balance: apiUser.balance || 0
    };
    
    // Save to local storage
    localStorage.saveUser(localUser);
    
    return localUser;
  } catch (error) {
    console.error('Failed to sync user with local storage:', error);
    return null;
  }
}

// Function to synchronize entire order list with local storage
export function syncOrderListWithLocalStorage(apiOrders, localStorage) {
  // Use test storage if no storage provided (for testing)
  localStorage = localStorage || getTestStorage();
  if (!apiOrders || !apiOrders.length) return [];
  
  try {
    const localOrders = [];
    
    apiOrders.forEach(apiOrder => {
      const localOrder = syncOrderWithLocalStorage(apiOrder, localStorage);
      if (localOrder) {
        localOrders.push(localOrder);
      }
    });
    
    return localOrders;
  } catch (error) {
    console.error('Failed to sync order list with local storage:', error);
    return [];
  }
}

// Function to get or create a test storage
function getTestStorage() {
  if (!window._testEscrowStorage) {
    window._testEscrowStorage = new MockEscrowStorage();
  }
  return window._testEscrowStorage;
}

// Export a utility object that can be used globally
export const StorageSync = {
  syncOrder: syncOrderWithLocalStorage,
  syncUser: syncUserWithLocalStorage,
  syncOrderList: syncOrderListWithLocalStorage,
  getTestStorage
};

export default StorageSync;
