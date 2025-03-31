/**
 * Local Authentication System
 * Временная замена Firebase Auth для локальной разработки
 */

// Эмуляция Firebase Auth через localStorage
class LocalAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.storageKey = 'co-intent-users';
    this.currentUserKey = 'co-intent-current-user';
    
    // Инициализация
    this.init();
  }
  
  // Инициализация системы
  init() {
    // Проверяем наличие текущего пользователя
    const savedUser = localStorage.getItem(this.currentUserKey);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log('LocalAuth: пользователь восстановлен из localStorage', this.currentUser.email);
      } catch (e) {
        console.error('LocalAuth: ошибка при восстановлении пользователя', e);
        localStorage.removeItem(this.currentUserKey);
      }
    }
    
    // Генерируем событие авторизации
    if (this.currentUser) {
      this._notifyListeners();
    }
  }
  
  // Регистрация нового пользователя
  async createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      try {
        // Проверяем, существует ли пользователь
        const users = this._getUsers();
        if (users.find(u => u.email === email)) {
          return reject({ code: 'auth/email-already-in-use' });
        }
        
        // Создаем нового пользователя
        const newUser = {
          uid: this._generateUid(),
          email,
          password, // В реальности пароль должен хешироваться
          displayName: null,
          photoURL: null,
          emailVerified: false,
          createdAt: Date.now(),
          providerData: [{ providerId: 'password', email }]
        };
        
        // Сохраняем пользователя
        users.push(newUser);
        this._saveUsers(users);
        
        // Устанавливаем текущего пользователя
        this.currentUser = { ...newUser };
        delete this.currentUser.password; // Не сохраняем пароль в текущем пользователе
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
        
        // Отправляем событие авторизации
        this._notifyListeners();
        
        resolve({ user: this.currentUser });
      } catch (error) {
        reject({ code: 'auth/operation-not-allowed', message: error.message });
      }
    });
  }
  
  // Вход по email и паролю
  async signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      try {
        // Ищем пользователя
        const users = this._getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
          return reject({ code: 'auth/user-not-found' });
        }
        
        if (user.password !== password) {
          return reject({ code: 'auth/wrong-password' });
        }
        
        // Устанавливаем текущего пользователя
        this.currentUser = { ...user };
        delete this.currentUser.password; // Не сохраняем пароль в текущем пользователе
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
        
        // Отправляем событие авторизации
        this._notifyListeners();
        
        resolve({ user: this.currentUser });
      } catch (error) {
        reject({ code: 'auth/operation-not-allowed', message: error.message });
      }
    });
  }
  
  // Обновление профиля пользователя
  async updateProfile(userProfile) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.currentUser) {
          return reject({ code: 'auth/no-current-user' });
        }
        
        // Обновляем профиль текущего пользователя
        this.currentUser = {
          ...this.currentUser,
          ...userProfile
        };
        
        // Сохраняем обновленные данные
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
        
        // Обновляем пользователя в общем списке
        const users = this._getUsers();
        const userIndex = users.findIndex(u => u.uid === this.currentUser.uid);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            ...userProfile
          };
          this._saveUsers(users);
        }
        
        // Отправляем событие авторизации
        this._notifyListeners();
        
        resolve();
      } catch (error) {
        reject({ code: 'auth/operation-not-allowed', message: error.message });
      }
    });
  }
  
  // Сброс пароля (эмуляция)
  async sendPasswordResetEmail(email) {
    return new Promise((resolve, reject) => {
      try {
        // Проверяем, существует ли пользователь
        const users = this._getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
          return reject({ code: 'auth/user-not-found' });
        }
        
        // В реальности здесь отправлялся бы email
        console.log(`LocalAuth: эмуляция отправки сброса пароля на ${email}`);
        
        resolve();
      } catch (error) {
        reject({ code: 'auth/operation-not-allowed', message: error.message });
      }
    });
  }
  
  // Выход из системы
  async signOut() {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem(this.currentUserKey);
      
      // Отправляем событие авторизации
      this._notifyListeners();
      
      resolve();
    });
  }
  
  // Подписка на изменение статуса авторизации
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      
      // Вызываем колбэк с текущим состоянием
      callback(this.currentUser);
    }
    
    // Возвращаем функцию для отписки
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  // Имитация Google-авторизации
  async signInWithPopup(provider) {
    return new Promise((resolve, reject) => {
      try {
        // Создаем случайного пользователя
        const randomNum = Math.floor(Math.random() * 1000);
        const email = `user${randomNum}@example.com`;
        const displayName = `User ${randomNum}`;
        
        const newUser = {
          uid: this._generateUid(),
          email,
          displayName,
          photoURL: null,
          emailVerified: true,
          createdAt: Date.now(),
          providerData: [{ providerId: 'google.com', email, displayName }]
        };
        
        // Проверяем, существует ли уже такой пользователь
        const users = this._getUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (!existingUser) {
          // Сохраняем нового пользователя
          users.push(newUser);
          this._saveUsers(users);
        }
        
        // Устанавливаем текущего пользователя
        this.currentUser = existingUser || newUser;
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
        
        // Отправляем событие авторизации
        this._notifyListeners();
        
        resolve({ 
          user: this.currentUser,
          additionalUserInfo: {
            isNewUser: !existingUser,
            providerId: 'google.com'
          }
        });
      } catch (error) {
        reject({ code: 'auth/operation-not-allowed', message: error.message });
      }
    });
  }
  
  // Получение списка пользователей
  _getUsers() {
    const usersJSON = localStorage.getItem(this.storageKey);
    if (usersJSON) {
      try {
        return JSON.parse(usersJSON);
      } catch (e) {
        console.error('LocalAuth: ошибка при получении списка пользователей', e);
      }
    }
    return [];
  }
  
  // Сохранение списка пользователей
  _saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }
  
  // Генерация уникального ID
  _generateUid() {
    return 'local-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  // Уведомление всех слушателей об изменении статуса авторизации
  _notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('LocalAuth: ошибка в обработчике событий', e);
      }
    }
  }
}

// Эмуляция Firestore
class LocalFirestore {
  constructor() {
    this.storageKeyPrefix = 'co-intent-firestore-';
    this.collections = {};
  }
  
  // Получение коллекции
  collection(collectionName) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new LocalCollection(collectionName, this.storageKeyPrefix);
    }
    return this.collections[collectionName];
  }
  
  // Настройки (эмуляция)
  settings(options) {
    console.log('LocalFirestore: settings called with', options);
    return this;
  }
  
  // Включение офлайн-режима (эмуляция)
  enablePersistence(options) {
    console.log('LocalFirestore: enablePersistence called with', options);
    return Promise.resolve();
  }
}

// Эмуляция коллекции Firestore
class LocalCollection {
  constructor(name, storageKeyPrefix) {
    this.name = name;
    this.storageKey = storageKeyPrefix + name;
  }
  
  // Добавление документа
  async add(data) {
    const docId = this._generateId();
    const docWithMeta = {
      ...data,
      createdAt: this._serverTimestamp()
    };
    
    const docs = this._getDocs();
    docs[docId] = docWithMeta;
    this._saveDocs(docs);
    
    return {
      id: docId,
      get: () => Promise.resolve({
        exists: true,
        id: docId,
        data: () => docWithMeta
      })
    };
  }
  
  // Получение документа
  doc(docId) {
    return {
      id: docId,
      get: async () => {
        const docs = this._getDocs();
        const docData = docs[docId];
        
        return {
          exists: !!docData,
          id: docId,
          data: () => docData || null
        };
      },
      set: async (data) => {
        const docs = this._getDocs();
        docs[docId] = {
          ...data,
          updatedAt: this._serverTimestamp()
        };
        this._saveDocs(docs);
      },
      update: async (data) => {
        const docs = this._getDocs();
        if (docs[docId]) {
          docs[docId] = {
            ...docs[docId],
            ...data,
            updatedAt: this._serverTimestamp()
          };
          this._saveDocs(docs);
        }
      },
      delete: async () => {
        const docs = this._getDocs();
        delete docs[docId];
        this._saveDocs(docs);
      }
    };
  }
  
  // Эмуляция запроса where
  where(field, operator, value) {
    return {
      get: async () => {
        const docs = this._getDocs();
        const filtered = Object.entries(docs).filter(([docId, data]) => {
          if (operator === '==') {
            return data[field] === value;
          }
          if (operator === '!=') {
            return data[field] !== value;
          }
          if (operator === '>') {
            return data[field] > value;
          }
          if (operator === '>=') {
            return data[field] >= value;
          }
          if (operator === '<') {
            return data[field] < value;
          }
          if (operator === '<=') {
            return data[field] <= value;
          }
          return false;
        });
        
        return {
          docs: filtered.map(([docId, data]) => ({
            id: docId,
            data: () => data,
            exists: true
          }))
        };
      },
      orderBy: (field, direction) => this._createChainableQuery(field, operator, value)
    };
  }
  
  // Эмуляция запроса orderBy
  orderBy(field, direction = 'asc') {
    return this._createChainableQuery(null, null, null, field, direction);
  }
  
  // Создание цепочечного запроса
  _createChainableQuery(whereField, whereOperator, whereValue, orderByField, orderByDirection) {
    return {
      get: async () => {
        let docs = this._getDocs();
        let filtered = Object.entries(docs);
        
        // Применяем where фильтр если есть
        if (whereField && whereOperator && whereValue !== undefined) {
          filtered = filtered.filter(([docId, data]) => {
            if (whereOperator === '==') {
              return data[whereField] === whereValue;
            }
            if (whereOperator === '!=') {
              return data[whereField] !== whereValue;
            }
            return false;
          });
        }
        
        // Применяем сортировку если есть
        if (orderByField) {
          filtered.sort(([, dataA], [, dataB]) => {
            if (!dataA[orderByField] || !dataB[orderByField]) return 0;
            
            return orderByDirection === 'asc' 
              ? (dataA[orderByField] > dataB[orderByField] ? 1 : -1)
              : (dataA[orderByField] < dataB[orderByField] ? 1 : -1);
          });
        }
        
        return {
          docs: filtered.map(([docId, data]) => ({
            id: docId,
            data: () => data,
            exists: true
          }))
        };
      },
      orderBy: (field, direction) => {
        return this._createChainableQuery(whereField, whereOperator, whereValue, field, direction);
      },
      where: (field, operator, value) => {
        return this._createChainableQuery(field, operator, value, orderByField, orderByDirection);
      }
    };
  }
  
  // Получение всех документов
  async get() {
    const docs = this._getDocs();
    return {
      docs: Object.entries(docs).map(([docId, data]) => ({
        id: docId,
        data: () => data,
        exists: true
      }))
    };
  }
  
  // Подписка на изменения (эмуляция)
  onSnapshot(callback, errorCallback) {
    try {
      const docs = this._getDocs();
      const snapshot = {
        docs: Object.entries(docs).map(([docId, data]) => ({
          id: docId,
          data: () => data,
          exists: true
        }))
      };
      
      callback(snapshot);
      
      // Возвращаем функцию для отписки
      return () => {
        console.log('LocalFirestore: unsubscribe from', this.name);
      };
    } catch (error) {
      if (errorCallback) {
        errorCallback(error);
      }
      return () => {};
    }
  }
  
  // Получение документов из localStorage
  _getDocs() {
    const docsJSON = localStorage.getItem(this.storageKey);
    if (docsJSON) {
      try {
        return JSON.parse(docsJSON);
      } catch (e) {
        console.error(`LocalFirestore: ошибка при получении коллекции ${this.name}`, e);
      }
    }
    return {};
  }
  
  // Сохранение документов в localStorage
  _saveDocs(docs) {
    localStorage.setItem(this.storageKey, JSON.stringify(docs));
  }
  
  // Генерация ID документа
  _generateId() {
    return 'local-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  // Серверная метка времени
  _serverTimestamp() {
    return {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: () => new Date()
    };
  }
}

// Эмуляция Firebase провайдера Google Auth
class GoogleAuthProvider {
  constructor() {
    this.providerId = 'google.com';
  }
}

// Эмуляция Firebase Analytics
class LocalAnalytics {
  constructor() {
    console.log('LocalAnalytics: initialized');
  }
  
  logEvent(eventName, eventParams) {
    console.log('LocalAnalytics: logged event', eventName, eventParams);
  }
}

// Эмуляция Timestamp и FieldValue
const localFirebaseUtils = {
  Timestamp: {
    now: () => ({
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: () => new Date()
    })
  },
  FieldValue: {
    serverTimestamp: () => ({
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
      toDate: () => new Date()
    })
  }
};

// Инициализация локальной авторизации, если Firebase недоступен
function initLocalAuth() {
  console.log('Инициализация локальной системы авторизации');
  
  // Создаем экземпляры локальных сервисов
  const localAuth = new LocalAuth();
  const localFirestore = new LocalFirestore();
  const localAnalytics = new LocalAnalytics();
  
  // Экспортируем в window
  window.auth = localAuth;
  window.db = localFirestore;
  window.analytics = localAnalytics;
  window.googleProvider = new GoogleAuthProvider();
  window.firebase = {
    auth: () => localAuth,
    firestore: () => localFirestore,
    analytics: () => localAnalytics,
    ...localFirebaseUtils
  };
  
  console.log('Локальная система авторизации инициализирована');
}

// Пытаемся использовать Firebase, если он доступен, иначе - локальную авторизацию
function checkAndInitAuth() {
  // Проверяем, есть ли ошибка с Firebase
  const checkFirebase = setTimeout(() => {
    console.log('Firebase не инициализирован, используем локальную авторизацию');
    initLocalAuth();
  }, 2000);
  
  // Проверяем Firebase
  if (typeof firebase !== 'undefined') {
    try {
      const testAuth = firebase.auth();
      if (testAuth) {
        console.log('Firebase Auth доступен, используем его');
        clearTimeout(checkFirebase);
      } else {
        throw new Error('Firebase Auth не доступен');
      }
    } catch (e) {
      console.error('Ошибка при проверке Firebase Auth:', e);
      clearTimeout(checkFirebase);
      initLocalAuth();
    }
  }
}

// Запускаем проверку при загрузке документа
document.addEventListener('DOMContentLoaded', checkAndInitAuth); 