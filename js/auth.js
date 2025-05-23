/**
 * Authentication Functions
 * This file contains functions for user authentication
 */

// Ensure AuthService is initialized and assign it to window.auth for compatibility
// This assumes auth-service.js is loaded before this script, 
// and AuthService constructor handles its own full initialization.
if (typeof AuthService !== 'undefined' && !window.authService) {
  window.authService = new AuthService();
  console.log('AuthService instance created from auth.js');
}

// Attempt to make AuthService compatible with existing window.auth checks
if (window.authService && !window.auth) {
    // Map AuthService methods to the expected window.auth interface if needed
    // For now, let's assume direct usage of authService or make it the primary auth provider
    window.auth = window.authService; // This makes AuthService the primary provider
    console.log('window.auth is now pointing to window.authService');

    // AuthService has its own onAuthStateChanged-like mechanism (addAuthStateListener)
    // If existing code relies on window.auth.onAuthStateChanged, we might need a shim or direct replacement.
    // For now, we rely on AuthService internal state management and UI updates.
}

// Variables to prevent multiple auth processing
let isProcessingAuth = false;
let lastAuthUserId = null;

// Проверка и инициализация аутентификации
function checkAndInitAuth() {
  // Проверяем доступность window.auth (которое теперь должно быть AuthService)
  if (!window.auth || typeof window.auth.isAuthenticated !== 'function') { // Check for a known AuthService method
    console.error('Authentication services not initialized - please check auth-service.js and its setup.');
    showNotification('Ошибка инициализации системы авторизации', 'error');
    return false;
  }

  // Auth state observer - using AuthService's listener mechanism
  // window.auth (AuthService) should call the listener with the user object or null
  if (typeof window.auth.addAuthStateListener === 'function') {
    window.auth.addAuthStateListener((user) => {
      // The user object from AuthService might be different from Firebase/LocalAuth user object.
      // Ensure updateUIOnAuth can handle it.
      if (user) {
        // User is signed in
        console.log('Auth.js: Auth state changed via AuthService listener: user signed in', user.email || user.id);
        updateUIOnAuth(user);
      } else {
        // User is signed out
        console.log('Auth.js: Auth state changed via AuthService listener: user signed out');
        updateUIOnAuth(null);
      }
    });
  } else {
    console.warn('window.auth.addAuthStateListener is not a function. UI updates on auth state change might not work correctly.');
  }

  // Set up modal functionality
  setupAuthModal();
  
  console.log('Auth module initialized successfully');
  return true;
}

// Проверяем при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  // Даем время на инициализацию Firebase/локальной авторизации
  checkAndInitAuth();
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
      
      // Проверяем доступность аутентификации
      if (!window.auth) {
        // Используем t() функцию для перевода, если она доступна
        const errorMessage = typeof t === 'function' ? t('auth.serviceUnavailable') : 'Система авторизации недоступна';
        showNotification(errorMessage, 'error');
        return;
      }
      
      // Показываем индикатор загрузки
      const submitBtn = signInForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (typeof t === 'function' ? t('auth.signingIn') : 'Входим...');
      }
      
      try {
        const email = document.getElementById('sign-in-email').value;
        const password = document.getElementById('sign-in-password').value;
        
        if (!email || !password) {
          throw new Error(typeof t === 'function' ? t('auth.emptyCredentials') : 'Пожалуйста, введите email и пароль');
        }
        
        console.log("Auth.js: Попытка входа через authService: ", email);
        // Используем window.authService.login, которое должно быть тем же, что и window.auth.login
        await window.auth.login({ email, password }); 
        // После успешного входа, AuthService должен обновить UI и состояние
        showNotification(typeof t === 'function' ? t('auth.loginSuccess') : 'Вход выполнен успешно!', 'success');
        closeModal('auth-modal'); // Закрываем модальное окно после успешного входа
      } catch (error) {
        console.error('Auth.js: Ошибка входа через signInWithEmail:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || (typeof t === 'function' ? t('auth.loginError') : 'Ошибка входа'), 'error');
      } finally {
        // Возвращаем кнопку в исходное состояние
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = typeof t === 'function' ? t('auth.signIn') : 'Войти';
        }
      }
    });
  }
  
  // Регистрация
  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Проверяем доступность аутентификации
      if (!window.auth) {
        // Используем t() функцию для перевода, если она доступна
        const errorMessage = typeof t === 'function' ? t('auth.serviceUnavailable') : 'Система авторизации недоступна';
        showNotification(errorMessage, 'error');
        return;
      }
      
      // Показываем индикатор загрузки
      const submitBtn = signUpForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (typeof t === 'function' ? t('auth.registering') : 'Регистрируем...');
      }
      
      try {
        const name = document.getElementById('sign-up-name').value;
        const email = document.getElementById('sign-up-email').value;
        const password = document.getElementById('sign-up-password').value;
        
        if (!name || !email || !password) {
          throw new Error(typeof t === 'function' ? t('auth.fillAllFields') : 'Пожалуйста, заполните все поля');
        }
        
        console.log("Auth.js: Попытка регистрации через authService: ", email);
        // Используем window.authService.register, которое должно быть тем же, что и window.auth.register
        await window.auth.register({ email, password, name });
        // После успешной регистрации, AuthService должен обновить UI и состояние
        showNotification(typeof t === 'function' ? t('auth.signupSuccess') : 'Регистрация прошла успешно! Теперь вы можете войти.', 'success');
        activateTab('sign-in-tab'); // Переключаем на вкладку входа
      } catch (error) {
        console.error('Auth.js: Ошибка регистрации через signUpWithEmail:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || (typeof t === 'function' ? t('auth.registerError') : 'Ошибка регистрации'), 'error');
      } finally {
        // Возвращаем кнопку в исходное состояние
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = typeof t === 'function' ? t('auth.signUp') : 'Зарегистрироваться';
        }
      }
    });
  }
  
  // Сброс пароля
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Проверяем доступность аутентификации
      if (!window.auth) {
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
      // Показываем индикатор загрузки
      const submitBtn = resetForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
      }
      
      try {
        const email = document.getElementById('reset-email').value;
        
        if (!email) {
          throw new Error('Пожалуйста, введите email');
        }
        
        await resetPassword(email);
      } catch (error) {
        console.error('Auth.js: Ошибка сброса пароля:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка сброса пароля', 'error');
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
      // Проверяем доступность аутентификации
      if (!window.auth) {
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
      googleSignInBtn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Google sign in error:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка входа через Google', 'error');
      } finally {
        googleSignInBtn.disabled = false;
      }
    });
  }
  
  // Регистрация через Google
  if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', async () => {
      // Проверяем доступность аутентификации
      if (!window.auth) {
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
      googleSignUpBtn.disabled = true;
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Google sign up error:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка входа через Google', 'error');
      } finally {
        googleSignUpBtn.disabled = false;
      }
    });
  }
  
  // Выход из системы
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      // Проверяем доступность аутентификации
      if (!window.auth) {
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
      signOutBtn.disabled = true;
      try {
        await signOut();
      } catch (error) {
        console.error('Auth.js: Ошибка выхода из системы:', error);
        showNotification(error.message || 'Ошибка выхода', 'error');
      } finally {
        signOutBtn.disabled = false;
      }
    });
  }
}

// Activate specific tab
function activateTab(tabId) {
  const tab = document.querySelector(`.auth-tab[data-target="${tabId}"]`);
  if (tab) {
    tab.click();
  }
}

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Add class to trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// Update UI based on auth state
function updateUIOnAuth(user) {
  // Prevent multiple simultaneous calls with the same user
  if (user && user.id === lastAuthUserId && isProcessingAuth) {
    console.log('Auth.js: Skipping duplicate auth processing for user', user.email || user.id);
    return;
  }
  
  if (isProcessingAuth) {
    console.log('Auth.js: Auth processing already in progress, skipping');
    return;
  }
  
  isProcessingAuth = true;
  lastAuthUserId = user ? user.id : null;
  
  try {
    const authControls = document.querySelector('.user-controls-auth');
    const loggedInControls = document.querySelector('.user-controls-logged-in');
    const userDisplayName = document.getElementById('user-display-name');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
      console.log('Auth.js: Updating UI for authenticated user', user.email || user.id);
      
      // Show logged in controls
      if (authControls) authControls.style.display = 'none';
      if (loggedInControls) loggedInControls.style.display = 'flex';
      
      // Update user info
      if (userDisplayName) {
        userDisplayName.textContent = user.displayName || user.email.split('@')[0];
      }
      
      // Update avatar
      if (userAvatar) {
        if (user.photoURL) {
          userAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName || 'User'}" />`;
        } else {
          userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
      }
      
      // Close auth modal if open
      closeModal('auth-modal');
      
      // Загружаем баланс кошелька
      updateWalletBalance(user.uid);
      
      // Synchronize with Escrow API if the module is loaded (only once per user)
      if (typeof window.escrowAPI !== 'undefined' && 
          typeof window.escrowAPI.userService !== 'undefined' && 
          typeof window.escrowAPI.userService.registerUserWithEscrow === 'function') {
        try {
          // Register or update user with Escrow API
          window.escrowAPI.userService.registerUserWithEscrow(user)
            .then(escrowUser => {
              console.log('User synchronized with Escrow API:', escrowUser.id);
            })
            .catch(error => {
              console.error('Failed to synchronize with Escrow API:', error);
              if (typeof showNotification === 'function') {
                showNotification(typeof t === 'function' 
                  ? t('escrow.syncError') 
                  : 'Ошибка синхронизации с API эскроу-системы', 'warning');
              }
            })
            .finally(() => {
              // Reset processing flag after Escrow sync is done
              setTimeout(() => {
                isProcessingAuth = false;
              }, 1000);
            });
        } catch (error) {
          console.error('Error initializing Escrow API synchronization:', error);
          setTimeout(() => {
            isProcessingAuth = false;
          }, 1000);
        }
      } else {
        // No Escrow API, reset flag immediately
        setTimeout(() => {
          isProcessingAuth = false;
        }, 500);
      }
    } else {
      console.log('Auth.js: Updating UI for signed out user');
      
      // Show auth controls
      if (authControls) authControls.style.display = 'flex';
      if (loggedInControls) loggedInControls.style.display = 'none';
      
      // Clear user info
      if (userDisplayName) userDisplayName.textContent = '';
      if (userAvatar) userAvatar.innerHTML = '<i class="fas fa-user"></i>';
      
      // Clear wallet balance
      updateWalletBalance(null);
      
      // Clear auth state
      lastAuthUserId = null;
      
      // Reset processing flag
      setTimeout(() => {
        isProcessingAuth = false;
      }, 500);
    }
  } catch (error) {
    console.error('Error in updateUIOnAuth:', error);
    // Reset processing flag on error
    setTimeout(() => {
      isProcessingAuth = false;
    }, 1000);
  }
}

/**
 * Функции авторизации
 */

// Вход по email и паролю
async function signInWithEmail(email, password) {
  console.log('Auth.js: Глобальный вызов signInWithEmail', email);
  if (!window.auth || typeof window.auth.login !== 'function') {
    console.error('AuthService (window.auth) is not available or does not have a login method.');
    throw new Error('Authentication service not available.');
  }
  try {
    const user = await window.auth.login({ email, password });
    console.log('Auth.js: Вход через signInWithEmail успешен', user);
    // AuthService должен сам обновить UI и состояние
    // showNotification('Вход выполнен успешно!', 'success'); // Уведомления могут быть в AuthService
    // closeModal('auth-modal');
    return user;
  } catch (error) {
    console.error('Auth.js: Ошибка входа через signInWithEmail:', error);
    // showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка входа', 'error');
    throw error;
  }
}

// Регистрация по email и паролю
async function signUpWithEmail(email, password, name) {
  console.log('Auth.js: Глобальный вызов signUpWithEmail', email);
  if (!window.auth || typeof window.auth.register !== 'function') {
    console.error('AuthService (window.auth) is not available or does not have a register method.');
    throw new Error('Authentication service not available.');
  }
  try {
    const user = await window.auth.register({ email, password, name });
    console.log('Auth.js: Регистрация через signUpWithEmail успешна', user);
    // AuthService должен сам обновить UI и состояние
    // showNotification('Регистрация прошла успешно! Теперь вы можете войти.', 'success');
    // activateTab('sign-in-tab');
    return user;
  } catch (error) {
    console.error('Auth.js: Ошибка регистрации через signUpWithEmail:', error);
    // showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка регистрации', 'error');
    throw error;
  }
}

// Вход через Google
async function signInWithGoogle() {
  try {
    // Проверяем доступность аутентификации
    if (!window.auth) {
      throw new Error('Система авторизации недоступна');
    }
    
    // Проверяем наличие провайдера
    if (!window.googleProvider) {
      throw new Error('Google Auth провайдер недоступен');
    }
    
    console.log('Вход через Google');
    const res = await window.auth.signInWithPopup(window.googleProvider);
    
    if (res && res.user) {
      console.log('Успешный вход через Google:', res.user.email);
      
      // Создаем запись пользователя в Firestore (если доступен)
      if (res.additionalUserInfo?.isNewUser && window.db) {
        try {
          await window.db.collection('users').doc(res.user.uid).set({
            email: res.user.email,
            displayName: res.user.displayName || res.user.email.split('@')[0],
            photoURL: res.user.photoURL,
            createdAt: new Date(),
            walletBalance: 0
          }, { merge: true });
        } catch (dbError) {
          console.error('Ошибка создания профиля в базе данных:', dbError);
          // Не рушим основной процесс регистрации, если БД недоступна
        }
      }
      
      // Закрываем модальное окно
      closeModal('auth-modal');
      
      // Показываем уведомление
      if (res.additionalUserInfo?.isNewUser) {
        showNotification(`Аккаунт успешно создан, ${res.user.displayName || res.user.email}!`, 'success');
      } else {
        showNotification(`Добро пожаловать, ${res.user.displayName || res.user.email}!`, 'success');
      }
      
      // Log event в аналитику
      if (window.analytics) {
        window.analytics.logEvent(res.additionalUserInfo?.isNewUser ? 'sign_up' : 'login', { method: 'google' });
      }
      
      return res.user;
    } else {
      throw new Error('Неизвестная ошибка при входе через Google');
    }
  } catch (error) {
    console.error('Ошибка входа через Google:', error);
    throw error;
  }
}

// Сброс пароля
async function resetPassword(email) {
  console.log('Auth.js: Глобальный вызов resetPassword', email);
  if (!window.auth || typeof window.auth.resetPassword !== 'function') { // Предполагаем, что в AuthService есть resetPassword
    console.error('AuthService (window.auth) is not available or does not have a resetPassword method.');
    // Если метода нет в AuthService, нужно будет либо добавить его, либо обработать эту ситуацию
    // Пока что просто выбросим ошибку, если метод не найден
    // В качестве альтернативы, можно закомментировать эту функциональность, если она не используется или не реализована в AuthService
    showNotification('Функция сброса пароля временно недоступна.', 'warning');
    // throw new Error('Password reset service not available.'); 
    return; // Не выбрасываем ошибку, а просто показываем уведомление
  }
  try {
    await window.auth.resetPassword(email);
    console.log('Auth.js: Запрос на сброс пароля отправлен для', email);
    // showNotification('Инструкции по сбросу пароля отправлены на ваш email.', 'success');
  } catch (error) {
    console.error('Auth.js: Ошибка сброса пароля:', error);
    // showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка сброса пароля', 'error');
    throw error;
  }
}

// Выход из системы
async function signOut() {
  if (window.auth && typeof window.auth.logout === 'function') {
    return window.auth.logout();
  }
  console.warn('Attempted to sign out, but no compatible auth service was found.');
}

// Обновление баланса кошелька
async function updateWalletBalance(userId) {
  try {
    if (!window.db || !userId) return;
    
    // Получаем данные пользователя
    const userDoc = await window.db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const walletBalanceValue = document.getElementById('wallet-balance-value');
      
      if (walletBalanceValue) {
        walletBalanceValue.textContent = userData.walletBalance?.toFixed(2) || '0.00';
      }
    }
  } catch (error) {
    console.error('Ошибка обновления баланса:', error);
  }
}

// Получение сообщения об ошибке
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Указан неверный формат email',
    'auth/user-disabled': 'Учетная запись отключена',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/email-already-in-use': 'Этот email уже используется',
    'auth/weak-password': 'Пароль слишком простой',
    'auth/operation-not-allowed': 'Операция не разрешена',
    'auth/account-exists-with-different-credential': 'Учетная запись с таким email уже существует',
    'auth/requires-recent-login': 'Требуется повторная авторизация',
    'auth/unauthorized-domain': 'Домен не авторизован',
    'auth/popup-blocked': 'Всплывающее окно было заблокировано',
    'auth/popup-closed-by-user': 'Всплывающее окно было закрыто пользователем',
    'auth/network-request-failed': 'Сетевая ошибка',
    'auth/timeout': 'Время ожидания истекло',
    'auth/app-deleted': 'Приложение удалено',
    'auth/app-not-authorized': 'Приложение не авторизовано',
    'auth/argument-error': 'Ошибка в аргументах',
    'auth/invalid-api-key': 'Неверный API ключ',
    'auth/invalid-continue-uri': 'Неверный URL',
    'auth/invalid-credential': 'Неверные учетные данные',
    'auth/invalid-message-payload': 'Неверное сообщение',
    'auth/invalid-oauth-client-id': 'Неверный ID клиента OAuth',
    'auth/invalid-oauth-provider': 'Неверный провайдер OAuth',
    'auth/invalid-persistence-type': 'Неверный тип хранения',
    'auth/invalid-phone-number': 'Неверный номер телефона',
    'auth/invalid-provider-data': 'Неверные данные провайдера',
    'auth/invalid-recipient-email': 'Неверный email получателя',
    'auth/invalid-sender': 'Неверный отправитель',
    'auth/missing-iframe-start': 'Отсутствует начало iframe',
    'auth/missing-phone-number': 'Отсутствует номер телефона',
    'auth/missing-verification-code': 'Отсутствует код подтверждения',
    'auth/missing-verification-id': 'Отсутствует ID подтверждения',
    'auth/no-current-user': 'Нет текущего пользователя',
    'auth/tenant-id-mismatch': 'Несоответствие tenant ID',
    'auth/too-many-requests': 'Слишком много запросов',
    'auth/web-storage-unsupported': 'Web-хранилище не поддерживается',
    'auth/not-found': 'Не найдено',
    'auth/internal-error': 'Внутренняя ошибка',
    'auth/configuration-not-found': 'Конфигурация не найдена'
  };
  
  return errorMessages[errorCode] || `Ошибка: ${errorCode}`;
} 