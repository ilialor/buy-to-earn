/**
 * Escrow UI Module
 * UI integration for escrow functionality
 */

import EscrowApplication from './application.js';
import { PLATFORM_SIGNATURE_ID, UserType, OrderStatus, MilestoneStatus } from './constants.js';

class EscrowUI {
  constructor() {
    // Initialize Escrow Application
    this.escrowApp = new EscrowApplication();
    this.currentUser = null;
    
    console.log('Escrow UI initialized');
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
    
    // Show initialization notification
    showNotification('Эскроу-функциональность загружена', 'info');
  }
  
  /**
   * Set up event listeners for forms and buttons
   */
  _setupEventListeners() {
    // Add milestone button in order creation form
    const addMilestoneBtn = document.getElementById('add-milestone-btn');
    if (addMilestoneBtn) {
      addMilestoneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this._addMilestoneField();
      });
    }
    
    // Order creation form
    const orderForm = document.getElementById('create-order-form');
    if (orderForm) {
      orderForm.addEventListener('submit', (e) => {
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
  }
  
  /**
   * Handle user authentication change
   */
  _handleUserChange() {
    // Get current user from auth
    const user = getCurrentUser(); // This function should be defined elsewhere in your app
    
    if (user) {
      this.currentUser = user;
      
      // Check if we need to create an escrow user for this user
      this._ensureEscrowUser(user);
      
      // Update UI for authenticated state
      this._updateAuthenticatedUI();
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
    this._updateBalanceDisplay();
    
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
   * Update balance display
   */
  _updateBalanceDisplay() {
    if (!this.currentUser) return;
    
    // Find the user in escrow system
    const escrowUsers = this.escrowApp.getAllUsers();
    const escrowUser = escrowUsers.find(eu => eu.name === this.currentUser.email || eu.user_id === this.currentUser.uid);
    
    if (escrowUser) {
      // Update balance display
      const balanceEl = document.getElementById('user-balance');
      if (balanceEl) {
        balanceEl.textContent = `${escrowUser.balance.toFixed(2)} USD`;
      }
    }
  }
  
  /**
   * Load user's orders
   */
  _loadUserOrders() {
    if (!this.currentUser) return;
    
    // Find the user in escrow system
    const escrowUsers = this.escrowApp.getAllUsers();
    const escrowUser = escrowUsers.find(eu => eu.name === this.currentUser.email || eu.user_id === this.currentUser.uid);
    
    if (escrowUser) {
      // Get user's orders
      const userOrders = this.escrowApp.viewUserOrders(escrowUser.user_id);
      
      if (userOrders) {
        // Render the orders
        this._renderUserOrders(userOrders);
      }
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
   */
  _handleMarkMilestoneComplete(orderId, milestoneId) {
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification('User not found in escrow system', 'error');
      return;
    }
    
    // Mark the milestone as complete
    const result = this.escrowApp.markMilestoneComplete(currentUserId, orderId, milestoneId);
    
    if (result) {
      window.showNotification('Milestone marked as complete', 'success');
      
      // Refresh the order details
      this._showOrderDetails(orderId);
      this._loadUserOrders();
    } else {
      window.showNotification('Error marking milestone as complete. Check console for details.', 'error');
    }
  }
  
  /**
   * Handle signing an act
   */
  _handleSignAct(orderId, milestoneId) {
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification('User not found in escrow system', 'error');
      return;
    }
    
    // Sign the act
    const result = this.escrowApp.signAct(currentUserId, orderId, milestoneId);
    
    if (result) {
      window.showNotification('Act signed successfully', 'success');
      
      // Refresh the order details
      this._showOrderDetails(orderId);
      this._loadUserOrders();
      
      // Update balance display
      this._updateBalanceDisplay();
    } else {
      window.showNotification('Error signing act. Check console for details.', 'error');
    }
  }
  
  /**
   * Add milestone field to order creation form
   */
  _addMilestoneField() {
    const milestonesContainer = document.getElementById('milestones-container');
    const milestoneCount = milestonesContainer.querySelectorAll('.milestone-field').length;
    
    if (milestoneCount >= 10) {
      showNotification('Максимальное количество этапов - 10', 'warning');
      return;
    }
    
    const milestoneEntry = document.createElement('div');
    milestoneEntry.className = 'milestone-entry';
    milestoneEntry.innerHTML = `
      <div class="form-row">
        <div class="form-group col-md-8">
          <input type="text" class="form-control" name="milestone_desc[]" placeholder="Milestone ${milestoneCount + 1} Description" required>
        </div>
        <div class="form-group col-md-3">
          <input type="number" class="form-control" name="milestone_amount[]" placeholder="Amount" min="1" step="0.01" required>
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
   */
  _handleOrderCreation(form) {
    const title = form.querySelector('[name="title"]').value;
    const description = form.querySelector('[name="description"]').value;
    const contractorId = form.querySelector('[name="contractor_id"]').value;
    
    const milestoneDescs = Array.from(form.querySelectorAll('[name="milestone_desc[]"]')).map(el => el.value);
    const milestoneAmounts = Array.from(form.querySelectorAll('[name="milestone_amount[]"]')).map(el => parseFloat(el.value));
    
    if (milestoneDescs.length === 0 || milestoneAmounts.length === 0) {
      window.showNotification('Please add at least one milestone', 'error');
      return;
    }
    
    if (milestoneDescs.length !== milestoneAmounts.length) {
      window.showNotification('Milestone data is invalid', 'error');
      return;
    }
    
    // Build milestone data array
    const milestonesData = milestoneDescs.map((desc, i) => [desc, milestoneAmounts[i]]);
    
    // Get current user ID
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification('User not found in escrow system', 'error');
      return;
    }
    
    // Create the order - передаем contractorId даже если это пустая строка
    const order = this.escrowApp.createOrder(currentUserId, contractorId, milestonesData);
    
    if (order) {
      // Add title and description to the order (these aren't part of the escrow logic but useful for UI)
      order.title = title;
      order.description = description;
      this.escrowApp.storage.saveOrder(order.toJSON());
      
      window.showNotification('Order created successfully', 'success');
      
      // Clear the form
      form.reset();
      document.getElementById('milestones-container').innerHTML = '';
      
      // Add one empty milestone field
      this._addMilestoneField();
      
      // Close modal if any
      if (window.closeModal) {
        window.closeModal('create-order-modal');
      }
      
      // Refresh the orders list
      this._loadUserOrders();
    } else {
      window.showNotification('Error creating order. Check console for details.', 'error');
    }
  }
  
  /**
   * Handle participating in an order
   */
  _handleOrderParticipation(form) {
    const orderId = form.querySelector('[name="order_id"]').value;
    const amount = parseFloat(form.querySelector('[name="contribution_amount"]').value);
    
    if (!orderId || isNaN(amount) || amount <= 0) {
      window.showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    // Get current user ID
    const currentUserId = this._getCurrentEscrowUserId();
    if (!currentUserId) {
      window.showNotification('User not found in escrow system', 'error');
      return;
    }
    
    // Join the order
    const result = this.escrowApp.joinOrder(currentUserId, orderId, amount);
    
    if (result) {
      window.showNotification('Successfully joined the order', 'success');
      
      // Clear the form
      form.reset();
      
      // Close modal if any
      if (window.closeModal) {
        window.closeModal('participate-modal');
      }
      
      // Refresh the UI
      this._updateBalanceDisplay();
      this._loadUserOrders();
    } else {
      window.showNotification('Error joining order. Check console for details.', 'error');
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
}

// Create and export a singleton instance
const escrowUI = new EscrowUI();
export default escrowUI; 