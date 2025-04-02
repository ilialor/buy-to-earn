/**
 * UI Functions
 * This file contains UI utility functions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI components
  initializeModals();
});

// Initialize all modal windows
function initializeModals() {
  // Get all modals
  const modals = document.querySelectorAll('.modal');
  
  // Set up event handlers for each modal
  modals.forEach(modal => {
    // Get close button for this modal
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn-outline');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal(modal.id);
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        closeModal(modal.id);
      });
    }
    
    // Close when clicking outside modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Set up triggers for modals
  const modalTriggers = document.querySelectorAll('[data-modal]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal');
      showModal(modalId);
    });
  });
}

// Show a modal by ID
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close a modal by ID
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Force reflow to enable transition
  notification.offsetHeight;
  
  // Show notification
  notification.classList.add('show');
  
  // Remove after duration
  setTimeout(() => {
    closeNotification(notification);
  }, duration);
  
  return notification;
}

// Close a notification
function closeNotification(notification) {
  notification.classList.remove('show');
  
  // Remove from DOM after transition
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Show loading indicator
function showLoading(element) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  
  if (element) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    element.appendChild(loader);
  }
}

// Hide loading indicator
function hideLoading(element) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  
  if (element) {
    const loader = element.querySelector('.loader');
    if (loader) {
      element.removeChild(loader);
    }
  }
}

// Format currency amount
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('ru-RU', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
}

// Format date
function formatDate(date) {
  if (!date) return '';
  
  // If date is a timestamp
  if (typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  } else if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Format time ago
function formatTimeAgo(date) {
  if (!date) return '';
  
  // If date is a timestamp
  if (typeof date === 'object' && date.seconds) {
    date = new Date(date.seconds * 1000);
  } else if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'только что';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${declOfNum(minutes, ['минуту', 'минуты', 'минут'])} назад`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${declOfNum(hours, ['час', 'часа', 'часов'])} назад`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${declOfNum(days, ['день', 'дня', 'дней'])} назад`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${declOfNum(months, ['месяц', 'месяца', 'месяцев'])} назад`;
  
  const years = Math.floor(months / 12);
  return `${years} ${declOfNum(years, ['год', 'года', 'лет'])} назад`;
}

// Helper function for declension of numerals
function declOfNum(n, titles) {
  return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

// Toggle element visibility
function toggleElement(element, show) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  
  if (element) {
    element.style.display = show ? '' : 'none';
  }
}

// Set button in loading state
function setButtonLoading(button, isLoading) {
  if (typeof button === 'string') {
    button = document.getElementById(button);
  }
  
  if (button) {
    if (isLoading) {
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = '<div class="spinner"></div>';
      button.disabled = true;
    } else {
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.disabled = false;
    }
  }
}

// Validate form
function validateForm(form) {
  if (typeof form === 'string') {
    form = document.getElementById(form);
  }
  
  if (!form) return false;
  
  let isValid = true;
  
  // Get all required inputs
  const requiredInputs = form.querySelectorAll('[required]');
  
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });
  
  return isValid;
}

// Clear form
function clearForm(form) {
  if (typeof form === 'string') {
    form = document.getElementById(form);
  }
  
  if (form) {
    form.reset();
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }
}

// Handle form submit with validation
function handleFormSubmit(form, submitHandler) {
  if (typeof form === 'string') {
    form = document.getElementById(form);
  }
  
  if (!form || !submitHandler) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm(form)) {
      showNotification('Пожалуйста, заполните все обязательные поля', 'error');
      return;
    }
    
    // Get submit button
    const submitBtn = form.querySelector('[type="submit"]');
    
    try {
      // Show loading state
      if (submitBtn) {
        setButtonLoading(submitBtn, true);
      }
      
      // Call submit handler
      await submitHandler(form);
      
      // Clear form on success
      clearForm(form);
      
    } catch (error) {
      console.warn('Предупреждение при обработке данных формы:', error);
      showNotification(error.message || 'Произошла ошибка при отправке формы', 'error');
    } finally {
      // Reset loading state
      if (submitBtn) {
        setButtonLoading(submitBtn, false);
      }
    }
  });
}

// Truncate text to specified length
function truncateText(text, maxLength = 20) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Truncate wallet address
function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  return address.substring(0, startChars) + '...' + address.substring(address.length - endChars);
}

// Update text content of an element
function updateText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// UI event handlers and rendering functions

// Initialize UI components
function initializeUI() {
  // Set up event listeners for auth and UI interactions
  setupAuthListeners();
  setupUIListeners();
  
  // Проверяем состояние авторизации при инициализации
  if (auth && auth.currentUser) {
    console.log("Пользователь авторизован:", auth.currentUser.uid);
    
    // Обновляем UI в соответствии с авторизованным пользователем
    if (typeof showUserInfo === 'function') {
      showUserInfo(auth.currentUser);
    }
  } else {
    console.log("Пользователь не авторизован");
  }
  
  // Load initial data
  loadMarketplaceOrders();
}

// Set up auth-related event listeners
function setupAuthListeners() {
  // Sign In Form
  const signInForm = document.getElementById('sign-in-form');
  if (signInForm) {
    signInForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('sign-in-email').value;
      const password = document.getElementById('sign-in-password').value;
      
      signInWithEmail(email, password)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Авторизация успешна', 'success');
        })
        .catch(error => {
          showNotification('Ошибка авторизации: ' + error.message, 'error');
        });
    });
  }
  
  // Sign Up Form
  const signUpForm = document.getElementById('sign-up-form');
  if (signUpForm) {
    signUpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const displayName = document.getElementById('sign-up-name').value;
      const email = document.getElementById('sign-up-email').value;
      const password = document.getElementById('sign-up-password').value;
      
      signUpWithEmail(email, password, displayName)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Регистрация успешна', 'success');
        })
        .catch(error => {
          showNotification('Ошибка регистрации: ' + error.message, 'error');
        });
    });
  }
  
  // Google Sign In Button
  const googleSignInBtn = document.getElementById('google-sign-in');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', function(e) {
      signInWithGoogle()
        .then(() => {
          closeModal('auth-modal');
          showNotification('Авторизация через Google успешна', 'success');
        })
        .catch(error => {
          showNotification('Ошибка авторизации через Google: ' + error.message, 'error');
        });
    });
  }
  
  // Reset Password Form
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('reset-email').value;
      
      resetPassword(email)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Инструкции для сброса пароля отправлены на вашу почту', 'success');
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
    });
  }
  
  // Sign Out Button
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function() {
      signOut()
        .then(() => {
          showNotification('Выход выполнен успешно', 'success');
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
    });
  }
  
  // Auth Modal Tab Switching
  const authTabs = document.querySelectorAll('.auth-tab');
  if (authTabs.length) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        
        // Hide all tab contents
        document.querySelectorAll('.auth-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        authTabs.forEach(t => {
          t.classList.remove('active');
        });
        
        // Show selected tab content and mark tab as active
        document.getElementById(target).classList.add('active');
        this.classList.add('active');
      });
    });
  }
}

// Set up UI interaction listeners
function setupUIListeners() {
  // Обработчик клика по аватару пользователя
  const userAvatar = document.getElementById('user-info');
  if (userAvatar) {
    userAvatar.addEventListener('click', function(e) {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('show');
        e.stopPropagation();
      }
    });

    // Закрытие дропдауна при клике вне него
    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown && dropdown.classList.contains('show') && !userAvatar.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  // Обработчик клика по балансу кошелька
  const walletBalance = document.getElementById('wallet-balance-display');
  if (walletBalance) {
    walletBalance.addEventListener('click', function() {
      navigateToPage('wallet');
    });
  }

  // Обработчики пунктов дропдауна профиля
  const goToProfile = document.getElementById('go-to-profile');
  const goToWallet = document.getElementById('go-to-wallet');
  const goToPortfolio = document.getElementById('go-to-portfolio');
  const signOutBtn = document.getElementById('sign-out-btn');

  if (goToProfile) {
    goToProfile.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('profile');
      document.getElementById('user-dropdown').classList.remove('show');
    });
  }

  if (goToWallet) {
    goToWallet.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('wallet');
      document.getElementById('user-dropdown').classList.remove('show');
    });
  }

  if (goToPortfolio) {
    goToPortfolio.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigateToPage('portfolio');
      document.getElementById('user-dropdown').classList.remove('show');
    });
  }
  
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof signOut === 'function') {
        signOut();
      }
      document.getElementById('user-dropdown').classList.remove('show');
    });
  }
  
  // Обработчик кнопки "Apply as Executor"
  const applyExecutorBtn = document.getElementById('apply-executor-btn');
  if (applyExecutorBtn) {
    applyExecutorBtn.addEventListener('click', function() {
      // Проверка авторизации пользователя
      if (!isUserAuthenticated()) {
        showAuthModal('sign-in');
        // Показываем уведомление на текущем языке интерфейса
        const authRequiredMessage = getCurrentLanguageMessage({
          ru: 'Для подачи заявки необходимо авторизоваться',
          en: 'Authentication required to submit an application',
          es: 'Se requiere autenticación para enviar una solicitud'
        });
        showNotification('warning', authRequiredMessage);
        return;
      }
      
      // Здесь будет логика отправки заявки на роль исполнителя
      // Показываем уведомление на текущем языке интерфейса
      const successMessage = getCurrentLanguageMessage({
        ru: 'Ваша заявка отправлена на рассмотрение',
        en: 'Your application has been submitted for review',
        es: 'Su solicitud ha sido enviada para revisión'
      });
      showNotification('success', successMessage);
      
      // Можно также открыть модальное окно с формой для заполнения данных исполнителя
      // showModal('executor-application-modal');
    });
  }

  /**
   * Получает сообщение на текущем языке интерфейса
   * @param {Object} messages - Объект с сообщениями на разных языках
   * @returns {string} - Сообщение на текущем языке
   */
  function getCurrentLanguageMessage(messages) {
    const currentLocale = window.getUserLocale ? window.getUserLocale() : 'ru';
    return messages[currentLocale] || messages.en || Object.values(messages)[0];
  }

  // Submit Order Form
  const submitOrderForm = document.querySelector('#submit form');
  if (submitOrderForm) {
    submitOrderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Правильная проверка авторизации пользователя с использованием isUserAuthenticated
      let isAuthenticated = isUserAuthenticated();
      if (!isAuthenticated) {
        showNotification('Пожалуйста, войдите в систему для создания заказа', 'error');
        showModal('auth-modal');
        return;
      }
      
      // Получение данных формы
      try {
        const orderTitle = document.getElementById('order-title')?.value || '';
        const orderCategory = document.getElementById('order-category')?.value || '';
        const orderDescription = document.getElementById('order-description')?.value || '';
        const orderBudget = parseFloat(document.getElementById('order-budget')?.value || '0');
        const orderDeadline = document.getElementById('order-deadline')?.value || '';
        
        // Собираем данные заказа без привязки к window.auth.currentUser
        const orderData = {
          title: orderTitle,
          category: orderCategory,
          description: orderDescription,
          budget: orderBudget,
          deadline: orderDeadline
        };
        
        // Показываем индикатор загрузки
        const submitBtn = submitOrderForm.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
        }
        
        // Вызываем функцию createOrder из db.js, которая сама определит ID пользователя
        createOrder(orderData)
          .then((orderId) => {
            submitOrderForm.reset();
            showNotification('Заказ успешно создан', 'success');
            
            // Navigate to explore tab
            const exploreTab = document.querySelector('[data-tab="explore"]');
            if (exploreTab) {
              exploreTab.click();
            }
            
            // Создаем локальный объект заказа для мгновенного отображения
            const currentUser = getCurrentUser();
            if (currentUser) {
              // Добавляем созданный заказ на страницу сразу, не дожидаясь перезагрузки
              const newOrder = {
                id: orderId,
                ...orderData,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email || 'Пользователь',
                status: 'active',
                currentFunding: 0,
                participants: 0,
                createdAt: new Date()
              };
              
              // Находим существующие пользовательские заказы на странице или создаем раздел
              let userOrdersSection = document.querySelector('.user-orders-section');
              
              if (!userOrdersSection) {
                // Создаем раздел "Твои заказы"
                userOrdersSection = document.createElement('div');
                userOrdersSection.className = 'user-orders-section';
                
                // Добавляем заголовок
                const userOrdersHeader = document.createElement('h3');
                userOrdersHeader.className = 'section-title';
                userOrdersHeader.innerHTML = '<i class="fas fa-clipboard-list"></i> Твои заказы';
                userOrdersSection.appendChild(userOrdersHeader);
                
                // Добавляем в начало контейнера
                const ordersContainer = document.querySelector('#explore .card');
                if (ordersContainer) {
                  const header = ordersContainer.querySelector('.card-header');
                  ordersContainer.insertBefore(userOrdersSection, header.nextSibling);
                  
                  // Добавляем разделитель
                  const divider = document.createElement('hr');
                  divider.className = 'section-divider';
                  userOrdersSection.appendChild(divider);
                }
              }
              
              // Добавляем созданный заказ в начало раздела (перед разделителем)
              if (userOrdersSection) {
                const divider = userOrdersSection.querySelector('.section-divider');
                const orderElement = createOrderElement(newOrder, true);
                if (divider) {
                  userOrdersSection.insertBefore(orderElement, divider);
                } else {
                  userOrdersSection.appendChild(orderElement);
                }
              }
            }
            
            // Reload orders для обновления списка с сервера
            loadMarketplaceOrders();
          })
          .catch(error => {
            console.warn('Предупреждение при создании заказа:', error);
            showNotification('Ошибка: ' + error.message, 'error');
          })
          .finally(() => {
            // Восстанавливаем кнопку
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Создать заказ';
            }
          });
      } catch (error) {
        console.warn('Предупреждение при обработке данных заказа:', error);
        showNotification('Произошла ошибка при создании заказа', 'error');
      }
    });
  }
  
  // Participate in Order buttons
  const participateButtons = document.querySelectorAll('.btn-participate');
  participateButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Check if user is signed in
      if (!auth.currentUser) {
        showModal('auth-modal');
        return;
      }
      
      const orderId = this.getAttribute('data-order-id');
      showParticipationModal(orderId);
    });
  });
  
  // Wallet - Add Funds Form
  const addFundsForm = document.getElementById('add-funds-form');
  if (addFundsForm) {
    addFundsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check if user is signed in
      if (!auth.currentUser) {
        showModal('auth-modal');
        return;
      }
      
      const amount = parseFloat(document.getElementById('deposit-amount').value);
      
      addFundsToWallet(auth.currentUser.uid, amount)
        .then(() => {
          addFundsForm.reset();
          showNotification('Средства успешно добавлены', 'success');
          
          // Reload user data
          fetchUserData(auth.currentUser.uid);
          
          // Reload transactions
          loadUserTransactions();
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
    });
  }
  
  // Wallet - Withdraw Funds Form
  const withdrawForm = document.getElementById('withdraw-form');
  if (withdrawForm) {
    withdrawForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check if user is signed in
      if (!auth.currentUser) {
        showModal('auth-modal');
        return;
      }
      
      const amount = parseFloat(document.getElementById('withdraw-amount').value);
      
      withdrawFromWallet(auth.currentUser.uid, amount)
        .then(() => {
          withdrawForm.reset();
          showNotification('Запрос на вывод средств создан', 'success');
          
          // Reload user data
          fetchUserData(auth.currentUser.uid);
          
          // Reload transactions
          loadUserTransactions();
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
    });
  }
  
  // Profile - Update Profile Form
  const updateProfileForm = document.querySelector('#profile .profile-section form');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check if user is signed in
      if (!auth.currentUser) {
        showModal('auth-modal');
        return;
      }
      
      const profileData = {
        displayName: document.getElementById('profile-name').value,
        bio: document.getElementById('profile-bio').value
      };
      
      updateUserProfile(auth.currentUser.uid, profileData)
        .then(() => {
          // Update auth profile display name
          return auth.currentUser.updateProfile({
            displayName: profileData.displayName
          });
        })
        .then(() => {
          showNotification('Профиль обновлен', 'success');
          
          // Update UI with new profile data
          showUserInfo(auth.currentUser);
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
    });
  }
}

// Load marketplace orders
function loadMarketplaceOrders() {
  // Загружаем все заказы
  getAllOrders()
    .then(orders => {
      // Проверяем, авторизован ли пользователь
      if (isUserAuthenticated()) {
        // Получаем данные текущего пользователя
        const currentUser = getCurrentUser();
        if (currentUser) {
          // Фильтруем заказы пользователя
          const userOrders = orders.filter(order => order.userId === currentUser.uid);
          // Отображаем заказы с разделением на "Твои заказы" и "Все заказы"
          renderOrders(orders, userOrders);
          return;
        }
      }
      // Если пользователь не авторизован или нет его заказов, отображаем только все заказы
      renderOrders(orders);
    })
    .catch(error => {
      console.error('Error loading orders:', error);
      showNotification('Ошибка загрузки заказов', 'error');
    });
}

// Load user portfolio data
function loadUserPortfolio() {
  // Проверяем, авторизован ли пользователь, но не показываем окно авторизации
  // если данные о пользователе еще загружаются
  if (!auth) {
    console.log("Сервис авторизации не готов");
    return;
  }
  
  if (!auth.currentUser) {
    showNotification('Пожалуйста, войдите в систему', 'error');
    showModal('auth-modal');
    return;
  }
  
  const userId = auth.currentUser.uid;
  
  // Get user investments
  getUserInvestments(userId)
    .then(investments => {
      renderInvestments(investments);
    })
    .catch(error => {
      console.error('Error loading investments:', error);
    });
  
  // Get user NFTs
  getUserNFTs(userId)
    .then(nfts => {
      renderNFTs(nfts);
    })
    .catch(error => {
      console.error('Error loading NFTs:', error);
    });
}

// Load user revenue data
function loadUserRevenue() {
  // Проверяем, авторизован ли пользователь, но не показываем окно авторизации
  // если данные о пользователе еще загружаются
  if (!auth) {
    console.log("Сервис авторизации не готов");
    return;
  }
  
  if (!auth.currentUser) {
    showNotification('Пожалуйста, войдите в систему', 'error');
    showModal('auth-modal');
    return;
  }
  
  const userId = auth.currentUser.uid;
  
  getUserRevenue(userId)
    .then(revenues => {
      renderRevenues(revenues);
    })
    .catch(error => {
      console.error('Error loading revenues:', error);
    });
}

// Load user wallet transactions
function loadUserTransactions() {
  // Проверяем, авторизован ли пользователь, но не показываем окно авторизации
  // если данные о пользователе еще загружаются
  if (!auth) {
    console.log("Сервис авторизации не готов");
    return;
  }
  
  if (!auth.currentUser) {
    showNotification('Пожалуйста, войдите в систему', 'error');
    showModal('auth-modal');
    return;
  }
  
  const userId = auth.currentUser.uid;
  
  getUserTransactions(userId)
    .then(transactions => {
      renderTransactions(transactions);
    })
    .catch(error => {
      console.error('Error loading transactions:', error);
    });
}

// Render orders in the marketplace
function renderOrders(orders, userOrders = null) {
  const ordersContainer = document.querySelector('#explore .card');
  if (!ordersContainer) return;
  
  // Clear previous orders except the header
  const header = ordersContainer.querySelector('.card-header');
  ordersContainer.innerHTML = '';
  ordersContainer.appendChild(header);
  
  // Если у пользователя есть заказы, отображаем их в отдельном разделе
  if (userOrders && userOrders.length > 0) {
    // Создаем раздел "Твои заказы"
    const userOrdersSection = document.createElement('div');
    userOrdersSection.className = 'user-orders-section';
    
    // Добавляем заголовок
    const userOrdersHeader = document.createElement('h3');
    userOrdersHeader.className = 'section-title';
    userOrdersHeader.innerHTML = '<i class="fas fa-clipboard-list"></i> Твои заказы';
    userOrdersSection.appendChild(userOrdersHeader);
    
    // Добавляем заказы пользователя
    userOrders.forEach(order => {
      const orderElement = createOrderElement(order, true);
      userOrdersSection.appendChild(orderElement);
    });
    
    // Добавляем разделитель
    const divider = document.createElement('hr');
    divider.className = 'section-divider';
    userOrdersSection.appendChild(divider);
    
    // Добавляем раздел к контейнеру
    ordersContainer.appendChild(userOrdersSection);
  }
  
  // Проверяем, есть ли заказы для отображения в общем списке
  if (orders.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Нет активных заказов';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '20px';
    ordersContainer.appendChild(emptyMessage);
    return;
  }
  
  // Добавляем заголовок для всех заказов, если были показаны заказы пользователя
  if (userOrders && userOrders.length > 0) {
    const allOrdersHeader = document.createElement('h3');
    allOrdersHeader.className = 'section-title';
    allOrdersHeader.innerHTML = '<i class="fas fa-globe"></i> Все активные заказы';
    ordersContainer.appendChild(allOrdersHeader);
  }
  
  // Добавляем все заказы
  orders.forEach(order => {
    // Если это заказ пользователя и он уже был показан в разделе "Твои заказы", не показываем его снова
    if (userOrders && userOrders.some(userOrder => userOrder.id === order.id)) {
      return;
    }
    const orderElement = createOrderElement(order);
    ordersContainer.appendChild(orderElement);
  });
}

// Create an order element
function createOrderElement(order, isUserOrder = false) {
  const orderItem = document.createElement('div');
  orderItem.className = 'order-item';
  if (isUserOrder) {
    orderItem.classList.add('user-order');
  }
  
  // Calculate funding percentage
  const fundingPercentage = (order.currentFunding / order.budget) * 100;
  
  // Определяем действия в зависимости от того, чей это заказ
  let actionButtons = '';
  if (isUserOrder) {
    actionButtons = `
      <button class="btn btn-primary btn-sm btn-order-edit" data-order-id="${order.id}">
        <i class="fas fa-edit"></i> Редактировать
      </button>
      <button class="btn btn-outline btn-sm btn-order-details" data-order-id="${order.id}">
        <i class="fas fa-info-circle"></i> Детали
      </button>
    `;
  } else {
    actionButtons = `
      <button class="btn btn-primary btn-sm btn-participate" data-order-id="${order.id}">
        <i class="fas fa-plus"></i> Участвовать
      </button>
      <button class="btn btn-outline btn-sm btn-order-details" data-order-id="${order.id}">
        <i class="fas fa-info-circle"></i> Детали
      </button>
    `;
  }
  
  orderItem.innerHTML = `
    <div class="order-thumbnail">
      <i class="fas fa-${getCategoryIcon(order.category)}"></i>
    </div>
    <div class="order-details">
      <h4 class="order-title">${order.title}</h4>
      <div class="order-meta">
        <span><i class="fas fa-tag"></i> ${order.category}</span>
        <span><i class="fas fa-users"></i> ${order.participants} Участников</span>
        <span><i class="fas fa-calendar"></i> ${getDeadlineText(order.deadline)}</span>
        ${isUserOrder ? '<span class="badge user-badge"><i class="fas fa-user"></i> Ваш заказ</span>' : ''}
      </div>
      <p class="order-description">${order.description}</p>
      <div class="order-participation">
        <div class="progress-container">
          <div class="progress-label">
            <span>Прогресс финансирования</span>
            <span>$${order.currentFunding.toFixed(2)} / $${order.budget.toFixed(2)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${fundingPercentage}%;"></div>
          </div>
        </div>
        <div class="order-actions">
          ${actionButtons}
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners to the buttons
  if (isUserOrder) {
    const editBtn = orderItem.querySelector('.btn-order-edit');
    if (editBtn) {
      editBtn.addEventListener('click', function() {
        // В будущем можно добавить функционал редактирования
        showNotification('Функция редактирования заказа будет доступна в ближайшем обновлении', 'info');
      });
    }
  } else {
    const participateBtn = orderItem.querySelector('.btn-participate');
    if (participateBtn) {
      participateBtn.addEventListener('click', function() {
        if (!isUserAuthenticated()) {
          showModal('auth-modal');
          return;
        }
        
        showParticipationModal(order.id);
      });
    }
  }
  
  const detailsBtn = orderItem.querySelector('.btn-order-details');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', function() {
      showOrderDetailsModal(order);
    });
  }
  
  return orderItem;
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    'book': 'book',
    'software': 'laptop-code',
    'course': 'graduation-cap',
    'research': 'microscope',
    'design': 'paint-brush',
    'other': 'file-alt'
  };
  
  return icons[category.toLowerCase()] || 'file-alt';
}

// Get deadline text
function getDeadlineText(deadline) {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else {
    return `${diffDays} days left`;
  }
}

// Show order details modal
function showOrderDetailsModal(order) {
  const modalTitle = document.querySelector('#order-detail-modal .modal-title');
  const modalBody = document.querySelector('#order-detail-modal .modal-body');
  const participateBtn = document.querySelector('#order-detail-modal .btn-primary');
  
  modalTitle.textContent = order.title;
  
  // Update modal content
  modalBody.innerHTML = `
    <div class="modal-row">
      <div class="modal-row-label">Category:</div>
      <div class="modal-row-value">${order.category}</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Total Funding:</div>
      <div class="modal-row-value">$${order.budget.toFixed(2)}</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Current Progress:</div>
      <div class="modal-row-value">$${order.currentFunding.toFixed(2)} (${((order.currentFunding / order.budget) * 100).toFixed(0)}%)</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Participants:</div>
      <div class="modal-row-value">${order.participants}</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Deadline:</div>
      <div class="modal-row-value">${getDeadlineText(order.deadline)}</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Creator:</div>
      <div class="modal-row-value">${order.creatorName}</div>
    </div>
    <div class="modal-row">
      <div class="modal-row-label">Description:</div>
      <div class="modal-row-value">${order.description}</div>
    </div>
  `;
  
  // Set up participate button
  participateBtn.setAttribute('data-order-id', order.id);
  participateBtn.addEventListener('click', function() {
    if (!auth.currentUser) {
      closeModal('order-detail-modal');
      showModal('auth-modal');
      return;
    }
    
    closeModal('order-detail-modal');
    showParticipationModal(order.id);
  });
  
  // Show the modal
  showModal('order-detail-modal');
}

// Show participation modal
function showParticipationModal(orderId) {
  // Get order details
  db.collection('orders').doc(orderId).get()
    .then(doc => {
      if (!doc.exists) {
        showNotification('Заказ не найден', 'error');
        return;
      }
      
      const order = {
        id: doc.id,
        ...doc.data()
      };
      
      // Get user wallet balance
      return fetchUserData(auth.currentUser.uid)
        .then(userData => {
          const modalTitle = document.querySelector('#participation-modal .modal-title');
          const modalBody = document.querySelector('#participation-modal .modal-body');
          const confirmBtn = document.querySelector('#participation-modal .btn-primary');
          
          modalTitle.textContent = 'Participate in Order';
          
          // Update modal content
          modalBody.innerHTML = `
            <div class="modal-row">
              <div class="modal-row-label">Order Title:</div>
              <div class="modal-row-value">${order.title}</div>
            </div>
            <div class="modal-row">
              <div class="modal-row-label">Min. Participation:</div>
              <div class="modal-row-value">$50</div>
            </div>
            <div class="modal-row">
              <div class="modal-row-label">Your Wallet Balance:</div>
              <div class="modal-row-value">${userData.walletBalance.toFixed(2)} ETH</div>
            </div>
            <form id="participation-form">
              <div class="form-group">
                <label for="participation-amount">Participation Amount (ETH)</label>
                <input type="number" id="participation-amount" min="0.1" max="${userData.walletBalance}" step="0.1" placeholder="Enter amount">
              </div>
            </form>
          `;
          
          // Set up confirm button
          confirmBtn.onclick = function() {
            const amount = parseFloat(document.getElementById('participation-amount').value);
            
            if (isNaN(amount) || amount <= 0) {
              showNotification('Пожалуйста, введите корректную сумму', 'error');
              return;
            }
            
            if (amount > userData.walletBalance) {
              showNotification('Недостаточно средств на балансе', 'error');
              return;
            }
            
            participateInOrder(auth.currentUser.uid, order.id, amount)
              .then(() => {
                closeModal('participation-modal');
                showNotification('Вы успешно приняли участие в заказе', 'success');
                
                // Reload marketplace and portfolio
                loadMarketplaceOrders();
                loadUserPortfolio();
                
                // Reload user data
                fetchUserData(auth.currentUser.uid);
              })
              .catch(error => {
                showNotification('Ошибка: ' + error.message, 'error');
              });
          };
          
          // Show the modal
          showModal('participation-modal');
        });
    })
    .catch(error => {
      console.error('Error getting order:', error);
      showNotification('Ошибка загрузки данных заказа', 'error');
    });
}

// Добавляем новую функцию для навигации
function navigateToPage(page) {
  // Проверяем, является ли страница одной из основных страниц с навигационной ссылкой
  const navLink = document.querySelector(`[data-page="${page}"]`);
  
  if (navLink) {
    // Если есть ссылка навигации, используем её
    navLink.click();
  } else {
    // Если нет ссылки, переключаем напрямую
    // Сначала скрываем все страницы
    document.querySelectorAll('.page-content').forEach(pageContent => {
      pageContent.classList.remove('active');
    });
    
    // Затем показываем нужную страницу
    const pageElement = document.getElementById(page);
    if (pageElement) {
      pageElement.classList.add('active');
      
      // Обновляем активную ссылку в навигации (снимаем активность со всех)
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      // Если страница - профиль или кошелек, нужно загрузить соответствующие данные
      if (page === 'profile') {
        console.log('Переход на страницу профиля');
        // Если есть функция загрузки профиля, вызываем ее
        if (typeof loadUserProfile === 'function') {
          loadUserProfile();
        }
      } else if (page === 'wallet') {
        console.log('Переход на страницу кошелька');
        // Загружаем транзакции для страницы кошелька
        loadUserTransactions();
      }
    } else {
      console.error(`Страница "${page}" не найдена`);
      showNotification(`Страница "${page}" не найдена`, 'error');
    }
  }
  
  // Закрываем выпадающее меню, если оно открыто
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

// Глобальная функция для проверки авторизации - улучшенная версия
function isUserAuthenticated() {
  // Проверка наличия глобальных объектов auth и localStorage
  if (!window.auth) {
    // Проверяем локальную авторизацию через localStorage
    try {
      const localAuthKey = 'localAuth_currentUser';
      const storedUser = localStorage.getItem(localAuthKey);
      
      if (storedUser) {
        console.log('User authenticated via localStorage');
        return true;
      }
    } catch (e) {
      console.error('Error checking localStorage auth:', e);
    }
    
    // Проверяем, была ли уже инициализирована локальная авторизация
    if (!localStorage.getItem('localAuth_initialized')) {
      console.debug('Auth service not initialized yet, attempting to initialize local auth');
      if (typeof initLocalAuth === 'function') {
        try {
          initLocalAuth();
          localStorage.setItem('localAuth_initialized', 'true');
          
          // Проверяем еще раз после инициализации
          const storedUser = localStorage.getItem('localAuth_currentUser');
          return !!storedUser;
        } catch (e) {
          console.error('Failed to initialize local auth:', e);
        }
      }
    }
    
    return false;
  }
  
  // Проверка текущего пользователя через глобальный auth объект
  if (window.auth.currentUser) {
    return true;
  }
  
  // Дополнительная проверка локальной авторизации через localStorage
  try {
    // Проверяем, есть ли в localStorage данные о текущем пользователе
    const localAuthKey = 'localAuth_currentUser';
    const storedUser = localStorage.getItem(localAuthKey);
    
    if (storedUser) {
      console.log('User authenticated via localStorage');
      return true;
    }
  } catch (e) {
    console.error('Error checking localStorage auth:', e);
  }
  
  // Если ни один из методов не подтвердил авторизацию
  return false;
}

// Функция для получения данных текущего пользователя
function getCurrentUser() {
  // Сначала проверяем Firebase Auth
  if (window.auth && window.auth.currentUser) {
    return {
      uid: window.auth.currentUser.uid,
      displayName: window.auth.currentUser.displayName || window.auth.currentUser.email || 'Пользователь',
      email: window.auth.currentUser.email,
      isLocal: false
    };
  }
  
  // Если нет Firebase Auth, проверяем localStorage
  try {
    const localAuthKey = 'localAuth_currentUser';
    const storedUserJson = localStorage.getItem(localAuthKey);
    
    if (storedUserJson) {
      const storedUser = JSON.parse(storedUserJson);
      return {
        uid: storedUser.uid,
        displayName: storedUser.displayName || storedUser.email || 'Пользователь',
        email: storedUser.email,
        isLocal: true
      };
    }
  } catch (e) {
    console.error('Error getting user from localStorage:', e);
  }
  
  // Если пользователь не найден
  return null;
}

// Document ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  initializeUI();
  
  // Глобальный метод для проверки авторизации
  window.checkAuthentication = isUserAuthenticated;
  
  // Добавляем переменную для отслеживания, закрыл ли пользователь окно авторизации
  window.authDialogClosed = false;
  
  // Добавляем обработчик для отслеживания закрытия окна авторизации
  const authModal = document.getElementById('auth-modal');
  
  if (authModal) {
    // Обработчик закрытия по крестику
    const authModalClose = authModal.querySelector('.modal-close');
    if (authModalClose) {
      authModalClose.addEventListener('click', function() {
        window.authDialogClosed = true;
      });
    }
    
    // Обработчик закрытия по кнопке "Отмена" или аналогичной
    const cancelBtn = authModal.querySelector('.btn-outline');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        window.authDialogClosed = true;
      });
    }
    
    // Обработчик клика вне модального окна
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        window.authDialogClosed = true;
      }
    });
  }

  // Add navigation event listener for page changes
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(event) {
      const page = this.getAttribute('data-page');
      
      // Используем улучшенную функцию проверки авторизации
      let isAuthenticated = isUserAuthenticated();
      console.log(`Page ${page}, auth status: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
      
      // Загружаем данные для страницы, только если пользователь авторизован
      // или если это маркетплейс/документация (публичные страницы)
      if (page === 'marketplace' || page === 'docs') {
        // Публичные страницы всегда доступны
        if (page === 'marketplace') {
          loadMarketplaceOrders();
        }
        // Для страницы документации вызываем переводчик, чтобы обеспечить правильный перевод
        if (page === 'docs' && typeof translateDocument === 'function') {
          // Даем время на отображение страницы, затем вызываем перевод
          setTimeout(translateDocument, 100);
        }
      } else if (isAuthenticated) {
        // Приватные страницы доступны только авторизованным пользователям
        if (page === 'portfolio') {
          loadUserPortfolio();
        } else if (page === 'revenue') {
          loadUserRevenue();
        } else if (page === 'wallet') {
          loadUserTransactions();
        } else if (page === 'profile') {
          // Если будет добавлена функция загрузки профиля
          if (typeof loadUserProfile === 'function') {
            loadUserProfile();
          }
        }
      } else {
        // Если пользователь не авторизован и пытается открыть приватную страницу
        console.log('User not authenticated, showing auth dialog');
        
        // Используем перевод для уведомления
        const authRequiredMessage = typeof t === 'function' ? t('auth.authRequired') : 'Пожалуйста, войдите в систему';
        
        // Показываем уведомление только если пользователь не закрывал окно авторизации ранее
        showNotification(authRequiredMessage, 'error');
        
        // Показываем окно авторизации только если пользователь не закрывал его ранее
        if (!window.authDialogClosed) {
          showModal('auth-modal');
        }
        
        // Предотвращаем переключение на приватную страницу
        event.preventDefault();
        return false;
      }
    });
  });
}); 