/**
 * Firebase Fallback Configuration
 * This file provides fallback functionality when Firebase is not available
 */

// Flag to indicate Firebase fallback mode
window.usingFirebaseFallback = true;

// Create minimal Firebase-like interfaces
class FallbackAuth {
  constructor() {
    this.currentUser = null;
    this._listeners = [];
    console.log('Firebase Auth fallback initialized');
  }

  // Check if user exists in local storage
  _initFromLocalStorage() {
    try {
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this._notifyAuthStateChanged();
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
  }

  // Auth state change notification
  onAuthStateChanged(callback) {
    this._listeners.push(callback);
    // Initial call with current state
    if (this.currentUser) {
      setTimeout(() => callback(this.currentUser), 0);
    } else {
      setTimeout(() => callback(null), 0);
    }
    return () => {
      this._listeners = this._listeners.filter(listener => listener !== callback);
    };
  }

  _notifyAuthStateChanged() {
    this._listeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (e) {
        console.error('Error in auth state listener:', e);
      }
    });
  }

  // Sign in with email and password
  async signInWithEmailAndPassword(email, password) {
    try {
      // Check local storage for user data
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          emailVerified: true
        };
        
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
        this._notifyAuthStateChanged();
        
        return { user: this.currentUser };
      } else {
        throw new Error('auth/wrong-password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Create user with email and password
  async createUserWithEmailAndPassword(email, password) {
    try {
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        throw new Error('auth/email-already-in-use');
      }
      
      // Create new user
      const newUser = {
        uid: 'local_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
        email,
        password,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('local_users', JSON.stringify(users));
      
      this.currentUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        emailVerified: true
      };
      
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      this._notifyAuthStateChanged();
      
      return { user: this.currentUser };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('auth_user');
    this._notifyAuthStateChanged();
  }

  // Update profile
  async updateProfile(user, profileInfo) {
    if (!user) return;
    
    try {
      // Update current user
      this.currentUser = { ...this.currentUser, ...profileInfo };
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      
      // Also update in users collection
      const users = JSON.parse(localStorage.getItem('local_users') || '[]');
      const userIndex = users.findIndex(u => u.uid === user.uid);
      
      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], ...profileInfo };
        localStorage.setItem('local_users', JSON.stringify(users));
      }
      
      this._notifyAuthStateChanged();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email) {
    console.log('Password reset requested for:', email);
    // In fallback mode, we just log the request
    return Promise.resolve();
  }
}

// Firestore fallback
class FallbackFirestore {
  constructor() {
    this._collections = {};
    console.log('Firebase Firestore fallback initialized');
  }
  
  collection(name) {
    if (!this._collections[name]) {
      this._collections[name] = new FallbackCollection(name);
    }
    return this._collections[name];
  }
}

class FallbackCollection {
  constructor(name) {
    this.name = name;
  }
  
  doc(id) {
    return new FallbackDocument(this.name, id);
  }
  
  where() {
    return new FallbackQuery(this.name);
  }
  
  get() {
    return Promise.resolve({
      docs: [],
      empty: true
    });
  }
}

class FallbackDocument {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
    this._key = `firestore_${collection}_${id}`;
  }
  
  get() {
    return new Promise(resolve => {
      try {
        const data = localStorage.getItem(this._key);
        if (data) {
          const parsedData = JSON.parse(data);
          resolve({
            exists: true,
            data: () => parsedData,
            id: this.id
          });
        } else {
          resolve({
            exists: false,
            data: () => ({}),
            id: this.id
          });
        }
      } catch (e) {
        console.error('Error reading from fallback storage:', e);
        resolve({
          exists: false,
          data: () => ({}),
          id: this.id
        });
      }
    });
  }
  
  set(data, options = {}) {
    try {
      const existingData = localStorage.getItem(this._key);
      let newData;
      
      if (options.merge && existingData) {
        newData = { ...JSON.parse(existingData), ...data };
      } else {
        newData = data;
      }
      
      localStorage.setItem(this._key, JSON.stringify(newData));
      return Promise.resolve();
    } catch (e) {
      console.error('Error writing to fallback storage:', e);
      return Promise.reject(e);
    }
  }
  
  update(data) {
    try {
      const existingData = localStorage.getItem(this._key);
      
      if (!existingData) {
        return Promise.reject(new Error('Document does not exist'));
      }
      
      const newData = { ...JSON.parse(existingData), ...data };
      localStorage.setItem(this._key, JSON.stringify(newData));
      return Promise.resolve();
    } catch (e) {
      console.error('Error updating fallback storage:', e);
      return Promise.reject(e);
    }
  }
  
  delete() {
    try {
      localStorage.removeItem(this._key);
      return Promise.resolve();
    } catch (e) {
      console.error('Error deleting from fallback storage:', e);
      return Promise.reject(e);
    }
  }
}

class FallbackQuery {
  constructor(collection) {
    this.collection = collection;
  }
  
  where() {
    return this;
  }
  
  get() {
    return Promise.resolve({
      docs: [],
      empty: true
    });
  }
}

// Initialize fallback services
const initFallbackFirebase = () => {
  console.log('Initializing Firebase fallback services');
  
  // Check if Firebase is not already defined
  if (!window.firebase) {
    // Create minimal firebase namespace
    window.firebase = {
      auth: () => {
        if (!window._fallbackAuth) {
          window._fallbackAuth = new FallbackAuth();
          window._fallbackAuth._initFromLocalStorage();
        }
        return window._fallbackAuth;
      },
      firestore: () => {
        if (!window._fallbackFirestore) {
          window._fallbackFirestore = new FallbackFirestore();
        }
        return window._fallbackFirestore;
      },
      analytics: () => ({
        logEvent: (name, params) => console.log('Analytics event:', name, params)
      })
    };
    
    // Attach the auth instance to window
    window.auth = window.firebase.auth();
    window.db = window.firebase.firestore();
    window.analytics = window.firebase.analytics();
    
    console.log('Firebase fallback services initialized successfully');
  }
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase was initialized
  setTimeout(() => {
    if (!window.auth || !window.db) {
      console.log('Firebase not detected, initializing fallback');
      initFallbackFirebase();
    }
  }, 1000); // Give Firebase time to initialize first
});

// Initialize immediately if document already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.auth || !window.db) {
    console.log('Firebase not detected, initializing fallback (immediate)');
    initFallbackFirebase();
  }
}
