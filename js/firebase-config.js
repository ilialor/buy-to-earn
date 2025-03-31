/**
 * Firebase Configuration
 * This file contains Firebase initialization and configuration
 */

// Firebase configuration
const firebaseConfig = {

};

// Проверка доступности Firebase и возможность переключения на локальную авторизацию
let useLocalAuth = false;
let firebaseFailed = false;

// Инициализация Firebase только если она еще не инициализирована
let firebaseApp;
try {
  if (typeof firebase === 'undefined') {
    throw new Error('Firebase SDK not loaded');
  }
  
  if (!firebase.apps.length) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    firebaseApp = firebase.app();
    console.log('Firebase already initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  firebaseFailed = true;
}

// Initialize Firebase Analytics with error handling
let analytics;
try {
  if (!firebaseFailed && typeof firebase !== 'undefined') {
    analytics = firebase.analytics();
    console.log('Firebase Analytics initialized');
  } else {
    throw new Error('Firebase not available');
  }
} catch (e) {
  console.log('Analytics failed to initialize:', e);
  analytics = {
    logEvent: (name, params) => {
      console.log('Local analytics:', name, params);
    }
  };
}

// Инициализация Firebase сервисов
let auth, db;

try {
  if (!firebaseFailed && typeof firebase !== 'undefined') {
    auth = firebase.auth();
    console.log('Firebase Auth initialized');
  } else {
    throw new Error('Firebase not available');
  }
} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  auth = null;
  // Если локальная авторизация доступна, попытаемся использовать её
  useLocalAuth = true;
}

try {
  if (!firebaseFailed && typeof firebase !== 'undefined') {
    db = firebase.firestore();
    console.log('Firebase Firestore initialized');
    
    // Настройка Firestore
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
      merge: true
    });
    
    // Включение офлайн-режима с обработкой ошибок
    db.enablePersistence({
      synchronizeTabs: true
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.log('The current browser doesn\'t support persistence');
      }
    });
  } else {
    throw new Error('Firebase not available');
  }
} catch (error) {
  console.error('Firebase Firestore initialization error:', error);
  db = null;
  // Если локальная авторизация доступна, попытаемся использовать её
  useLocalAuth = true;
}

// Export services for use in other files
window.auth = auth;
window.db = db;
window.analytics = analytics;

// Google Auth Provider
let googleProvider;
try {
  if (!firebaseFailed && typeof firebase !== 'undefined') {
    googleProvider = new firebase.auth.GoogleAuthProvider();
    window.googleProvider = googleProvider;
  } else {
    throw new Error('Firebase not available');
  }
} catch (error) {
  console.error('Google Provider initialization error:', error);
  // Локальный провайдер будет создан в local-auth.js
}

// Если Firebase не доступен, локальная авторизация должна быть инициализирована из local-auth.js
if (useLocalAuth) {
  console.log('Firebase services not available, waiting for local auth system to initialize...');
} else {
  // Проверка, авторизован ли пользователь, и обновление UI соответственно
  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User logged in:', user.email);
        if (typeof updateUIOnAuth === 'function') {
          updateUIOnAuth(user);
        }
      } else {
        console.log('User logged out');
        if (typeof updateUIOnAuth === 'function') {
          updateUIOnAuth(null);
        }
      }
    });
  }
} 