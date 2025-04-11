/**
 * Database Functions
 * This file contains functions for interacting with Firestore database
 */

// Убедимся, что db существует перед использованием
let dbRef;

// Инициализация ссылок на коллекции
function initializeCollections() {
  if (!window.db && typeof localDB === 'undefined') {
    console.error('Ошибка: объект базы данных недоступен');
    return false;
  }
  
  // Используем Firestore или локальную БД
  dbRef = window.db || localDB;
  
  // Теперь инициализируем ссылки на коллекции
  usersRef = dbRef.collection('users');
  ordersRef = dbRef.collection('orders');
  participationsRef = dbRef.collection('participations');
  nftsRef = dbRef.collection('nfts');
  revenuesRef = dbRef.collection('revenues');
  transactionsRef = dbRef.collection('transactions');
  
  console.log('Коллекции базы данных инициализированы успешно');
  return true;
}

// Инициализируем коллекции при загрузке скрипта
let usersRef, ordersRef, participationsRef, nftsRef, revenuesRef, transactionsRef;

// Попытка инициализации при загрузке
(function() {
  // Если db уже доступен, инициализируем сразу
  if (window.db) {
    initializeCollections();
  } else {
    // Иначе ждем загрузки страницы и пробуем снова
    window.addEventListener('load', function() {
      setTimeout(initializeCollections, 500);
    });
  }
})();

// Get collection reference
function getCollection(collectionName) {
  if (!dbRef) {
    if (!initializeCollections()) {
      throw new Error('База данных недоступна');
    }
  }
  return dbRef.collection(collectionName);
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
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    const doc = await dbRef.collection(collectionName).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

// Add document to collection
async function addDocument(collectionName, data) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    
    const collection = dbRef.collection(collectionName);
    
    // Создаем новый документ
    const docRef = await collection.add({
      ...data,
      createdAt: data.createdAt || firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Документ успешно добавлен в коллекцию ${collectionName}:`, docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn(`Предупреждение: проблема при добавлении документа в ${collectionName}:`, err.message);
    
    // Сохраняем в локальное хранилище для последующей синхронизации
    try {
      saveToLocalStorage(collectionName, data);
    } catch (localError) {
      console.warn('Ошибка при сохранении в локальное хранилище:', localError);
    }
    
    // Если это критичная ошибка, мы все равно прокидываем ее дальше
    throw err;
  }
}

// Функция для добавления документа в локальное хранилище
function addLocalDocument(collectionName, data) {
  try {
    // Генерируем уникальный ID для документа
    const docId = 'local_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Получаем текущую коллекцию из localStorage или создаем новую
    const storageKey = `local_${collectionName}`;
    let collection = [];
    
    try {
      const existingData = localStorage.getItem(storageKey);
      if (existingData) {
        collection = JSON.parse(existingData);
      }
    } catch (e) {
      console.warn(`Ошибка при чтении локальной коллекции ${collectionName}:`, e);
    }
    
    // Добавляем новый документ
    const newDoc = {
      id: docId,
      ...data,
      createdAt: new Date()
    };
    
    collection.push(newDoc);
    
    // Сохраняем обновленную коллекцию
    localStorage.setItem(storageKey, JSON.stringify(collection));
    
    console.log(`Документ успешно добавлен в локальную коллекцию ${collectionName}, ID: ${docId}`);
    return docId;
  } catch (error) {
    console.error('Ошибка при добавлении документа в локальное хранилище:', error);
    throw error;
  }
}

// Функция для сохранения данных в локальное хранилище
function saveToLocalStorage(collectionName, data) {
  // Генерируем уникальный ID для документа, если его нет
  const docId = data.id || 'local_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // В зависимости от типа коллекции, сохраняем в соответствующий ключ
  if (collectionName === 'orders') {
    // Для заказов используем ключ 'orders'
    try {
      const ordersJson = localStorage.getItem('orders') || '[]';
      const orders = JSON.parse(ordersJson);
      
      // Добавляем новый заказ с ID
      const newOrder = {
        ...data,
        id: docId,
        createdAt: data.createdAt || new Date()
      };
      
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      console.log(`Заказ сохранен в локальное хранилище, ID: ${docId}`);
    } catch (e) {
      console.warn('Ошибка при сохранении заказа в локальное хранилище:', e);
      throw e;
    }
  } else {
    // Для других коллекций используем общий формат local_{collectionName}
    return addLocalDocument(collectionName, data);
  }
  
  return docId;
}

// Update document
async function updateDocument(collectionName, docId, data) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    await dbRef.collection(collectionName).doc(docId).update({
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
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    await dbRef.collection(collectionName).doc(docId).delete();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// User specific functions

// Get user's NFTs
async function getUserNFTs(userId) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    const snapshot = await dbRef.collection('nfts')
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

// Получение заказов пользователя (как локальных, так и из Firebase)
async function getUserOrders(userId) {
  console.log('Получение заказов пользователя:', userId);
  if (!userId) {
    console.error('ID пользователя не указан');
    return [];
  }

  let allOrders = [];

  // Пытаемся получить заказы из Firebase Firestore
  try {
    console.log('Получение заказов из Firebase Firestore...');
    if (!dbRef) {
      if (!initializeCollections()) {
        console.warn('Firebase Firestore недоступен, используем только локальные заказы');
      }
    } else {
      // Используем ordersRef, уже инициализированный в initializeCollections
      const snapshot = await ordersRef.where('userId', '==', userId).get();
      
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          allOrders.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log(`Получено ${allOrders.length} заказов из Firebase Firestore`);
      } else {
        console.log('Заказы в Firebase Firestore не найдены');
      }
    }
  } catch (error) {
    console.warn('Ошибка при получении заказов из Firebase Firestore:', error);
    // Продолжаем выполнение, чтобы получить локальные заказы
  }

  // Получаем локальные заказы
  try {
    console.log('Получение локальных заказов...');
    const localOrdersJson = localStorage.getItem('orders');
    
    if (localOrdersJson) {
      const localOrders = JSON.parse(localOrdersJson);
      
      // Фильтруем локальные заказы по userId
      const userLocalOrders = localOrders.filter(order => order.userId === userId);
      
      // Проверяем, что заказы из localStorage еще не добавлены из Firebase
      const localOrderIds = userLocalOrders.map(order => order.id);
      const firebaseOrderIds = allOrders.map(order => order.id);
      
      const uniqueLocalOrders = userLocalOrders.filter(order => 
        !firebaseOrderIds.includes(order.id)
      );
      
      console.log(`Получено ${uniqueLocalOrders.length} уникальных локальных заказов`);
      
      // Добавляем уникальные локальные заказы
      allOrders = [...allOrders, ...uniqueLocalOrders];
    } else {
      console.log('Локальные заказы не найдены');
    }
  } catch (error) {
    console.warn('Ошибка при получении локальных заказов:', error.message);
  }

  // Сортируем все заказы по дате создания (от новых к старым)
  allOrders.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  console.log(`Всего получено ${allOrders.length} заказов пользователя`);
  return allOrders;
}

// Get user's participations
async function getUserParticipations(userId) {
  try {
    if (!participationsRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
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
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    const snapshot = await dbRef.collection('transactions')
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
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    const snapshot = await dbRef.collection('revenues')
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
    // Проверка инициализации базы данных
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }

    let userId = null;
    let userName = 'Пользователь';

    // Проверка Firebase-аутентификации
    if (window.auth && window.auth.currentUser) {
      userId = window.auth.currentUser.uid;
      userName = window.auth.currentUser.displayName || window.auth.currentUser.email || 'Пользователь';
    } 
    // Проверка локальной аутентификации
    else {
      // Попытка получить данные локальной аутентификации
      try {
        const localUserJson = localStorage.getItem('localAuth_currentUser');
        if (localUserJson) {
          const localUser = JSON.parse(localUserJson);
          if (localUser && localUser.uid) {
            userId = localUser.uid;
            userName = localUser.displayName || localUser.email || 'Пользователь';
            console.log('Используем данные локальной аутентификации:', userName);
          }
        }
      } catch (e) {
        console.warn('Ошибка при получении данных локальной аутентификации:', e);
      }
    }

    // Убедимся, что у нас есть ID пользователя
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Преобразуем budget в число, если это строка
    if (typeof orderData.budget === 'string') {
      orderData.budget = parseFloat(orderData.budget);
    }
    
    // Проверяем, что budget является числом
    if (isNaN(orderData.budget)) {
      orderData.budget = 0;
    }
    
    // Формируем данные заказа
    const orderWithUser = {
      ...orderData,
      userId: userId,
      userName: userName,
      status: 'active',
      currentFunding: 0,
      participants: 0,
      createdAt: new Date()
    };
    
    console.log('Создаем заказ с данными:', orderWithUser);
    
    // Создаем документ заказа
    const orderId = await addDocument('orders', orderWithUser);
    
    // Добавляем заказ в локальное хранилище, чтобы он сразу отображался в интерфейсе
    try {
      const orderWithId = {
        ...orderWithUser,
        id: orderId
      };
      
      // Получаем текущие заказы из localStorage
      const localOrdersJson = localStorage.getItem('orders') || '[]';
      const localOrders = JSON.parse(localOrdersJson);
      
      // Добавляем новый заказ
      localOrders.push(orderWithId);
      
      // Сохраняем обновленный список заказов
      localStorage.setItem('orders', JSON.stringify(localOrders));
      console.log('Заказ сохранен в локальное хранилище');
    } catch (localStorageError) {
      console.warn('Ошибка при сохранении заказа в локальное хранилище:', localStorageError);
      // Не прерываем выполнение, это просто дополнительный функционал для улучшения UX
    }
    
    // Создаем запись транзакции для лога
    try {
      await addDocument('transactions', {
        userId: userId,
        type: 'order_creation',
        amount: orderData.budget || 0,
        status: 'completed',
        orderId: orderId,
        description: `Создание заказа: ${orderData.title}`,
        createdAt: new Date()
      });
    } catch (transactionError) {
      console.warn('Ошибка при создании транзакции заказа:', transactionError);
      // Не прерываем выполнение, если ошибка только в создании записи транзакции
    }
    
    return orderId;
  } catch (err) {
    console.error('Error creating order:', err);
    throw err;
  }
}

// Update wallet connection
async function updateWalletConnection(userId, walletAddress, balance) {
  try {
    if (!usersRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
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
    if (!usersRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
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
function listenToUserNFTs(userId, callback) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    return dbRef.collection('nfts')
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
  } catch (error) {
    console.error('Error setting up NFT listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

function listenToUserOrders(userId, callback) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    return dbRef.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(orders);
      }, error => {
        console.error('Error listening to user orders:', error);
      });
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

function listenToUserTransactions(userId, callback) {
  try {
    if (!dbRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    return dbRef.collection('transactions')
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
  } catch (error) {
    console.error('Error setting up transactions listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
}

// Update user wallet balance
async function updateUserWalletBalance(userId, amount, type = 'add') {
  try {
    if (!usersRef) {
      if (!initializeCollections()) {
        throw new Error('База данных недоступна');
      }
    }
    const userRef = usersRef.doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('Пользователь не найден');
    }
    
    const userData = userDoc.data();
    let currentBalance = userData.wallet?.balance || 0;
    let newBalance;
    
    if (type === 'add') {
      newBalance = parseFloat(currentBalance) + parseFloat(amount);
    } else if (type === 'subtract') {
      newBalance = parseFloat(currentBalance) - parseFloat(amount);
      if (newBalance < 0) {
        throw new Error('Недостаточно средств в кошельке');
      }
    } else {
      newBalance = parseFloat(amount); // Set direct value
    }
    
    await userRef.update({
      'wallet.balance': newBalance,
      'wallet.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return newBalance;
  } catch (err) {
    console.error('Error updating wallet balance:', err);
    throw err;
  }
}

// Create a transaction
async function createTransaction(userId, amount, type, description) {
  try {
    const transaction = {
      userId,
      amount,
      type,
      description,
      status: 'completed',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const transactionId = await addDocument('transactions', transaction);
    
    return transactionId;
  } catch (err) {
    console.error('Error creating transaction:', err);
    throw err;
  }
}

// Create a revenue record
async function createRevenue(userId, amount, source) {
  try {
    const revenue = {
      userId,
      amount,
      source,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const revenueId = await addDocument('revenues', revenue);
    
    return revenueId;
  } catch (err) {
    console.error('Error creating revenue record:', err);
    throw err;
  }
}

// Get all orders
async function getAllOrders() {
  try {
    // Проверяем наличие подключения к Firebase
    if (!dbRef) {
      if (!initializeCollections()) {
        console.log('База данных недоступна, получаем заказы из локального хранилища');
        return getLocalOrders();
      }
    }
    
    // Получаем заказы из Firestore
    const snapshot = await dbRef.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    // В случае ошибки, пытаемся получить из локального хранилища
    console.log('Ошибка получения заказов из Firebase, пробуем локальное хранилище');
    return getLocalOrders();
  }
}

// Получение заказов из локального хранилища
function getLocalOrders() {
  try {
    const storageKey = 'local_orders';
    const ordersData = localStorage.getItem(storageKey);
    
    if (ordersData) {
      let orders = JSON.parse(ordersData);
      
      // Сортировка по дате создания (от новых к старым)
      orders = orders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      console.log(`Получено ${orders.length} заказов из локального хранилища`);
      return orders;
    }
    
    return []; // Возвращаем пустой массив, если нет сохраненных заказов
  } catch (error) {
    console.error('Ошибка при получении заказов из локального хранилища:', error);
    return []; // Возвращаем пустой массив в случае ошибки
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
  getAllOrders,
  initializeCollections
}; 