/**
 * Authentication Functions
 * This file contains functions for user authentication
 */

// Wait for Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем доступность Firebase или локальной авторизации
  setTimeout(() => {
    if (!window.auth || !window.db) {
      console.error('Authentication services not initialized - please check local-auth.js');
      return;
    }

    // Auth state observer
    window.auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        updateUIOnAuth(user);
      } else {
        // User is signed out
        updateUIOnAuth(null);
      }
    });

    // Set up modal functionality
    setupAuthModal();
    
    console.log('Auth module initialized successfully');
  }, 500); // Небольшая задержка для завершения инициализации
});

// Setup auth modal functionality
function setupAuthModal() {
  const signInBtn = document.getElementById('sign-in-btn');
  const authModal = document.getElementById('auth-modal');
  const closeBtn = authModal?.querySelector('.modal-close');

  // Open modal when sign-in button is clicked
  if (signInBtn && authModal) {
    signInBtn.addEventListener('click', () => {
      showModal('auth-modal');
    });
  }

  // Close modal when close button is clicked
  if (closeBtn && authModal) {
    closeBtn.addEventListener('click', () => {
      closeModal('auth-modal');
    });
  }

  // Close modal when clicking outside
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeModal('auth-modal');
      }
    });
  }

  // Set up tab switching
  setupAuthTabs();
  
  // Set up form listeners
  setupAuthFormListeners();
}

// Setup auth tabs
function setupAuthTabs() {
  const authTabs = document.querySelectorAll('.auth-tab');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToSignin = document.getElementById('switch-to-signin');
  const switchToReset = document.getElementById('switch-to-reset');
  const switchToSigninFromReset = document.getElementById('switch-to-signin-from-reset');

  // Tab click functionality
  if (authTabs.length > 0) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all content
        document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
        // Show target content
        const targetId = tab.getAttribute('data-target');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }

  // Tab switching via links
  if (switchToSignup) {
    switchToSignup.addEventListener('click', () => {
      activateTab('sign-up-tab');
    });
  }
  
  if (switchToSignin) {
    switchToSignin.addEventListener('click', () => {
      activateTab('sign-in-tab');
    });
  }
  
  if (switchToReset) {
    switchToReset.addEventListener('click', () => {
      activateTab('reset-password-tab');
    });
  }
  
  if (switchToSigninFromReset) {
    switchToSigninFromReset.addEventListener('click', () => {
      activateTab('sign-in-tab');
    });
  }
}

// Setup authentication form listeners
function setupAuthFormListeners() {
  const signInForm = document.getElementById('sign-in-form');
  const signUpForm = document.getElementById('sign-up-form');
  const resetForm = document.getElementById('reset-password-form');
  const googleSignInBtn = document.getElementById('google-sign-in');
  const googleSignUpBtn = document.getElementById('google-sign-up');
  const signOutBtn = document.getElementById('sign-out-btn');
  
  // Вход по email/пароль
  if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Показываем индикатор загрузки
      const submitBtn = signInForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Входим...';
      }
      
      try {
        const email = document.getElementById('sign-in-email').value;
        const password = document.getElementById('sign-in-password').value;
        await signInWithEmail(email, password);
      } catch (error) {
        console.error('Sign in error:', error);
      } finally {
        // Возвращаем кнопку в исходное состояние
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Войти';
        }
      }
    });
  }
  
  // Регистрация
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Показываем индикатор загрузки
      const submitBtn = signUpForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрируем...';
      }
      
      try {
        const name = document.getElementById('sign-up-name').value;
        const email = document.getElementById('sign-up-email').value;
        const password = document.getElementById('sign-up-password').value;
        await signUpWithEmail(email, password, name);
      } catch (error) {
        console.error('Sign up error:', error);
      } finally {
        // Возвращаем кнопку в исходное состояние
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Зарегистрироваться';
        }
      }
    });
  }
  
  // Сброс пароля
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Показываем индикатор загрузки
      const submitBtn = resetForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
      }
      
      try {
        const email = document.getElementById('reset-email').value;
        await resetPassword(email);
      } catch (error) {
        console.error('Reset password error:', error);
      } finally {
        // Возвращаем кнопку в исходное состояние
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Отправить инструкцию';
        }
      }
    });
  }
  
  // Вход через Google
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
      googleSignInBtn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Google sign in error:', error);
      } finally {
        googleSignInBtn.disabled = false;
      }
    });
  }
  
  // Регистрация через Google
  if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', async () => {
      googleSignUpBtn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Google sign up error:', error);
      } finally {
        googleSignUpBtn.disabled = false;
      }
    });
  }
  
  // Выход из системы
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      signOutBtn.disabled = true;
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        signOutBtn.disabled = false;
      }
    });
  }
}

// Activate specific tab
function activateTab(tabId) {
  const tabTrigger = document.querySelector(`.auth-tab[data-target="${tabId}"]`);
  if (tabTrigger) {
    tabTrigger.click();
  }
}

// Show modal function
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal function
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger reflow
  notification.offsetHeight;
  
  // Add show class
  notification.classList.add('show');
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Update UI when user is authenticated
function updateUIOnAuth(user) {
  const elements = {
    authControls: document.querySelector('.user-controls-auth'),
    loggedInControls: document.querySelector('.user-controls-logged-in'),
    userDisplayName: document.getElementById('user-display-name'),
    userAvatar: document.getElementById('user-avatar'),
    walletBalance: document.getElementById('wallet-balance-value')
  };

  // Check if elements exist before updating
  if (user) {
    // User is signed in
    if (elements.authControls) {
      elements.authControls.style.display = 'none';
    }
    if (elements.loggedInControls) {
      elements.loggedInControls.style.display = 'flex';
    }
    if (elements.userDisplayName) {
      elements.userDisplayName.textContent = user.displayName || 'Пользователь';
    }
    if (elements.userAvatar) {
      elements.userAvatar.innerHTML = user.photoURL ? 
        `<img src="${user.photoURL}" alt="User avatar">` : 
        '<i class="fas fa-user"></i>';
    }
    
    // Update wallet balance if element exists
    if (elements.walletBalance) {
      updateWalletBalance(user.uid);
    }
    
    // Log analytics event
    try {
      if (window.analytics) {
        window.analytics.logEvent('login', {
          method: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'unknown'
        });
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  } else {
    // User is signed out
    if (elements.authControls) {
      elements.authControls.style.display = 'flex';
    }
    if (elements.loggedInControls) {
      elements.loggedInControls.style.display = 'none';
    }
    if (elements.userDisplayName) {
      elements.userDisplayName.textContent = 'Пользователь';
    }
    if (elements.userAvatar) {
      elements.userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    if (elements.walletBalance) {
      elements.walletBalance.textContent = '0.00';
    }
    
    // Log analytics event
    try {
      if (window.analytics) {
        window.analytics.logEvent('logout');
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
  if (!window.auth) {
    showNotification('Система авторизации не инициализирована', 'error');
    return null;
  }
  
  try {
    const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
    showNotification('Успешный вход', 'success');
    closeModal('auth-modal');
    return userCredential.user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Sign up with email and password
async function signUpWithEmail(email, password, name) {
  if (!window.auth || !window.db) {
    showNotification('Система авторизации не инициализирована', 'error');
    return null;
  }
  
  try {
    const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update user profile
    if (user) {
      await user.updateProfile({
        displayName: name
      });
      
      // Create user document in Firestore
      try {
        await window.db.collection('users').doc(user.uid).set({
          name: name,
          email: email,
          createdAt: window.firebase ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
          role: 'user',
          walletBalance: 0
        });
      } catch (dbError) {
        console.error('Error creating user document', dbError);
        // Продолжаем даже если документ не создан
      }
    }
    
    showNotification('Регистрация успешна', 'success');
    closeModal('auth-modal');
    return user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  if (!window.auth || !window.googleProvider) {
    showNotification('Система авторизации не инициализирована', 'error');
    return null;
  }
  
  try {
    const result = await window.auth.signInWithPopup(window.googleProvider);
    
    // Check if this is a new user
    const isNewUser = result.additionalUserInfo?.isNewUser;
    
    if (isNewUser && window.db) {
      try {
        await window.db.collection('users').doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          createdAt: window.firebase ? firebase.firestore.FieldValue.serverTimestamp() : new Date(),
          role: 'user',
          walletBalance: 0
        });
      } catch (dbError) {
        console.error('Error creating user document', dbError);
        // Продолжаем даже если документ не создан
      }
    }
    
    showNotification('Успешный вход через Google', 'success');
    closeModal('auth-modal');
    return result.user;
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Reset password
async function resetPassword(email) {
  if (!window.auth) {
    showNotification('Система авторизации не инициализирована', 'error');
    return;
  }
  
  try {
    await window.auth.sendPasswordResetEmail(email);
    showNotification('Инструкции по сбросу пароля отправлены на email', 'success');
    closeModal('auth-modal');
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Sign out
async function signOut() {
  if (!window.auth) {
    showNotification('Система авторизации не инициализирована', 'error');
    return;
  }
  
  try {
    await window.auth.signOut();
    showNotification('Вы успешно вышли из системы', 'success');
  } catch (error) {
    const errorMessage = getAuthErrorMessage(error.code);
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// Update wallet balance
async function updateWalletBalance(userId) {
  if (!window.db) {
    return;
  }
  
  try {
    const userDoc = await window.db.collection('users').doc(userId).get();
    const balanceElement = document.getElementById('wallet-balance-value');
    
    if (userDoc.exists && balanceElement) {
      const balance = userDoc.data().walletBalance || 0;
      balanceElement.textContent = balance.toFixed(2);
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
  }
}

// Get localized error message
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Этот email уже используется',
    'auth/invalid-email': 'Неверный формат email',
    'auth/operation-not-allowed': 'Операция не разрешена',
    'auth/weak-password': 'Слишком слабый пароль',
    'auth/user-disabled': 'Аккаунт отключен',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/too-many-requests': 'Слишком много попыток входа. Попробуйте позже',
    'auth/popup-closed-by-user': 'Окно авторизации было закрыто',
    'auth/no-current-user': 'Нет активного пользователя',
    'default': 'Произошла ошибка при авторизации'
  };
  
  return errorMessages[errorCode] || errorMessages.default;
} 