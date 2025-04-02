/**
 * Firebase Configuration
 * This file contains Firebase initialization and configuration
 */

// Флаг для принудительного использования локального хранилища
const USE_LOCAL_STORAGE = true;

// Проверка наличия локальной авторизации
const hasLocalAuth = typeof initLocalAuth === 'function';

// Принудительно использовать локальную авторизацию
const USE_LOCAL_AUTH = true;

// Флаг ошибки Firebase
let firebaseFailed = false;

// Функция для инициализации локальной авторизации
function useLocalAuthIfAvailable() {
  if (typeof initLocalAuth === 'function') {
    console.log('Инициализация локальной системы авторизации');
    initLocalAuth();
  } else {
    console.error('Локальная система авторизации недоступна');
    showNotification('Ошибка инициализации системы авторизации', 'error');
  }
}

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyANABAemlBIN33DaGkJZ8NddjIejjQXogc",
    authDomain: "co-intent.firebaseapp.com",
    projectId: "co-intent",
    storageBucket: "co-intent.firebasestorage.app",
    messagingSenderId: "923869578340",
    appId: "1:923869578340:web:e0784f915b034bafba0b71",
    measurementId: "G-J1VYX59DCF"
};

// Инициализация локального хранилища
if (USE_LOCAL_AUTH && hasLocalAuth) {
  console.log('Используем локальное хранилище для разработки');
  try {
    initLocalAuth();
  } catch (e) {
    console.error('Ошибка при инициализации локального хранилища:', e);
  }
} else {
  // Инициализация Firebase только если не используется локальное хранилище
  let firebaseApp;
  try {
    if (typeof firebase === 'undefined') {
      firebaseFailed = true;
      throw new Error('Firebase SDK не загружен');
    }
    
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    } else {
      firebaseApp = firebase.app();
      console.log('Firebase already initialized');
    }
  } catch (error) {
    firebaseFailed = true;
    console.error('Firebase initialization error:', error);
    if (hasLocalAuth) {
      console.log('Переключаемся на локальное хранилище из-за ошибки Firebase');
      useLocalAuthIfAvailable();
    }
  }
}

// Проверка доступности сервисов авторизации
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.auth || !window.db) {
      console.debug('Системы авторизации недоступны после загрузки страницы, инициализируем локальную систему');
      if (hasLocalAuth) {
        console.log('Инициализация локального хранилища');
        useLocalAuthIfAvailable();
        
        // Устанавливаем флаг инициализации
        localStorage.setItem('localAuth_initialized', 'true');
        
        // Проверяем еще раз после инициализации
        setTimeout(() => {
          if (!window.auth || !window.db) {
            console.error('Критическая ошибка: авторизация не инициализирована после повторной попытки');
          } else {
            console.log('Локальная система авторизации успешно инициализирована');
          }
        }, 300);
      }
    } else {
      console.log('Системы авторизации доступны и готовы к использованию');
      localStorage.setItem('localAuth_initialized', 'true');
    }
  }, 500);
});

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
let useLocalAuth = USE_LOCAL_AUTH;

try {
  if (!firebaseFailed && typeof firebase !== 'undefined' && !useLocalAuth) {
    auth = firebase.auth();
    console.log('Firebase Auth initialized');
  } else {
    useLocalAuth = true;
    throw new Error('Firebase Auth not available');
  }
} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  auth = null;
  // Если локальная авторизация доступна, попытаемся использовать её
  useLocalAuth = true;
  useLocalAuthIfAvailable();
}

try {
  if (!firebaseFailed && typeof firebase !== 'undefined' && !useLocalAuth) {
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
      } else {
        console.log('Error enabling persistence:', err);
        // Проблема с Firestore может быть поводом активировать локальную авторизацию
        useLocalAuth = true;
        useLocalAuthIfAvailable();
      }
    });
  } else {
    useLocalAuth = true;
    throw new Error('Firebase Firestore not available');
  }
} catch (error) {
  console.error('Firebase Firestore initialization error:', error);
  db = null;
  // Если локальная авторизация доступна, попытаемся использовать её
  useLocalAuth = true;
  useLocalAuthIfAvailable();
}

// Export services for use in other files
window.auth = window.auth || auth;
window.db = window.db || db;
window.analytics = window.analytics || analytics;

// Google Auth Provider
let googleProvider;
try {
  if (!firebaseFailed && typeof firebase !== 'undefined' && !useLocalAuth) {
    googleProvider = new firebase.auth.GoogleAuthProvider();
    window.googleProvider = window.googleProvider || googleProvider;
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
  useLocalAuthIfAvailable();
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