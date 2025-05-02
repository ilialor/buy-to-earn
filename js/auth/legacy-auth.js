/**
 * Authentication Functions
 * This file contains functions for user authentication
 * Moved from /js/auth.js to /js/auth/legacy-auth.js
 */

// Check and initialize authentication
function checkAndInitAuth() {
  // Check availability of Firebase or local auth
  if (!window.auth) {
    console.error('Authentication services not initialized - please check firebase-config.js and local-auth.js');
    showNotification('Ошибка инициализации системы авторизации', 'error');
    return false;
  }

  // Auth state observer
  window.auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      console.log('Auth state changed: user signed in', user.email);
      updateUIOnAuth(user);
    } else {
      // User is signed out
      console.log('Auth state changed: user signed out');
      updateUIOnAuth(null);
    }
    
    // Dispatch a custom event that other components can listen for
    document.dispatchEvent(new CustomEvent('userChanged', { 
      detail: { user: user }
    }));
  });

  return true;
}

// Check on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Give time for Firebase/local auth initialization
  setTimeout(checkAndInitAuth, 500);
});

/**
 * Setup authentication modal
 */
function setupAuthModal() {
  const closeButtons = document.querySelectorAll('.modal-close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close modal when clicking outside
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Handle login/signup buttons
  const loginBtn = document.getElementById('login-button');
  const signupBtn = document.getElementById('signup-button');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      activateTab('login-tab');
      showModal('auth-modal');
    });
  }
  
  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      activateTab('signup-tab');
      showModal('auth-modal');
    });
  }
}

/**
 * Setup auth form tabs
 */
function setupAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Show corresponding content
      const contentId = tab.getAttribute('data-tab');
      const content = document.getElementById(contentId);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

/**
 * Setup authentication form listeners
 */
function setupAuthFormListeners() {
  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('#login-email').value;
      const password = loginForm.querySelector('#login-password').value;
      
      signInWithEmail(email, password)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Вы успешно вошли в систему', 'success');
        })
        .catch(error => {
          const errorMessage = getAuthErrorMessage(error.code) || error.message;
          showNotification(errorMessage, 'error');
        });
    });
  }
  
  // Signup form handler
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = signupForm.querySelector('#signup-email').value;
      const password = signupForm.querySelector('#signup-password').value;
      const confirmPassword = signupForm.querySelector('#signup-confirm-password').value;
      const name = signupForm.querySelector('#signup-name').value;
      
      // Validate password match
      if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
      }
      
      // Validate password strength
      if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error');
        return;
      }
      
      signUpWithEmail(email, password, name)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Аккаунт успешно создан', 'success');
        })
        .catch(error => {
          const errorMessage = getAuthErrorMessage(error.code) || error.message;
          showNotification(errorMessage, 'error');
        });
    });
  }
  
  // Google sign-in handler
  const googleSignInBtn = document.querySelectorAll('.google-sign-in');
  googleSignInBtn.forEach(btn => {
    btn.addEventListener('click', () => {
      signInWithGoogle()
        .then(() => {
          closeModal('auth-modal');
          showNotification('Вы успешно вошли в систему через Google', 'success');
        })
        .catch(error => {
          const errorMessage = getAuthErrorMessage(error.code) || error.message;
          showNotification(errorMessage, 'error');
        });
    });
  });
  
  // Forgot password handler
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const email = emailInput ? emailInput.value : '';
      
      // Show forgot password form
      const forgotPasswordForm = document.getElementById('forgot-password-form');
      const loginTabContent = document.getElementById('login-tab-content');
      
      if (forgotPasswordForm && loginTabContent) {
        forgotPasswordForm.querySelector('#reset-email').value = email;
        loginTabContent.classList.remove('active');
        forgotPasswordForm.classList.add('active');
      }
    });
  }
  
  // Reset password form handler
  const resetForm = document.getElementById('forgot-password-form');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = resetForm.querySelector('#reset-email').value;
      
      resetPassword(email)
        .then(() => {
          showNotification('Инструкции по сбросу пароля отправлены на вашу почту', 'success');
          
          // Back to login form
          const forgotPasswordForm = document.getElementById('forgot-password-form');
          const loginTabContent = document.getElementById('login-tab-content');
          
          if (forgotPasswordForm && loginTabContent) {
            forgotPasswordForm.classList.remove('active');
            loginTabContent.classList.add('active');
          }
        })
        .catch(error => {
          const errorMessage = getAuthErrorMessage(error.code) || error.message;
          showNotification(errorMessage, 'error');
        });
    });
  }
  
  // Back to login button handler
  const backToLoginBtn = document.getElementById('back-to-login-btn');
  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', () => {
      const forgotPasswordForm = document.getElementById('forgot-password-form');
      const loginTabContent = document.getElementById('login-tab-content');
      
      if (forgotPasswordForm && loginTabContent) {
        forgotPasswordForm.classList.remove('active');
        loginTabContent.classList.add('active');
      }
    });
  }
  
  // Sign out button handler
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      signOut()
        .then(() => {
          showNotification('Вы вышли из системы', 'success');
        })
        .catch(error => {
          const errorMessage = getAuthErrorMessage(error.code) || error.message;
          showNotification(errorMessage, 'error');
        });
    });
  }
}

/**
 * Activate specific tab
 */
function activateTab(tabId) {
  const tab = document.querySelector(`[data-tab="${tabId}"]`);
  if (tab) {
    tab.click();
  }
}

/**
 * Show modal
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Close modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

/**
 * Update UI based on auth state
 */
function updateUIOnAuth(user) {
  // Update UI elements based on authentication state
  const authElements = document.querySelectorAll('[data-auth]');
  
  authElements.forEach(element => {
    const authState = element.getAttribute('data-auth');
    
    // Handle visibility based on auth state
    if (authState === 'logged-in' && user) {
      element.style.display = 'block';
    } else if (authState === 'logged-out' && !user) {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  });
  
  // Update user info elements
  if (user) {
    // Display user's name
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
      element.textContent = user.displayName || user.email || 'Пользователь';
    });
    
    // Display user's email
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(element => {
      element.textContent = user.email || '';
    });
    
    // Display user's profile picture if available
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(element => {
      if (user.photoURL) {
        element.src = user.photoURL;
        element.style.display = 'inline-block';
      } else {
        // Use initials as avatar if no photo
        const initials = (user.displayName || user.email || 'U')
          .split(' ')
          .map(name => name[0])
          .join('')
          .toUpperCase();
        
        element.style.display = 'none';
        
        // Create or update initials avatar
        let initialsAvatar = element.nextElementSibling;
        if (!initialsAvatar || !initialsAvatar.classList.contains('initials-avatar')) {
          initialsAvatar = document.createElement('div');
          initialsAvatar.className = 'initials-avatar';
          element.parentNode.insertBefore(initialsAvatar, element.nextSibling);
        }
        
        initialsAvatar.textContent = initials;
        initialsAvatar.style.display = 'flex';
      }
    });
    
    // Update wallet balance
    updateWalletBalance(user.uid);
  }
  
  // Update dropdown menus (if any)
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const dropdown = toggle.nextElementSibling;
      if (dropdown && dropdown.classList.contains('dropdown-menu')) {
        dropdown.classList.toggle('active');
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      const dropdownMenus = document.querySelectorAll('.dropdown-menu');
      dropdownMenus.forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
}

/**
 * Authentication Functions
 */

/**
 * Sign in with email and password
 */
function signInWithEmail(email, password) {
  return new Promise((resolve, reject) => {
    if (!window.auth) {
      reject(new Error('Authentication service not initialized'));
      return;
    }
    
    window.auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('User signed in:', user.email);
        resolve(user);
      })
      .catch(error => {
        console.error('Sign in error:', error);
        reject(error);
      });
  });
}

/**
 * Sign up with email and password
 */
function signUpWithEmail(email, password, name) {
  return new Promise((resolve, reject) => {
    if (!window.auth) {
      reject(new Error('Authentication service not initialized'));
      return;
    }
    
    // Create the user
    window.auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('New user created:', user.email);
        
        // Update profile with display name
        return user.updateProfile({
          displayName: name
        }).then(() => {
          console.log('User profile updated with name:', name);
          
          // Create user data in database
          const userData = {
            uid: user.uid,
            email: user.email,
            name: name,
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            wallet: {
              balance: 0,
              tokens: []
            },
            escrowId: null,  // Will be filled when user is created in escrow
            settings: {
              notifications: true,
              twoFactorAuth: false
            }
          };
          
          // Save to database (using Firebase or custom API)
          if (window.db) {
            return window.db.collection('users').doc(user.uid).set(userData);
          } else if (window.api && window.api.createUser) {
            return window.api.createUser(userData);
          } else {
            // Fallback to local storage if no database available
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[user.uid] = userData;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return userData;
          }
        });
      })
      .then(result => {
        // Reload the user to make sure all profile changes are applied
        if (window.auth.currentUser) {
          return window.auth.currentUser.reload().then(() => {
            resolve(window.auth.currentUser);
          });
        } else {
          resolve(result);
        }
      })
      .catch(error => {
        console.error('Sign up error:', error);
        reject(error);
      });
  });
}

/**
 * Sign in with Google
 */
function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    if (!window.auth) {
      reject(new Error('Authentication service not initialized'));
      return;
    }
    
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    window.auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        console.log('User signed in with Google:', user.email);
        
        // Check if this is a new user
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        if (isNewUser) {
          // Create user data for new Google users
          const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            wallet: {
              balance: 0,
              tokens: []
            },
            escrowId: null,
            settings: {
              notifications: true,
              twoFactorAuth: false
            },
            authProvider: 'google'
          };
          
          // Save to database
          if (window.db) {
            return window.db.collection('users').doc(user.uid).set(userData)
              .then(() => user);
          } else if (window.api && window.api.createUser) {
            return window.api.createUser(userData)
              .then(() => user);
          } else {
            // Fallback to local storage
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            users[user.uid] = userData;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return user;
          }
        } else {
          return user;
        }
      })
      .then(user => {
        resolve(user);
      })
      .catch(error => {
        console.error('Google sign in error:', error);
        reject(error);
      });
  });
}

/**
 * Reset password
 */
function resetPassword(email) {
  return new Promise((resolve, reject) => {
    if (!window.auth) {
      reject(new Error('Authentication service not initialized'));
      return;
    }
    
    window.auth.sendPasswordResetEmail(email)
      .then(() => {
        console.log('Password reset email sent to:', email);
        resolve();
      })
      .catch(error => {
        console.error('Reset password error:', error);
        reject(error);
      });
  });
}

/**
 * Sign out
 */
function signOut() {
  return new Promise((resolve, reject) => {
    if (!window.auth) {
      reject(new Error('Authentication service not initialized'));
      return;
    }
    
    window.auth.signOut()
      .then(() => {
        console.log('User signed out');
        
        // Clear local user data
        localStorage.removeItem('currentUser');
        
        resolve();
      })
      .catch(error => {
        console.error('Sign out error:', error);
        reject(error);
      });
  });
}

/**
 * Update wallet balance
 */
function updateWalletBalance(userId) {
  const balanceElements = document.querySelectorAll('.wallet-balance');
  
  // Attempt to get balance from API
  if (window.api && window.api.getWallet) {
    window.api.getWallet(userId)
      .then(wallet => {
        balanceElements.forEach(element => {
          element.textContent = wallet.balance.toFixed(2);
        });
      })
      .catch(error => {
        console.error('Error fetching wallet:', error);
        
        // Fallback to local storage
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const balance = userData.wallet ? userData.wallet.balance || 0 : 0;
        
        balanceElements.forEach(element => {
          element.textContent = balance.toFixed(2);
        });
      });
  } else {
    // Use local storage if API not available
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const balance = userData.wallet ? userData.wallet.balance || 0 : 0;
    
    balanceElements.forEach(element => {
      element.textContent = balance.toFixed(2);
    });
  }
}

/**
 * Get auth error message
 */
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Неверный формат email',
    'auth/user-disabled': 'Аккаунт отключен',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/email-already-in-use': 'Email уже используется',
    'auth/weak-password': 'Слишком простой пароль',
    'auth/operation-not-allowed': 'Операция не разрешена',
    'auth/account-exists-with-different-credential': 'Аккаунт уже существует с другим методом входа',
    'auth/credential-already-in-use': 'Учетные данные уже используются',
    'auth/popup-closed-by-user': 'Окно авторизации было закрыто',
    'auth/cancelled-popup-request': 'Запрос на открытие окна был отменен',
    'auth/popup-blocked': 'Окно авторизации было заблокировано',
    'auth/network-request-failed': 'Ошибка сети',
    'auth/timeout': 'Время операции истекло',
    'auth/too-many-requests': 'Слишком много запросов, попробуйте позже',
    'auth/requires-recent-login': 'Требуется повторный вход в систему',
    'auth/user-token-expired': 'Сессия истекла, войдите снова',
    'auth/web-storage-unsupported': 'Веб-хранилище не поддерживается',
    'auth/invalid-api-key': 'Неверный API ключ',
    'auth/app-deleted': 'Приложение было удалено',
    'auth/invalid-user-token': 'Недействительный токен',
    'auth/invalid-auth-event': 'Недопустимое событие аутентификации',
    'auth/invalid-tenant-id': 'Недопустимый идентификатор арендатора',
    'auth/argument-error': 'Ошибка аргумента'
  };
  
  return errorMessages[errorCode] || null;
}

// Initialize when imported
setupAuthModal();
setupAuthTabs();
setupAuthFormListeners();

// Export functions for use in other modules
export {
  checkAndInitAuth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
  signOut,
  getCurrentUser,
  updateUIOnAuth,
  showNotification,
  showModal,
  closeModal,
  activateTab
};

// Global getCurrentUser function
function getCurrentUser() {
  return window.auth ? window.auth.currentUser : null;
}

// Add to window object for global access
window.authUtils = {
  getCurrentUser,
  signOut,
  showNotification,
  updateUIOnAuth
};
