/**
 * UI Functions
 * This file contains UI utility functions
 */

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.classList.add('modal-open');
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Add icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  // Set notification content
  notification.innerHTML = `
    <i class="fas fa-${icon}"></i>
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  // Add to notifications container (create if it doesn't exist)
  let notificationsContainer = document.getElementById('notifications-container');
  if (!notificationsContainer) {
    notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'notifications-container';
    document.body.appendChild(notificationsContainer);
  }
  
  notificationsContainer.appendChild(notification);
  
  // Add show class for animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    closeNotification(notification);
  });
  
  // Auto close after duration
  if (duration > 0) {
    setTimeout(() => {
      closeNotification(notification);
    }, duration);
  }
  
  return notification;
}

// Close notification
function closeNotification(notification) {
  notification.classList.remove('show');
  
  // Remove after animation
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Loading spinner
function showLoading(containerId, message = 'Загрузка...') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const loading = document.createElement('div');
  loading.className = 'loading-spinner-container';
  loading.innerHTML = `
    <div class="loading-spinner"></div>
    <p class="loading-text">${message}</p>
  `;
  
  container.appendChild(loading);
  return loading;
}

// Hide loading spinner
function hideLoading(container) {
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }
  
  if (container) {
    const spinner = container.querySelector('.loading-spinner-container');
    if (spinner) {
      container.removeChild(spinner);
    }
  }
}

// Format currency
function formatCurrency(value, currency = 'ETH', decimals = 2) {
  return `${Number(value).toFixed(decimals)} ${currency}`;
}

// Format date
function formatDate(timestamp, format = 'full') {
  if (!timestamp) return '';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  if (format === 'full') {
    return date.toLocaleString();
  } else if (format === 'date') {
    return date.toLocaleDateString();
  } else if (format === 'time') {
    return date.toLocaleTimeString();
  } else if (format === 'relative') {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} дн. назад`;
    
    return date.toLocaleDateString();
  }
  
  return date.toLocaleString();
}

// Truncate text
function truncateText(text, maxLength = 20) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Truncate wallet address
function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return address.substring(0, startChars) + '...' + address.substring(address.length - endChars);
}

// Toggle element visibility
function toggleElement(elementId, show = null) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (show === null) {
    element.classList.toggle('hidden');
  } else if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

// Update element text content
function updateText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Modal close buttons
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
      }
    });
  });
  
  // Close modal when clicking outside the modal content
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
      e.target.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  });
  
  // Prevent modal content click from closing
  const modalContents = document.querySelectorAll('.modal-content, .auth-content');
  modalContents.forEach(content => {
    content.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
});

// UI event handlers and rendering functions

// Initialize UI components
function initializeUI() {
  // Set up event listeners for auth and UI interactions
  setupAuthListeners();
  setupUIListeners();
  
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
  // Submit Order Form
  const submitOrderForm = document.querySelector('#submit form');
  if (submitOrderForm) {
    submitOrderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Check if user is signed in
      if (!auth.currentUser) {
        showModal('auth-modal');
        return;
      }
      
      const orderData = {
        title: document.getElementById('order-title').value,
        category: document.getElementById('order-category').value,
        description: document.getElementById('order-description').value,
        budget: parseFloat(document.getElementById('order-budget').value),
        deadline: document.getElementById('order-deadline').value,
        creatorId: auth.currentUser.uid,
        creatorName: auth.currentUser.displayName || auth.currentUser.email
      };
      
      createOrder(orderData)
        .then(() => {
          submitOrderForm.reset();
          showNotification('Заказ успешно создан', 'success');
          
          // Navigate to explore tab
          document.querySelector('[data-tab="explore"]').click();
          
          // Reload orders
          loadMarketplaceOrders();
        })
        .catch(error => {
          showNotification('Ошибка: ' + error.message, 'error');
        });
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
  getAllOrders()
    .then(orders => {
      renderOrders(orders);
    })
    .catch(error => {
      console.error('Error loading orders:', error);
      showNotification('Ошибка загрузки заказов', 'error');
    });
}

// Load user portfolio data
function loadUserPortfolio() {
  if (!auth.currentUser) return;
  
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
  if (!auth.currentUser) return;
  
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
  if (!auth.currentUser) return;
  
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
function renderOrders(orders) {
  const ordersContainer = document.querySelector('#explore .card');
  if (!ordersContainer) return;
  
  // Clear previous orders except the header
  const header = ordersContainer.querySelector('.card-header');
  ordersContainer.innerHTML = '';
  ordersContainer.appendChild(header);
  
  if (orders.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Нет активных заказов';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '20px';
    ordersContainer.appendChild(emptyMessage);
    return;
  }
  
  orders.forEach(order => {
    const orderElement = createOrderElement(order);
    ordersContainer.appendChild(orderElement);
  });
}

// Create an order element
function createOrderElement(order) {
  const orderItem = document.createElement('div');
  orderItem.className = 'order-item';
  
  // Calculate funding percentage
  const fundingPercentage = (order.currentFunding / order.budget) * 100;
  
  orderItem.innerHTML = `
    <div class="order-thumbnail">
      <i class="fas fa-${getCategoryIcon(order.category)}"></i>
    </div>
    <div class="order-details">
      <h4 class="order-title">${order.title}</h4>
      <div class="order-meta">
        <span><i class="fas fa-tag"></i> ${order.category}</span>
        <span><i class="fas fa-users"></i> ${order.participants} Participants</span>
        <span><i class="fas fa-calendar"></i> ${getDeadlineText(order.deadline)}</span>
      </div>
      <p class="order-description">${order.description}</p>
      <div class="order-participation">
        <div class="progress-container">
          <div class="progress-label">
            <span>Funding Progress</span>
            <span>$${order.currentFunding.toFixed(2)} / $${order.budget.toFixed(2)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${fundingPercentage}%;"></div>
          </div>
        </div>
        <div class="order-actions">
          <button class="btn btn-primary btn-sm btn-participate" data-order-id="${order.id}">
            <i class="fas fa-plus"></i> Participate
          </button>
          <button class="btn btn-outline btn-sm btn-order-details" data-order-id="${order.id}">
            <i class="fas fa-info-circle"></i> Details
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners to the buttons
  const participateBtn = orderItem.querySelector('.btn-participate');
  participateBtn.addEventListener('click', function() {
    if (!auth.currentUser) {
      showModal('auth-modal');
      return;
    }
    
    showParticipationModal(order.id);
  });
  
  const detailsBtn = orderItem.querySelector('.btn-order-details');
  detailsBtn.addEventListener('click', function() {
    showOrderDetailsModal(order);
  });
  
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

// Document ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  initializeUI();
  
  // Add navigation event listener for page changes
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      
      // Load page-specific data
      if (page === 'marketplace') {
        loadMarketplaceOrders();
      } else if (page === 'portfolio') {
        loadUserPortfolio();
      } else if (page === 'revenue') {
        loadUserRevenue();
      } else if (page === 'wallet') {
        loadUserTransactions();
      }
    });
  });
}); 