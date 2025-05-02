/**
 * Escrow UI Module
 * UI integration for escrow functionality
 */

import EscrowApplication from './application.js';
import { PLATFORM_SIGNATURE_ID, UserType, OrderStatus, MilestoneStatus } from './constants.js';
import { getCurrentUser } from '../ui.js';

class EscrowUI {
  constructor() {
    // Initialize Escrow Application
    this.escrowApp = new EscrowApplication();
    this.currentUser = null;
    
    console.log('Escrow UI initialized');
  }
  
  /**
   * Helper function to get translated messages
   */
  _getCurrentLanguageMessage(key) {
    // Check if we have global function
    if (typeof window.getCurrentLanguageMessage === 'function') {
      return window.getCurrentLanguageMessage(key);
    }
    
    // Fallback translations map for most common messages
    const fallbackTranslations = {
      'order.max_milestones': 'Maximum number of milestones is 10',
      'order.milestone_description': 'Milestone Description',
      'order.amount': 'Amount',
      'order.add_milestone': 'Please add at least one milestone',
      'order.invalid_milestone_data': 'Milestone data is invalid',
      'order.enter_valid_amount': 'Please enter a valid amount',
      'order.joined_success': 'Successfully joined the order',
      'order.join_error': 'Error joining order',
      'escrow.user_not_found': 'User not found in escrow system',
      'escrow.order_created': 'Order created successfully',
      'escrow.error_creating': 'Error creating order'
    };
    
    // Get current language
    const currentLang = document.documentElement.lang || 'en';
    
    if (currentLang === 'ru') {
      // Russian translations
      const ruTranslations = {
        'order.max_milestones': 'Максимальное количество этапов - 10',
        'order.milestone_description': 'Описание этапа',
        'order.amount': 'Сумма',
        'order.add_milestone': 'Пожалуйста, добавьте хотя бы один этап',
        'order.invalid_milestone_data': 'Данные этапа недействительны',
        'order.enter_valid_amount': 'Пожалуйста, введите допустимую сумму',
        'order.joined_success': 'Успешно присоединился к заказу',
        'order.join_error': 'Ошибка при присоединении к заказу',
        'escrow.user_not_found': 'Пользователь не найден в системе',
        'escrow.order_created': 'Заказ успешно создан',
        'escrow.error_creating': 'Ошибка создания заказа'
      };
      return ruTranslations[key] || fallbackTranslations[key] || key;
    } else if (currentLang === 'es') {
      // Spanish translations
      const esTranslations = {
        'order.max_milestones': 'El número máximo de hitos es 10',
        'order.milestone_description': 'Descripción del Hito',
        'order.amount': 'Monto',
        'order.add_milestone': 'Por favor, añada al menos un hito',
        'order.invalid_milestone_data': 'Los datos del hito no son válidos',
        'order.enter_valid_amount': 'Por favor, ingrese un monto válido',
        'order.joined_success': 'Se unió con éxito a la orden',
        'order.join_error': 'Error al unirse a la orden',
        'escrow.user_not_found': 'Usuario no encontrado en el sistema',
        'escrow.order_created': 'Orden creada con éxito',
        'escrow.error_creating': 'Error al crear la orden'
      };
      return esTranslations[key] || fallbackTranslations[key] || key;
    }
    
    // Default to English or key itself
    return fallbackTranslations[key] || key;
  }
  
  /**
   * Initialize the UI components
   */
  init() {
    // Listen for form submissions and button clicks
    this._setupEventListeners();
    
    // Update UI based on current user
    this._handleUserChange();
    
    // Listen for user auth changes
    document.addEventListener('userChanged', () => {
      this._handleUserChange();
    });
    
    // Initialize contractors dropdown
    this._populateContractorsDropdown();
    
    // Show initialization notification
    showNotification('Эскроу-функциональность загружена', 'info');
  }
  
  /**
   * Set up event listeners for forms and buttons
   */
  _setupEventListeners() {
    // Обработчик для стандартной формы создания заказа на странице маркетплейса
    const marketplaceOrderForm = document.getElementById('create-order-form');
    if (marketplaceOrderForm) {
      // Добавляем первый milestone при инициализации формы
      this._addMilestoneField(marketplaceOrderForm.querySelector('#create-order-milestones-container'));
      
      // Добавляем обработчик кнопки добавления milestone
      const addMilestoneBtn = marketplaceOrderForm.querySelector('#create-order-add-milestone-btn');
      if (addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this._addMilestoneField(marketplaceOrderForm.querySelector('#create-order-milestones-container'));
        });
      }
      
      // Добавляем обработчик отправки формы
      marketplaceOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleOrderCreation(e.target);
      });
    }
    
    // Обработчик для модальной формы создания заказа
    const modalOrderForm = document.getElementById('modal-create-order-form');
    if (modalOrderForm) {
      // Добавляем первый milestone при инициализации формы
      this._addMilestoneField(modalOrderForm.querySelector('#modal-milestones-container'));
      
      // Добавляем обработчик кнопки добавления milestone
      const modalAddMilestoneBtn = document.getElementById('modal-add-milestone-btn');
      if (modalAddMilestoneBtn) {
        modalAddMilestoneBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this._addMilestoneField(modalOrderForm.querySelector('#modal-milestones-container'));
        });
      }
      
      // Добавляем обработчик отправки формы
      modalOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleOrderCreation(e.target);
      });
    }
    
    // Order participation form
    const participateForm = document.getElementById('participate-form');
    if (participateForm) {
      participateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleOrderParticipation(e.target);
      });
    }
    
    // Mark milestone complete button
    document.addEventListener('click', (e) => {
      if (e.target.matches('.mark-milestone-complete-btn')) {
        const orderId = e.target.dataset.orderId;
        const milestoneId = e.target.dataset.milestoneId;
        this._handleMarkMilestoneComplete(orderId, milestoneId);
      }
      
      if (e.target.matches('.sign-act-btn')) {
        const orderId = e.target.dataset.orderId;
        const milestoneId = e.target.dataset.milestoneId;
        this._handleSignAct(orderId, milestoneId);
      }
      
      if (e.target.matches('.vote-rep-btn')) {
        const orderId = e.target.dataset.orderId;
        this._showVoteRepModal(orderId);
      }
    });
    
    // Vote form
    const voteForm = document.getElementById('vote-representative-form');
    if (voteForm) {
      voteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleVoteSubmission(e.target);
      });
    }
    
    // Deposit form
    const depositForm = document.getElementById('deposit-form');
    if (depositForm) {
      depositForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleDeposit(e.target);
      });
    }
    
    // Обновляем обработчик изменения пользователя, чтобы также обновлять баланс в кошельке
    document.addEventListener('userChanged', () => {
      this._updateEscrowBalance();
    });
  }
  
  /**
   * Handle user authentication change
   */
  async _handleUserChange() {
    // Get current user from auth
    const user = getCurrentUser(); // This function should be defined elsewhere in your app
    
    if (user) {
      this.currentUser = user;
      
      // First, update UI for authenticated state
      this._updateAuthenticatedUI();
      
      // Then check if the user exists in the Escrow API and use that data
      try {
        // Use the user-service to register/get the user from Escrow API
        if (window.escrowAPI && window.escrowAPI.userService && 
            typeof window.escrowAPI.userService.registerUserWithEscrow === 'function') {
          
          console.log('Syncing user with Escrow API...');
          const escrowUser = await window.escrowAPI.userService.registerUserWithEscrow(user);
          
          if (escrowUser && escrowUser.id) {
            console.log('User synchronized with Escrow API:', escrowUser.id);
            // Update UI with data from API
            this._updateBalanceDisplay(escrowUser.balance || 0);
            this._loadUserOrders();
          }
        }
      } catch (error) {
        console.error('Error connecting to Escrow API:', error);
      }
    } else {
      this.currentUser = null;
      // Update UI for unauthenticated state
      this._updateUnauthenticatedUI();
    }
  }
  
  /**
   * Make sure the user has an escrow user object
   */
  _ensureEscrowUser(user) {
    // Get all users from escrow
    const escrowUsers = this.escrowApp.getAllUsers();
    
    // Look for a user with matching ID/email
    const existingUser = escrowUsers.find(eu => eu.name === user.email || eu.user_id === user.uid);
    
    if (!existingUser) {
      // Create a new customer by default
      // In a real application, you'd check their role
      const newCustomer = this.escrowApp.createCustomer(user.displayName || user.email);
      console.log(`Created escrow customer for ${user.email}: ${newCustomer.user_id}`);
      
      // Give them some initial balance for testing
      this.escrowApp.customerDeposit(newCustomer.user_id, 1000);
    }
  }
  
  /**
   * Update UI for authenticated users
   */
  _updateAuthenticatedUI() {
    // Show escrow-related elements
    document.querySelectorAll('.escrow-auth-required').forEach(el => {
      el.style.display = 'block';
    });
    
    // Update balance display
    this._updateEscrowBalance();
    
    // Load user's orders
    this._loadUserOrders();
  }
  
  /**
   * Update UI for unauthenticated users
   */
  _updateUnauthenticatedUI() {
    // Hide escrow-related elements
    document.querySelectorAll('.escrow-auth-required').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  /**
   * Use local user data for balance display
   * @private
   */
  _useLocalUserData() {
    try {
      // Check if escrowApp exists and has necessary methods
      if (this.escrowApp && typeof this.escrowApp.getAllUsers === 'function') {
        // Используем getAllUsers и находим пользователя по ID вместо прямого вызова getUserById
        const allUsers = this.escrowApp.getAllUsers();
        const localUser = allUsers.find(user => user.user_id === this.currentUser.uid);
        if (localUser) {
          const balance = localUser.balance || 0;
          this._updateBalanceDisplay(balance);
          return true;
        }
      }
      
      // Если данных нет, показываем нулевой баланс
      this._updateBalanceDisplay(0);
      return false;
    } catch (error) {
      console.warn('Error accessing local user data:', error);
      this._updateBalanceDisplay(0);
      return false;
    }
  }
  
  /**
   * Update balance displays with given value
   * @param {number} balance - Balance to display
   * @private
   */
  _updateBalanceDisplay(balance) {
    // Update escrow balance in wallet
    const escrowBalanceEl = document.getElementById('escrow-balance-value');
    if (escrowBalanceEl) {
      escrowBalanceEl.textContent = Number(balance).toFixed(2);
    }
    
    // Also update standard balance display
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) {
      balanceEl.textContent = `${Number(balance).toFixed(2)} USD`;
    }
  }
  
  /**
   * Synchronize API user data with local storage
   * @param {Object} userData - User data from API
   * @private
   */
  _syncLocalUserData(userData) {
    // Also update local storage for backward compatibility
    if (this.escrowApp && userData && userData.id) {
      try {
        // Получаем всех пользователей
        const allUsers = this.escrowApp.getAllUsers();
        
        // Ищем пользователя по ID
        const localUser = allUsers.find(user => user.user_id === this.currentUser.uid);
        
        if (localUser) {
          // Обновляем баланс
          localUser.balance = Number(userData.balance || 0);
          this.escrowApp.storage.saveUser(localUser);
        } else {
          console.warn('Локальный пользователь не найден для синхронизации с API');
        }
      } catch (localError) {
        console.warn('Could not update local user balance:', localError);
      }
    }
  }

  /**
   * Update escrow balance display in wallet
   * Modified to use Escrow API integration and real DB data
   */
  async _updateEscrowBalance() {
    if (!this.currentUser) return;
    
    try {
      // Check if Escrow API is available
      if (!window.escrowAPI || !window.escrowAPI.userService) {
        console.warn('Escrow API service is not available');
        return;
      }
      
      // First try to get the user directly from the database
      try {
        // Get all users from database
        if (window.escrowAPI.client && typeof window.escrowAPI.client.getUsers === 'function') {
          const allUsers = await window.escrowAPI.client.getUsers();
          
          // Look for the user by email
          const dbUser = allUsers.find(user => user.email === this.currentUser.email);
          
          if (dbUser) {
            console.log('Found user in database:', dbUser.id);
            
            // Save the mapping between local ID and DB ID
            if (window.escrowAPI.userService && typeof window.escrowAPI.userService.saveEscrowUserId === 'function') {
              window.escrowAPI.userService.saveEscrowUserId(this.currentUser.uid, dbUser.id);
            } else {
              // Fallback to direct localStorage access
              const mapping = JSON.parse(localStorage.getItem('escrowUserMapping') || '{}');
              mapping[this.currentUser.uid] = dbUser.id;
              localStorage.setItem('escrowUserMapping', JSON.stringify(mapping));
              localStorage.setItem('currentEscrowUserId', dbUser.id);
            }
            
            // Update balance display with data from database
            this._updateBalanceDisplay(dbUser.balance || 0);
            return;
          }
        }
      } catch (dbError) {
        console.error('Error getting users from database:', dbError);
      }
      
      // If we didn't find the user in the database, try to register them
      try {
        if (typeof window.escrowAPI.userService.registerUserWithEscrow === 'function') {
          console.log('Registering user with Escrow API...');
          const escrowUser = await window.escrowAPI.userService.registerUserWithEscrow(this.currentUser);
          
          if (escrowUser && !escrowUser._isLocalOnly) {
            console.log('User registered with Escrow API:', escrowUser.id);
            this._updateBalanceDisplay(escrowUser.balance || 0);
            return;
          }
        }
      } catch (registerError) {
        console.error('Error registering user with Escrow:', registerError);
      }
      
      // As a last resort, try getCurrentUser
      try {
        if (typeof window.escrowAPI.userService.getCurrentUser === 'function') {
          const result = await window.escrowAPI.userService.getCurrentUser();
          
          if (result?.success && result.data) {
            this._updateBalanceDisplay(result.data.balance || 0);
            // Sync with local storage for compatibility
            this._syncLocalUserData(result.data);
            return;
          }
        }
      } catch (getCurrentError) {
        console.error('Error getting current user:', getCurrentError);
      }
      
      // Finally, fall back to local data as a last resort
      this._useLocalUserData();
  
    } catch (error) {
      console.error('Error updating escrow balance:', error);
      // Trying to use local data as fallback
      try {
        // Check if escrowApp exists and has necessary methods
        if (this.escrowApp && typeof this.escrowApp.getAllUsers === 'function') {
          // Используем getAllUsers и находим пользователя по ID вместо прямого вызова getUserById
          const allUsers = this.escrowApp.getAllUsers();
          const localUser = allUsers.find(user => user.user_id === this.currentUser.uid);
          if (localUser) {
            const balance = localUser.balance || 0;
            updateBalanceDisplay(balance);
          }
        }
      } catch (fallbackError) {
        console.warn('Fallback error:', fallbackError);
        // В случае всех ошибок показываем нулевой баланс
        updateBalanceDisplay(0);
      }
    }
    
    // Helper function to update balance display
    function updateBalanceDisplay(balance) {
      // Update escrow balance in wallet
      const escrowBalanceEl = document.getElementById('escrow-balance-value');
      if (escrowBalanceEl) {
        escrowBalanceEl.textContent = Number(balance).toFixed(2);
      }
      
      // Also update standard balance display
      const balanceEl = document.getElementById('user-balance');
      if (balanceEl) {
        balanceEl.textContent = `${Number(balance).toFixed(2)} USD`;
      }
    }
  }
  
  /**
   * Load user's orders
   * Modified to use Escrow API integration
   */
  async _loadUserOrders() {
    if (!this.currentUser) return;
    
    // Show loading indicator
    if (window.escrowAPI && window.escrowAPI.uiUtils && typeof window.escrowAPI.uiUtils.showLoading === 'function') {
      window.escrowAPI.uiUtils.showLoading();
    }
    
    try {
      // Проверяем доступность API Escrow
      if (!window.escrowAPI || !window.escrowAPI.orderService || typeof window.escrowAPI.orderService.getOrders !== 'function') {
        console.warn('escrowAPI.orderService.getOrders не доступен, использую локальные данные');
        // Используем локальную реализацию, если API недоступен
        const userOrders = {
          orders_created: this.escrowApp?.getUserCreatedOrders(this.currentUser.uid) || [],
          orders_joined: this.escrowApp?.getUserJoinedOrders(this.currentUser.uid) || [],
          orders_assigned: this.escrowApp?.getUserAssignedOrders(this.currentUser.uid) || []
        };
        this._renderUserOrders(userOrders);
        return;
      }
      
      // Use the Escrow API to get all orders, then filter for current user
      const allOrders = await window.escrowAPI.orderService.getOrders();
      
      // Получаем ID текущего пользователя
      const currentUserId = this.currentUser?.uid || this.currentUser?.id;
      
      // Если нет ID пользователя, невозможно фильтровать заказы
      if (!currentUserId) {
        console.warn('Не удалось определить ID текущего пользователя для фильтрации заказов');
        return;
      }
      
      // Фильтруем заказы пользователя
      const createdOrders = allOrders.filter(order => order.customerId === currentUserId || order.customerIds?.includes(currentUserId));
      const joinedOrders = allOrders.filter(order => order.isGroupOrder && order.customerIds?.includes(currentUserId) && order.customerId !== currentUserId);
      const assignedOrders = allOrders.filter(order => order.contractorId === currentUserId);
      
      // Structure data for the existing rendering function
      const userOrders = {
        orders_created: createdOrders || [],
        orders_joined: joinedOrders || [],
        orders_assigned: assignedOrders || []
      };
      
      // Also update local storage for backward compatibility
      if (this.escrowApp) {
        try {
          // Sync with local storage
          createdOrders.forEach(order => {
            this.escrowApp.storage.saveOrder({
              order_id: order.id,
              title: order.title,
              description: order.description,
              creator_id: order.creatorId,
              contractor_id: order.contractorId,
              total_cost: order.totalAmount,
              escrow_balance: order.fundedAmount,
              status: order.status,
              milestones: (order.milestones || []).map((m, idx) => ({
                milestone_id: m.id || idx.toString(),
                description: m.description,
                amount: m.amount,
                status: m.status
              }))
            });
          });
        } catch (localError) {
          console.warn('Could not update local storage:', localError);
        }
      }
      
      // Render the orders
      this._renderUserOrders(userOrders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      const errorMsg = error.message || 'Error loading your orders. Please try again later.';
      window.showNotification(errorMsg, 'error');
    } finally {
      window.escrowAPI.uiUtils.hideLoading();
    }
  }
  
  /**
   * Render user's orders
   */
  _renderUserOrders(userOrders) {
    // Render created orders
    const createdOrdersContainer = document.getElementById('user-created-orders');
    if (createdOrdersContainer) {
      createdOrdersContainer.innerHTML = '';
      
      if (userOrders.orders_created.length > 0) {
        userOrders.orders_created.forEach(order => {
          createdOrdersContainer.appendChild(this._createOrderElement(order, true));
        });
      } else {
        createdOrdersContainer.innerHTML = '<p class="empty-message">You haven\'t created any orders yet.</p>';
      }
    }
    
    // Render joined orders
    const joinedOrdersContainer = document.getElementById('user-joined-orders');
    if (joinedOrdersContainer) {
      joinedOrdersContainer.innerHTML = '';
      
      if (userOrders.orders_joined.length > 0) {
        userOrders.orders_joined.forEach(order => {
          const orderEl = this._createOrderElement(order, false, order.contribution_amount);
          joinedOrdersContainer.appendChild(orderEl);
        });
      } else {
        joinedOrdersContainer.innerHTML = '<p class="empty-message">You haven\'t joined any orders yet.</p>';
      }
    }
    
    // Render assigned orders (for contractors)
    const assignedOrdersContainer = document.getElementById('user-assigned-orders');
    if (assignedOrdersContainer) {
      assignedOrdersContainer.innerHTML = '';
      
      if (userOrders.orders_assigned.length > 0) {
        userOrders.orders_assigned.forEach(order => {
          assignedOrdersContainer.appendChild(this._createOrderElement(order, false, 0, true));
        });
      } else {
        assignedOrdersContainer.innerHTML = '<p class="empty-message">You don\'t have any assigned orders.</p>';
      }
    }
  }
  
  /**
   * Create an order element for display
   */
  _createOrderElement(order, isCreated = false, contributionAmount = 0, isAssigned = false) {
    const orderEl = document.createElement('div');
    orderEl.className = 'order-item';
    orderEl.dataset.orderId = order.order_id;
    
    // Set status-based classes
    orderEl.classList.add(`order-status-${order.status.toLowerCase()}`);
    
    // Get contractor info
    const contractors = this.escrowApp.getAllUsers(UserType.CONTRACTOR);
    const contractor = contractors.find(c => c.user_id === order.contractor_id);
    
    // Get customer (creator) info
    const customers = this.escrowApp.getAllUsers(UserType.CUSTOMER);
    const creator = customers.find(c => c.user_id === order.creator_id);
    
    // Get representative info
    const representative = customers.find(c => c.user_id === order.representative_id);
    
    // Create HTML content
    let milestonesSummary = '';
    const milestoneCount = Object.keys(order.milestones).length;
    const completedCount = Object.values(order.milestones).filter(
      m => m.status === MilestoneStatus.PAID
    ).length;
    
    milestonesSummary = `<span class="milestone-progress">${completedCount}/${milestoneCount} milestones completed</span>`;
    
    orderEl.innerHTML = `
      <div class="order-header">
        <h3 class="order-title">${this._escapeHtml(order.title || 'Untitled Order')}</h3>
        <span class="order-status">${order.status}</span>
      </div>
      <div class="order-meta">
        <span class="order-contractor">Contractor: ${this._escapeHtml(contractor?.name || 'Unknown')}</span>
        <span class="order-creator">Creator: ${this._escapeHtml(creator?.name || 'Unknown')}</span>
        <span class="order-representative">Representative: ${this._escapeHtml(representative?.name || 'Unknown')}</span>
        <span class="order-cost">Total Cost: $${order.total_cost.toFixed(2)}</span>
        <span class="order-escrow">Escrow Balance: $${order.escrow_balance.toFixed(2)}</span>
        <span class="order-funding">Funding: ${(order.escrow_balance / order.total_cost * 100).toFixed(1)}%</span>
        ${milestonesSummary}
        ${contributionAmount > 0 ? `<span class="user-contribution">Your contribution: $${parseFloat(contributionAmount).toFixed(2)}</span>` : ''}
      </div>
      <div class="order-actions">
        <button class="btn btn-primary view-order-btn" data-order-id="${order.order_id}">View Details</button>
        ${this._getActionButtonsForOrder(order, isCreated, isAssigned)}
      </div>
    `;
    
    // Add click event for view details button
    const viewBtn = orderEl.querySelector('.view-order-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        this._showOrderDetails(order.order_id);
      });
    }
    
    return orderEl;
  }
  
  /**
   * Get action buttons based on order status and user role
   */
  _getActionButtonsForOrder(order, isCreated, isAssigned) {
    const buttonHtml = [];
    
    // In a pending order, show participate button
    if (order.status === OrderStatus.PENDING) {
      buttonHtml.push(`<button class="btn btn-secondary participate-btn" data-order-id="${order.order_id}">Participate</button>`);
    }
    
    // If assigned to current user and order is funded/in progress
    if (isAssigned && [OrderStatus.FUNDED, OrderStatus.IN_PROGRESS].includes(order.status)) {
      buttonHtml.push(`<button class="btn btn-success view-milestones-btn" data-order-id="${order.order_id}">View Milestones</button>`);
    }
    
    // If creator or contributor, allow voting for rep
    if ((isCreated || order.contributions[this.currentUser?.uid] > 0) && 
        [OrderStatus.PENDING, OrderStatus.FUNDED, OrderStatus.IN_PROGRESS].includes(order.status)) {
      buttonHtml.push(`<button class="btn btn-info vote-rep-btn" data-order-id="${order.order_id}">Vote for Representative</button>`);
    }
    
    return buttonHtml.join('');
  }
  
  /**
   * Show order details modal
   */
  _showOrderDetails(orderId) {
    const order = this.escrowApp.orders[orderId];
    if (!order) return;
    
    // Get order details
    const orderDetails = this.escrowApp.viewOrderDetails(orderId);
    
    // Display in modal
    const modalTitle = document.querySelector('#order-detail-modal .modal-title');
    const modalContent = document.querySelector('#order-detail-modal .modal-content');
    
    if (modalTitle && modalContent) {
      modalTitle.textContent = order.title || 'Order Details';
      
      // Get user info
      const contractors = this.escrowApp.getAllUsers(UserType.CONTRACTOR);
      const customers = this.escrowApp.getAllUsers(UserType.CUSTOMER);
      const contractor = contractors.find(c => c.user_id === order.contractor_id);
      const creator = customers.find(c => c.user_id === order.creator_id);
      const representative = customers.find(c => c.user_id === order.representative_id);
      
      // Create html content
      let contributorsHtml = '';
      for (const [userId, amount] of Object.entries(order.contributions)) {
        const contributor = customers.find(c => c.user_id === userId);
        contributorsHtml += `<div class="contributor-item">
          <span class="contributor-name">${this._escapeHtml(contributor?.name || 'Unknown')}</span>
          <span class="contributor-amount">$${parseFloat(amount).toFixed(2)}</span>
        </div>`;
      }
      
      // Create milestones HTML
      let milestonesHtml = '';
      for (const milestone of orderDetails.milestones) {
        const canMark = order.contractor_id === this._getCurrentEscrowUserId() && 
                         milestone.status === MilestoneStatus.PENDING &&
                         [OrderStatus.FUNDED, OrderStatus.IN_PROGRESS].includes(order.status);
                         
        const canSign = milestone.status === MilestoneStatus.COMPLETED_BY_CONTRACTOR && 
                        milestone.act && 
                        (this._getCurrentEscrowUserId() === order.representative_id ||
                         this._getCurrentEscrowUserId() === order.contractor_id);
                         
        const actInfo = milestone.act ? `
          <div class="act-info">
            <div class="act-signatures">
              <strong>Signatures:</strong> ${milestone.act.signatures.length > 0 ? 
                milestone.act.signatures.join(', ') : 'None yet'}
            </div>
            <div class="act-status">
              <strong>Status:</strong> ${milestone.act.is_complete ? 'Complete' : 'Waiting for signatures'}
            </div>
            ${canSign ? `<button class="btn btn-sm btn-primary sign-act-btn" 
                          data-order-id="${order.order_id}" 
                          data-milestone-id="${milestone.milestone_id}">
                         Sign Act
                       </button>` : ''}
          </div>
        ` : '';
        
        milestonesHtml += `
          <div class="milestone-item milestone-status-${milestone.status.toLowerCase()}">
            <div class="milestone-header">
              <h4 class="milestone-title">${this._escapeHtml(milestone.description)}</h4>
              <span class="milestone-amount">$${milestone.amount.toFixed(2)}</span>
              <span class="milestone-status">${milestone.status}</span>
            </div>
            ${actInfo}
            ${canMark ? `<button class="btn btn-sm btn-success mark-milestone-complete-btn" 
                           data-order-id="${order.order_id}" 
                           data-milestone-id="${milestone.milestone_id}">
                          Mark Complete
                        </button>` : ''}
          </div>
        `;
      }
      
      // Create voting info
      let votingHtml = '';
      if ([OrderStatus.PENDING, OrderStatus.FUNDED, OrderStatus.IN_PROGRESS].includes(order.status)) {
        votingHtml = `
          <div class="voting-section">
            <h4>Representative Voting</h4>
            <p>Current Representative: ${this._escapeHtml(representative?.name || 'Unknown')}</p>
            <button class="btn btn-primary vote-rep-btn" data-order-id="${order.order_id}">
              Vote for Representative
            </button>
          </div>
        `;
      }
      
      modalContent.innerHTML = `
        <div class="order-details">
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${order.status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contractor:</span>
              <span class="info-value">${this._escapeHtml(contractor?.name || 'Unknown')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Creator:</span>
              <span class="info-value">${this._escapeHtml(creator?.name || 'Unknown')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Representative:</span>
              <span class="info-value">${this._escapeHtml(representative?.name || 'Unknown')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Cost:</span>
              <span class="info-value">$${order.total_cost.toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Escrow Balance:</span>
              <span class="info-value">$${order.escrow_balance.toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Funding:</span>
              <span class="info-value">${(order.escrow_balance / order.total_cost * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <div class="contributors-section">
            <h4>Contributors</h4>
            <div class="contributors-list">
              ${contributorsHtml || '<p>No contributors yet</p>'}
            </div>
          </div>
          
          <div class="milestones-section">
            <h4>Milestones</h4>
            <div class="milestones-list">
              ${milestonesHtml || '<p>No milestones defined</p>'}
            </div>
          </div>
          
          ${votingHtml}
        </div>
      `;
      
      // Show the modal
      window.showModal('order-detail-modal');
    }
  }
  
  /**
   * Show voting modal
   */
  _showVoteRepModal(orderId) {
    const order = this.escrowApp.orders[orderId];
    if (!order) return;
    
    // Check if current user is a contributor
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId || !order.contributions[currentUserId]) {
      window.showNotification('You must be a contributor to vote', 'error');
      return;
    }
    
    // Create the modal content
    const modalEl = document.getElementById('vote-representative-modal');
    if (!modalEl) return;
    
    const modalTitle = modalEl.querySelector('.modal-title');
    const modalContent = modalEl.querySelector('.modal-content');
    
    if (modalTitle && modalContent) {
      modalTitle.textContent = 'Vote for Representative';
      
      // Get all contributors
      const customers = this.escrowApp.getAllUsers(UserType.CUSTOMER);
      let contributorsOptions = '';
      
      for (const [userId, amount] of Object.entries(order.contributions)) {
        if (userId === currentUserId) continue; // Skip self
        
        const contributor = customers.find(c => c.user_id === userId);
        if (contributor) {
          contributorsOptions += `<option value="${userId}">${this._escapeHtml(contributor.name)} ($${parseFloat(amount).toFixed(2)})</option>`;
        }
      }
      
      // Create form
      modalContent.innerHTML = `
        <form id="vote-representative-form">
          <input type="hidden" name="order_id" value="${order.order_id}">
          
          <div class="form-group">
            <label for="candidate_id">Choose Representative:</label>
            <select name="candidate_id" id="candidate_id" class="form-control" required>
              <option value="">-- Select a candidate --</option>
              ${contributorsOptions}
            </select>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Submit Vote</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal('vote-representative-modal')">Cancel</button>
          </div>
        </form>
      `;
      
      // Set up form submission
      const form = modalContent.querySelector('#vote-representative-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this._handleVoteSubmission(form);
        });
      }
      
      // Show the modal
      window.showModal('vote-representative-modal');
    }
  }
  
  /**
   * Handle vote submission
   */
  _handleVoteSubmission(form) {
    const orderId = form.querySelector('[name="order_id"]').value;
    const candidateId = form.querySelector('[name="candidate_id"]').value;
    
    if (!orderId || !candidateId) {
      window.showNotification('Please select a candidate', 'error');
      return;
    }
    
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification('User not found in escrow system', 'error');
      return;
    }
    
    // Submit the vote
    const result = this.escrowApp.voteForRepresentative(currentUserId, orderId, candidateId);
    
    if (result) {
      window.showNotification('Vote submitted successfully', 'success');
      window.closeModal('vote-representative-modal');
      
      // Refresh the UI
      this._loadUserOrders();
    } else {
      window.showNotification('Error submitting vote. Check console for details.', 'error');
    }
  }
  
  /**
   * Handle marking a milestone as complete
   * Modified to use Escrow API integration
   */
  async _handleMarkMilestoneComplete(orderId, milestoneId) {
    // Show loading indicator
    window.escrowAPI.uiUtils.showLoading();
    
    try {
      // Use the Escrow API client to complete the milestone
      const result = await window.escrowAPI.milestoneService.completeMilestone(orderId, milestoneId);
      
      if (result.success) {
        // Also update local storage for backward compatibility
        if (this.escrowApp) {
          const currentUserId = this._getCurrentEscrowUserId();
          if (currentUserId) {
            try {
              this.escrowApp.markMilestoneComplete(currentUserId, orderId, milestoneId);
            } catch (localError) {
              console.warn('Could not update local model:', localError);
            }
          }
        }
        
        window.showNotification('Milestone marked as complete', 'success');
        
        // Refresh the order details
        this._showOrderDetails(orderId);
        this._loadUserOrders();
      } else {
        throw new Error(result.message || 'Error completing milestone');
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
      window.showNotification(error.message || 'Error marking milestone as complete. Check console for details.', 'error');
    } finally {
      window.escrowAPI.uiUtils.hideLoading();
    }
  }
  
  /**
   * Handle signing an act
   * Modified to use Escrow API integration
   */
  async _handleSignAct(orderId, milestoneId) {
    // Show loading indicator
    window.escrowAPI.uiUtils.showLoading();
    
    try {
      // Use the Escrow API client to sign the act
      const result = await window.escrowAPI.milestoneService.signAct(orderId, milestoneId);
      
      if (result.success) {
        // Also update local storage for backward compatibility
        if (this.escrowApp) {
          const currentUserId = this._getCurrentEscrowUserId();
          if (currentUserId) {
            try {
              this.escrowApp.signAct(currentUserId, orderId, milestoneId);
            } catch (localError) {
              console.warn('Could not update local model:', localError);
            }
          }
        }
        
        window.showNotification('Act signed successfully', 'success');
        
        // Refresh the order details
        this._showOrderDetails(orderId);
        this._loadUserOrders();
        
        // Update balance display
        this._updateEscrowBalance();
      } else {
        throw new Error(result.message || 'Error signing act');
      }
    } catch (error) {
      console.error('Error signing act:', error);
      window.showNotification(error.message || 'Error signing act. Check console for details.', 'error');
    } finally {
      window.escrowAPI.uiUtils.hideLoading();
    }
  }
  
  /**
   * Add milestone field to order creation form
   */
  _addMilestoneField(milestonesContainer) {
    if (!milestonesContainer) return;
    
    const milestoneCount = milestonesContainer.querySelectorAll('.milestone-field').length;
    
    if (milestoneCount >= 10) {
      window.showNotification(this._getCurrentLanguageMessage('order.max_milestones'), 'warning');
      return;
    }
    
    const milestoneEntry = document.createElement('div');
    milestoneEntry.className = 'milestone-entry milestone-field';
    milestoneEntry.innerHTML = `
      <div class="form-row">
        <div class="form-group col-md-8">
          <input type="text" class="form-control" name="milestone_desc[]" placeholder="${this._getCurrentLanguageMessage('order.milestone_description')} ${milestoneCount + 1}" required>
        </div>
        <div class="form-group col-md-3">
          <input type="number" class="form-control" name="milestone_amount[]" placeholder="${this._getCurrentLanguageMessage('order.amount')}" min="1" step="0.01" required>
        </div>
        <div class="form-group col-md-1">
          <button type="button" class="btn btn-danger remove-milestone-btn">×</button>
        </div>
      </div>
    `;
    
    // Add remove button functionality
    const removeBtn = milestoneEntry.querySelector('.remove-milestone-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        milestoneEntry.remove();
      });
    }
    
    milestonesContainer.appendChild(milestoneEntry);
  }
  
  /**
   * Handle order creation
   * Modified to use Escrow API integration
   */
  async _handleOrderCreation(form) {
    // Show loading indicator
    window.escrowAPI.uiUtils.showLoading();
    
    const title = form.querySelector('[name="title"]').value;
    const description = form.querySelector('[name="description"]').value;
    const contractorId = form.querySelector('[name="contractor_id"]').value;
    const category = form.querySelector('[name="category"]').value;
    
    const milestoneDescs = Array.from(form.querySelectorAll('[name="milestone_desc[]"]')).map(el => el.value);
    const milestoneAmounts = Array.from(form.querySelectorAll('[name="milestone_amount[]"]')).map(el => parseFloat(el.value));
    
    if (milestoneDescs.length === 0 || milestoneAmounts.length === 0) {
      window.escrowAPI.uiUtils.hideLoading();
      window.showNotification(this._getCurrentLanguageMessage('order.add_milestone'), 'error');
      return;
    }
    
    if (milestoneDescs.length !== milestoneAmounts.length) {
      window.escrowAPI.uiUtils.hideLoading();
      window.showNotification(this._getCurrentLanguageMessage('order.invalid_milestone_data'), 'error');
      return;
    }
    
    // Validate milestone amounts
    for (let i = 0; i < milestoneAmounts.length; i++) {
      if (isNaN(milestoneAmounts[i]) || milestoneAmounts[i] <= 0) {
        window.escrowAPI.uiUtils.hideLoading();
        window.showNotification(this._getCurrentLanguageMessage('order.enter_valid_amount'), 'error');
        return;
      }
    }
    
    // Build milestone data for API
    const milestones = milestoneDescs.map((description, i) => ({
      description,
      amount: milestoneAmounts[i]
    }));
    
    try {
      // Create order object for API
      const orderData = {
        title,
        description,
        category: category || 'other',
        contractorId: contractorId || null,
        milestones
      };
      
      // Use the Escrow API client to create the order
      const result = await window.escrowAPI.orderService.createOrder(orderData);
      
      if (result.success) {
        // Also store in local storage for backward compatibility
        if (this.escrowApp && this.escrowApp.storage) {
          const localOrder = {
            order_id: result.data.id,
            title,
            description,
            creator_id: this._getCurrentEscrowUserId(),
            contractor_id: contractorId,
            total_cost: milestoneAmounts.reduce((sum, amount) => sum + amount, 0),
            escrow_balance: 0,
            milestones: milestones.map((m, idx) => ({
              milestone_id: idx.toString(),
              description: m.description,
              amount: m.amount,
              status: 'PENDING'
            }))
          };
          
          this.escrowApp.storage.saveOrder(localOrder);
        }
        
        // Display success notification
        window.showNotification(this._getCurrentLanguageMessage('escrow.order_created'), 'success');
        
        // Clear the form
        form.reset();
        const milestonesContainer = document.getElementById('create-order-milestones-container') || 
                                   document.getElementById('modal-milestones-container');
        if (milestonesContainer) {
          milestonesContainer.innerHTML = '';
        }
        
        // Add one empty milestone field
        this._addMilestoneField(document.getElementById('create-order-milestones-container') || 
                                document.getElementById('modal-milestones-container'));
        
        // Refresh the orders list
        this._loadUserOrders();
      } else {
        throw new Error(result.message || 'Error creating order');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      window.showNotification(error.message || this._getCurrentLanguageMessage('escrow.error_creating'), 'error');
    } finally {
      window.escrowAPI.uiUtils.hideLoading();
    }
  }
  
  /**
   * Handle participating in an order
   * Modified to use Escrow API integration
   */
  async _handleOrderParticipation(form) {
    // Show loading indicator
    window.escrowAPI.uiUtils.showLoading();
    
    const orderId = form.querySelector('[name="order_id"]').value;
    const amount = parseFloat(form.querySelector('[name="contribution_amount"]').value);
    
    if (!orderId || isNaN(amount) || amount <= 0) {
      window.escrowAPI.uiUtils.hideLoading();
      window.showNotification(this._getCurrentLanguageMessage('order.enter_valid_amount'), 'error');
      return;
    }
    
    try {
      // Use the Escrow API client to fund the order
      const fundData = {
        amount: amount
      };
      
      const result = await window.escrowAPI.orderService.fundOrder(orderId, fundData);
      
      if (result.success) {
        // Also update local storage for backward compatibility
        if (this.escrowApp) {
          const currentUserId = this._getCurrentEscrowUserId();
          if (currentUserId) {
            // Try to update local model
            try {
              this.escrowApp.joinOrder(currentUserId, orderId, amount);
            } catch (localError) {
              console.warn('Could not update local model:', localError);
            }
          }
        }
        
        window.showNotification(this._getCurrentLanguageMessage('order.joined_success'), 'success');
        
        // Clear the form
        form.reset();
        
        // Close modal if any
        if (window.closeModal) {
          window.closeModal('participate-modal');
        }
        
        // Refresh the UI
        this._updateEscrowBalance();
        this._loadUserOrders();
      } else {
        throw new Error(result.message || 'Error funding order');
      }
    } catch (error) {
      console.error('Error funding order:', error);
      window.showNotification(error.message || this._getCurrentLanguageMessage('order.join_error'), 'error');
    } finally {
      window.escrowAPI.uiUtils.hideLoading();
    }
  }
  
  /**
   * Get current escrow user ID
   */
  _getCurrentEscrowUserId() {
    if (!this.currentUser) return null;
    
    // Find the user in escrow system
    const escrowUsers = this.escrowApp.getAllUsers();
    const escrowUser = escrowUsers.find(eu => eu.name === this.currentUser.email || eu.user_id === this.currentUser.uid);
    
    return escrowUser ? escrowUser.user_id : null;
  }
  
  /**
   * Helper to escape HTML
   */
  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  /**
   * Handle deposit to escrow
   */
  _handleDeposit(form) {
    const amount = parseFloat(form.querySelector('[name="deposit_amount"]').value);
    
    if (isNaN(amount) || amount <= 0) {
      window.showNotification(this._getCurrentLanguageMessage('order.enter_valid_amount'), 'error');
      return;
    }
    
    // Get current user ID
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification(this._getCurrentLanguageMessage('escrow.user_not_found'), 'error');
      return;
    }
    
    // Deposit funds
    const result = this.escrowApp.customerDeposit(currentUserId, amount);
    
    if (result) {
      window.showNotification(
        this._getCurrentLanguageMessage('wallet.deposit_success').replace('{amount}', amount.toFixed(2)),
        'success'
      );
      
      // Clear the form
      form.reset();
      
      // Close modal if any
      if (window.closeModal) {
        window.closeModal('deposit-funds-modal');
      }
      
      // Update balance displays
      this._updateEscrowBalance();
    } else {
      window.showNotification(this._getCurrentLanguageMessage('wallet.deposit_error'), 'error');
    }
  }

  /**
   * Populate the contractors dropdown in the order form
   */
  _populateContractorsDropdown() {
    // Получаем все выпадающие списки контракторов
    const contractorDropdowns = [
      document.getElementById('create-order-contractor'),
      document.getElementById('modal-contractor-id')
    ].filter(Boolean); // Фильтруем на случай, если какого-то элемента нет
    
    if (!contractorDropdowns.length) return;
    
    // Get all contractors from escrow app
    const contractors = this.escrowApp.getAllUsers(UserType.CONTRACTOR);
    
    // Для каждого выпадающего списка
    for (const dropdown of contractorDropdowns) {
      // Сохраняем первый option (placeholder)
      const placeholderOption = dropdown.querySelector('option');
      
      // Очищаем dropdown
      dropdown.innerHTML = '';
      
      // Возвращаем placeholder option
      if (placeholderOption) {
        dropdown.appendChild(placeholderOption);
      }
      
      // Добавляем contractors
      contractors.forEach(contractor => {
        const option = document.createElement('option');
        option.value = contractor.user_id;
        option.textContent = contractor.name;
        dropdown.appendChild(option);
      });
    }
  }
}

// Create and export a singleton instance
const escrowUI = new EscrowUI();
export default escrowUI; 