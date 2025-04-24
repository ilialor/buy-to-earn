/**
 * Database Functions
 * This file contains functions for interacting with Escrow API and local storage
 */

// Get collection reference
function getCollection(collectionName) {
  // Removed Firestore/dbRef code
}

// Get all items from a collection with optional query
async function getCollectionWithQuery(collectionRef, queryFn = null) {
  // Removed Firestore/dbRef code
}

// Get document by ID
async function getDocument(collectionName, docId) {
  // Removed Firestore/dbRef code
}

// Add document to collection
async function addDocument(collectionName, data) {
  // Removed Firestore/dbRef code
}

// Update document
async function updateDocument(collectionName, docId, data) {
  // Removed Firestore/dbRef code
}

// Delete document
async function deleteDocument(collectionName, docId) {
  // Removed Firestore/dbRef code
}

// User specific functions

// Get user's NFTs
async function getUserNFTs(userId) {
  // Removed Firestore/dbRef code
}

// Get user's orders
async function getUserOrders(userId) {
  console.log('Получение заказов пользователя через API:', userId);
  if (!userId) {
    console.error('ID пользователя не указан');
    return [];
  }
  let allOrders = [];
  try {
    const orders = await window.escrowAPI.orderService.getOrders();
    console.log(`Получено ${orders.length} заказов из API`);
    allOrders = orders.filter(o => o.userId === userId);
  } catch (error) {
    console.warn('Ошибка при получении заказов из API:', error);
  }
  try {
    const userLocal = JSON.parse(localStorage.getItem('orders') || '[]')
      .filter(o => o.userId === userId);
    const apiIds = allOrders.map(o => o.id);
    const uniqueLocal = userLocal.filter(o => !apiIds.includes(o.id));
    allOrders = [...allOrders, ...uniqueLocal];
  } catch (e) {
    console.error('Ошибка при получении заказов из локального хранилища:', e);
  }
  return allOrders;
}

// Get user's participations
async function getUserParticipations(userId) {
  // Removed Firestore/dbRef code
}

// Get user's transactions
async function getUserTransactions(userId) {
  // Removed Firestore/dbRef code
}

// Get user's revenues
async function getUserRevenues(userId) {
  // Removed Firestore/dbRef code
}

// Create a new order
async function createOrder(orderData) {
  // Removed Firestore/dbRef code
}

// Update wallet connection
async function updateWalletConnection(userId, walletAddress, balance) {
  // Removed Firestore/dbRef code
}

// Disconnect wallet
async function disconnectWallet(userId) {
  // Removed Firestore/dbRef code
}

// Listen to user NFTs
function listenToUserNFTs(userId, callback) {
  // Removed Firestore/dbRef code
}

// Listen to user orders
function listenToUserOrders(userId, callback) {
  // Removed Firestore/dbRef code
}

// Listen to user transactions
function listenToUserTransactions(userId, callback) {
  // Removed Firestore/dbRef code
}

// Update user wallet balance
async function updateUserWalletBalance(userId, amount, type = 'add') {
  // Removed Firestore/dbRef code
}

// Create a transaction
async function createTransaction(userId, amount, type, description) {
  // Removed Firestore/dbRef code
}

// Create a revenue record
async function createRevenue(userId, amount, source) {
  // Removed Firestore/dbRef code
}

// Get all orders
async function getAllOrders() {
  try {
    const orders = await window.escrowAPI.orderService.getOrders();
    console.log(`Получено ${orders.length} заказов из API`);
    return orders;
  } catch (error) {
    console.error('Ошибка при получении заказов из API:', error);
    return getLocalOrders();
  }
}

// Get local orders
function getLocalOrders() {
  try {
    const storageKey = 'local_orders';
    const ordersData = localStorage.getItem(storageKey);
    
    if (ordersData) {
      let orders = JSON.parse(ordersData);
      
      // Sort by creation date (newest first)
      orders = orders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      console.log(`Получено ${orders.length} заказов из локального хранилища`);
      return orders;
    }
    
    return []; // Return empty array if no orders are stored
  } catch (error) {
    console.error('Ошибка при получении заказов из локального хранилища:', error);
    return []; // Return empty array in case of error
  }
}

// Exports
window.dbFunctions = {
  getCollection,
  getCollectionWithQuery,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
  getUserNFTs,
  getUserOrders,
  getUserParticipations,
  getUserTransactions,
  getUserRevenues,
  createOrder,
  updateWalletConnection,
  disconnectWallet,
  listenToUserNFTs,
  listenToUserOrders,
  listenToUserTransactions,
  updateUserWalletBalance,
  createTransaction,
  createRevenue,
  getAllOrders
};