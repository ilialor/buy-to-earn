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

// Get all items from a collection with optional query
async function getCollection(collectionRef, queryFn = null) {
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
async function getDocument(collectionRef, docId) {
  try {
    const docRef = collectionRef.doc(docId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error getting document:', err);
    throw err;
  }
}

// Add document to collection
async function addDocument(collectionRef, data) {
  try {
    // Add timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await collectionRef.add(dataWithTimestamp);
    return docRef.id;
  } catch (err) {
    console.error('Error adding document:', err);
    throw err;
  }
}

// Update document
async function updateDocument(collectionRef, docId, data) {
  try {
    // Add update timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = collectionRef.doc(docId);
    await docRef.update(dataWithTimestamp);
    return true;
  } catch (err) {
    console.error('Error updating document:', err);
    throw err;
  }
}

// Delete document
async function deleteDocument(collectionRef, docId) {
  try {
    const docRef = collectionRef.doc(docId);
    await docRef.delete();
    return true;
  } catch (err) {
    console.error('Error deleting document:', err);
    throw err;
  }
}

// User specific functions

// Get user's NFTs
async function getUserNFTs(userId) {
  try {
    return await getCollection(nftsRef, query => 
      query.where('ownerId', '==', userId)
    );
  } catch (err) {
    console.error('Error getting user NFTs:', err);
    throw err;
  }
}

// Get user's orders
async function getUserOrders(userId) {
  try {
    return await getCollection(ordersRef, query => 
      query.where('userId', '==', userId)
    );
  } catch (err) {
    console.error('Error getting user orders:', err);
    throw err;
  }
}

// Get user's participations
async function getUserParticipations(userId) {
  try {
    return await getCollection(participationsRef, query => 
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
    return await getCollection(transactionsRef, query => 
      query.where('userId', '==', userId)
           .orderBy('createdAt', 'desc')
    );
  } catch (err) {
    console.error('Error getting user transactions:', err);
    throw err;
  }
}

// Get user's revenue history
async function getUserRevenues(userId) {
  try {
    return await getCollection(revenuesRef, query => 
      query.where('userId', '==', userId)
           .orderBy('createdAt', 'desc')
    );
  } catch (err) {
    console.error('Error getting user revenues:', err);
    throw err;
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
    const orderId = await addDocument(ordersRef, orderWithUser);
    
    // Create transaction record
    await addDocument(transactionsRef, {
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