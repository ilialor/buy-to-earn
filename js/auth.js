/**
 * Authentication Functions
 * This file contains functions for user authentication
 */

// Проверка и инициализация аутентификации
function checkAndInitAuth() {
  // Проверяем доступность Firebase или локальной авторизации
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
  });

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
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
      // Показываем индикатор загрузки
      const submitBtn = signInForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Входим...';
      }
      
      try {
        const email = document.getElementById('sign-in-email').value;
        const password = document.getElementById('sign-in-password').value;
        
        if (!email || !password) {
          throw new Error('Пожалуйста, введите email и пароль');
        }
        
        console.log("Попытка входа: ", email);
        await signInWithEmail(email, password);
      } catch (error) {
        console.error('Sign in error:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка входа', 'error');
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
      
      // Проверяем доступность аутентификации
      if (!window.auth) {
        showNotification('Система авторизации недоступна', 'error');
        return;
      }
      
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
        
        if (!name || !email || !password) {
          throw new Error('Пожалуйста, заполните все поля');
        }
        
        console.log("Попытка регистрации: ", email);
        await signUpWithEmail(email, password, name);
      } catch (error) {
        console.error('Sign up error:', error);
        showNotification(getAuthErrorMessage(error.code) || error.message || 'Ошибка регистрации', 'error');
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
        console.error('Reset password error:', error);
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
        console.error('Sign out error:', error);
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
  const authControls = document.querySelector('.user-controls-auth');
  const loggedInControls = document.querySelector('.user-controls-logged-in');
  const userDisplayName = document.getElementById('user-display-name');
  const userAvatar = document.getElementById('user-avatar');

  if (user) {
    console.log('Updating UI for authenticated user', user.email);
    
    // User is signed in, show logged in UI
    if (authControls) authControls.style.display = 'none';
    if (loggedInControls) {
      loggedInControls.style.display = 'flex';
      
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
    }
  } else {
    console.log('Updating UI for signed out state');
    
    // User is signed out, show auth controls
    if (authControls) authControls.style.display = 'flex';
    if (loggedInControls) loggedInControls.style.display = 'none';
  }
}

/**
 * Функции авторизации
 */

// Вход по email и паролю
async function signInWithEmail(email, password) {
  try {
    // Проверяем доступность аутентификации
    if (!window.auth) {
      throw new Error('Система авторизации недоступна');
    }
    
    console.log('Вход по email:', email);
    const res = await window.auth.signInWithEmailAndPassword(email, password);
    
    if (res && res.user) {
      console.log('Успешный вход:', res.user.email);
      closeModal('auth-modal');
      
      // Показываем уведомление
      showNotification(`Добро пожаловать, ${res.user.displayName || res.user.email}!`, 'success');
      
      // Log event в аналитику
      if (window.analytics) {
        window.analytics.logEvent('login', { method: 'email' });
      }
      
      return res.user;
    }
  } catch (error) {
    console.error('Ошибка входа:', error);
    throw error;
  }
}

// Регистрация по email и паролю
async function signUpWithEmail(email, password, name) {
  try {
    // Проверяем доступность аутентификации
    if (!window.auth) {
      throw new Error('Система авторизации недоступна');
    }
    
    console.log('Регистрация по email:', email);
    const res = await window.auth.createUserWithEmailAndPassword(email, password);
    
    if (res && res.user) {
      console.log('Успешная регистрация:', res.user.email);
      
      // Обновляем профиль пользователя
      if (name) {
        await res.user.updateProfile({
          displayName: name
        });
      }
      
      // Создаем запись пользователя в Firestore (если доступен)
      try {
        if (window.db) {
          await window.db.collection('users').doc(res.user.uid).set({
            email: res.user.email,
            displayName: name || res.user.email.split('@')[0],
            createdAt: new Date(),
            walletBalance: 0
          }, { merge: true });
        }
      } catch (dbError) {
        console.error('Ошибка создания профиля в базе данных:', dbError);
        // Не рушим основной процесс регистрации, если БД недоступна
      }
      
      // Закрываем модальное окно
      closeModal('auth-modal');
      
      // Показываем уведомление
      showNotification(`Аккаунт успешно создан, ${name || res.user.email}!`, 'success');
      
      // Log event в аналитику
      if (window.analytics) {
        window.analytics.logEvent('sign_up', { method: 'email' });
      }
      
      return res.user;
    } else {
      throw new Error('Неизвестная ошибка при регистрации');
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error);
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
  try {
    // Проверяем доступность аутентификации
    if (!window.auth) {
      throw new Error('Система авторизации недоступна');
    }
    
    console.log('Сброс пароля для:', email);
    await window.auth.sendPasswordResetEmail(email);
    
    // Показываем уведомление
    showNotification(`Инструкции по сбросу пароля отправлены на ${email}`, 'success');
    
    // Переключаемся на экран входа
    activateTab('sign-in-tab');
    
    return true;
  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    throw error;
  }
}

// Выход из системы
async function signOut() {
  try {
    // Проверяем доступность аутентификации
    if (!window.auth) {
      throw new Error('Система авторизации недоступна');
    }
    
    console.log('Выход из системы');
    await window.auth.signOut();
    
    // Показываем уведомление
    showNotification('Вы успешно вышли из системы', 'success');
    
    return true;
  } catch (error) {
    console.error('Ошибка выхода из системы:', error);
    throw error;
  }
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