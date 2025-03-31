/**
 * Database Functions
 * This file contains functions for interacting with Firestore database
 */

// Collections references
const usersRef = db.collection('users');
const ordersRef = db.collection('orders');
const participationsRef = db.collection('participations');
const nftsRef = db.collection('nfts');
const revenuesRef = db.collection('revenues');
const transactionsRef = db.collection('transactions');

// Get collection reference
function getCollection(collectionName) {
  return db.collection(collectionName);
}

// Get all items from a collection with optional query
async function getCollectionWithQuery(collectionRef, queryFn = null) {
  try {
    let query = collectionRef;
    
    // Apply query function if provided
    if (queryFn) {
      query = queryFn(query);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error getting collection:', err);
    throw err;
  }
}

// Get document by ID
async function getDocument(collectionName, docId) {
  try {
    const doc = await db.collection(collectionName).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

// Add document to collection
async function addDocument(collectionName, data) {
  try {
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Update document
async function updateDocument(collectionName, docId, data) {
  try {
    await db.collection(collectionName).doc(docId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

// Delete document
async function deleteDocument(collectionName, docId) {
  try {
    await db.collection(collectionName).doc(docId).delete();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// User specific functions

// Get user's NFTs
async function getUserNFTs(userId) {
  try {
    const snapshot = await db.collection('nfts')
      .where('ownerId', '==', userId)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user NFTs:', error);
    throw error;
  }
}

// Get user's orders
async function getUserOrders(userId) {
  try {
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

// Get user's participations
async function getUserParticipations(userId) {
  try {
    return await getCollectionWithQuery(participationsRef, query => 
      query.where('userId', '==', userId)
    );
  } catch (err) {
    console.error('Error getting user participations:', err);
    throw err;
  }
}

// Get user's transactions
async function getUserTransactions(userId) {
  try {
    const snapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
}

// Get user's revenues
async function getUserRevenues(userId) {
  try {
    const snapshot = await db.collection('revenues')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user revenues:', error);
    throw error;
  }
}

// Create a new order
async function createOrder(orderData) {
  try {
    // Ensure user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Add user ID to order data
    const orderWithUser = {
      ...orderData,
      userId: user.uid,
      status: 'pending', // Initial status
    };
    
    // Create order document
    const orderId = await addDocument('orders', orderWithUser);
    
    // Create transaction record
    await addDocument('transactions', {
      userId: user.uid,
      type: 'purchase',
      amount: orderData.totalPrice,
      status: 'pending',
      orderId: orderId,
      description: `Покупка NFT: ${orderData.nftName}`,
    });
    
    return orderId;
  } catch (err) {
    console.error('Error creating order:', err);
    throw err;
  }
}

// Update wallet connection
async function updateWalletConnection(userId, walletAddress, balance) {
  try {
    const userRef = usersRef.doc(userId);
    
    await userRef.update({
      'wallet.address': walletAddress,
      'wallet.balance': balance,
      'wallet.isConnected': true,
      'wallet.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (err) {
    console.error('Error updating wallet connection:', err);
    throw err;
  }
}

// Disconnect wallet
async function disconnectWallet(userId) {
  try {
    const userRef = usersRef.doc(userId);
    
    await userRef.update({
      'wallet.isConnected': false,
      'wallet.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (err) {
    console.error('Error disconnecting wallet:', err);
    throw err;
  }
}

// Real-time updates

// Listen for user's NFTs changes
function listenToUserNFTs(userId, callback) {
  return nftsRef
    .where('ownerId', '==', userId)
    .onSnapshot(snapshot => {
      const nfts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(nfts);
    }, error => {
      console.error('Error listening to user NFTs:', error);
    });
}

// Listen for user's orders changes
function listenToUserOrders(userId, callback) {
  return ordersRef
    .where('userId', '==', userId)
    .onSnapshot(snapshot => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(orders);
    }, error => {
      console.error('Error listening to user orders:', error);
    });
}

// Listen for user's transactions changes
function listenToUserTransactions(userId, callback) {
  return transactionsRef
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(transactions);
    }, error => {
      console.error('Error listening to user transactions:', error);
    });
}

// Update user's wallet balance
async function updateUserWalletBalance(userId, amount, type = 'add') {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const currentBalance = userDoc.data().walletBalance || 0;
    const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;
    
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }
    
    await userRef.update({
      walletBalance: newBalance
    });
    
    return newBalance;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
}

// Create transaction record
async function createTransaction(userId, amount, type, description) {
  try {
    const transactionRef = await db.collection('transactions').add({
      userId,
      amount,
      type,
      description,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return transactionRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Create revenue record
async function createRevenue(userId, amount, source) {
  try {
    const revenueRef = await db.collection('revenues').add({
      userId,
      amount,
      source,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return revenueRef.id;
  } catch (error) {
    console.error('Error creating revenue:', error);
    throw error;
  }
}

// Get all orders
async function getAllOrders() {
  try {
    const snapshot = await window.db.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
} 