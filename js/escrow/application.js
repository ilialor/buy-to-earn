/**
 * Escrow Application
 * Main orchestrator for escrow functionality
 */

import { PLATFORM_SIGNATURE_ID, UserType, OrderStatus, MilestoneStatus } from './constants.js';
import { User, Customer, Contractor, Milestone, Act, Order } from './models.js';
import EscrowLocalStorage from './local-storage.js';

/**
 * Main application class for Escrow functionality
 */
class EscrowApplication {
  constructor(storage) {
    // Use provided storage or create new local storage
    this.storage = storage || new EscrowLocalStorage();
    this.users = {}; // Cache of user objects
    this.orders = {}; // Cache of order objects
    
    console.log('Escrow Application Initialized.');
    
    // Initialize cache from storage
    this._initializeCache();
  }
  
  /**
   * Initialize cache from storage
   */
  _initializeCache() {
    // Load users
    const usersData = this.storage.getAllUsers();
    for (const userData of usersData) {
      // Recreate the right user type from JSON data
      if (userData.user_type === UserType.CUSTOMER) {
        const customer = new Customer(userData.name);
        Object.assign(customer, userData);
        this.users[customer.user_id] = customer;
      } else if (userData.user_type === UserType.CONTRACTOR) {
        const contractor = new Contractor(userData.name);
        Object.assign(contractor, userData);
        this.users[contractor.user_id] = contractor;
      }
    }
    
    // Load orders (in two passes to ensure all references are set correctly)
    const ordersData = this.storage.getAllOrders();
    
    // First pass: create basic order objects
    for (const orderData of ordersData) {
      try {
        // Create basic order without milestones
        const order = new Order(
          orderData.creator_id,
          orderData.contractor_id,
          [] // Empty milestones array for now
        );
        
        // Override with stored data
        Object.assign(order, orderData);
        
        // Set empty milestones object to avoid inheritance issues
        order.milestones = {};
        
        this.orders[order.order_id] = order;
      } catch (error) {
        console.error(`Error recreating order ${orderData.order_id}:`, error);
      }
    }
    
    // Second pass: reconstruct milestones and acts
    for (const orderData of ordersData) {
      const order = this.orders[orderData.order_id];
      if (!order) continue;
      
      // Reconstruct milestones
      for (const [milestoneId, milestoneData] of Object.entries(orderData.milestones || {})) {
        try {
          // Create milestone
          const milestone = new Milestone(milestoneData.description, milestoneData.amount);
          milestone.milestone_id = milestoneData.milestone_id;
          milestone.status = milestoneData.status;
          
          // Create act if it exists
          if (milestoneData.act) {
            const act = new Act(milestone.milestone_id, order.order_id);
            act.act_id = milestoneData.act.act_id;
            act.is_complete = milestoneData.act.is_complete;
            
            // Add signatures
            if (Array.isArray(milestoneData.act.signatures)) {
              for (const signature of milestoneData.act.signatures) {
                act.signatures.add(signature);
              }
            }
            
            milestone.act = act;
          }
          
          order.milestones[milestone.milestone_id] = milestone;
        } catch (error) {
          console.error(`Error recreating milestone ${milestoneId} for order ${orderData.order_id}:`, error);
        }
      }
    }
    
    console.log(`Initialized cache with ${Object.keys(this.users).length} users and ${Object.keys(this.orders).length} orders`);
  }
  
  /**
   * Save changes to storage
   */
  _saveChanges() {
    // Save all users and orders to storage
    for (const user of Object.values(this.users)) {
      this.storage.saveUser(user.toJSON());
    }
    
    for (const order of Object.values(this.orders)) {
      this.storage.saveOrder(order.toJSON());
    }
  }
  
  /**
   * Get user by ID
   */
  _getUser(userId) {
    const user = this.users[userId];
    if (!user) {
      console.log(`Error: User with ID ${userId} not found.`);
    }
    return user;
  }
  
  /**
   * Get order by ID
   */
  _getOrder(orderId) {
    const order = this.orders[orderId];
    if (!order) {
      console.log(`Error: Order with ID ${orderId} not found.`);
    }
    return order;
  }
  
  /**
   * Create a new customer
   */
  createCustomer(name) {
    const customer = new Customer(name);
    this.users[customer.user_id] = customer;
    this._saveChanges();
    return customer;
  }
  
  /**
   * Create a new contractor
   */
  createContractor(name) {
    const contractor = new Contractor(name);
    this.users[contractor.user_id] = contractor;
    this._saveChanges();
    return contractor;
  }
  
  /**
   * Add funds to customer's balance
   */
  customerDeposit(customerId, amount) {
    const customer = this._getUser(customerId);
    if (!customer || !(customer instanceof Customer)) {
      console.log(`Error: Customer ${customerId} not found or invalid type.`);
      return false;
    }
    
    const result = customer.deposit(amount);
    if (result) {
      this._saveChanges();
    }
    return result;
  }
  
  /**
   * Create a new order
   * milestonesData format: [[description, amount], ...]
   */
  createOrder(customerId, contractorId, milestonesData) {
    const customer = this._getUser(customerId);
    
    if (!customer || !(customer instanceof Customer)) {
      console.log(`Error: Creator Customer ${customerId} not found or invalid type.`);
      return null;
    }
    
    // Проверяем contractorId, делаем его опциональным
    if (contractorId) {
      const contractor = this._getUser(contractorId);
      
      if (!contractor || !(contractor instanceof Contractor)) {
        console.log(`Error: Contractor ${contractorId} not found or invalid type.`);
        return null;
      }
    }
    
    if (!milestonesData || !milestonesData.length) {
      console.log("Error: Cannot create order with no milestones.");
      return null;
    }
    
    try {
      const order = new Order(customerId, contractorId || '', milestonesData);
      this.orders[order.order_id] = order;
      
      // Update customer's references
      customer.orders_created[order.order_id] = order;
      
      // Update contractor's references only if contractor exists
      if (contractorId) {
        const contractor = this._getUser(contractorId);
        if (contractor) {
          contractor.assigned_orders.add(order.order_id);
        }
      }
      
      console.log(`Order ${order.order_id} successfully registered in the application.`);
      this._saveChanges();
      return order;
    } catch (error) {
      console.log(`Failed to create order: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Join an order by contributing funds
   */
  joinOrder(customerId, orderId, amount) {
    const customer = this._getUser(customerId);
    const order = this._getOrder(orderId);
    
    if (!customer || !(customer instanceof Customer)) {
      console.log(`Error: Customer ${customerId} not found or invalid type.`);
      return false;
    }
    
    if (!order) {
      console.log(`Error: Order ${orderId} not found.`);
      return false;
    }
    
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      console.log("Error: Contribution amount must be positive.");
      return false;
    }
    
    if (customer.balance < amount) {
      console.log(`Error: Customer ${customer.name} (${customerId}) has insufficient balance (${customer.balance.toFixed(2)}) to contribute ${amount.toFixed(2)}.`);
      return false;
    }
    
    // Check if order is in pending state BEFORE changing balance
    if (order.status !== OrderStatus.PENDING) {
      console.log(`Error: Order ${orderId} is not in PENDING status (Current: ${order.status}). Cannot add contribution.`);
      return false;
    }
    
    // Perform transaction: decrease customer balance, increase escrow
    const customerBalanceChanged = customer._changeBalance(-amount);
    
    if (customerBalanceChanged) {
      const contributionAdded = order.addContribution(customerId, amount);
      
      if (contributionAdded) {
        // Track joined orders for the customer
        customer.orders_joined[orderId] = (customer.orders_joined[orderId] || 0) + amount;
        console.log(`Customer ${customer.name} (${customerId}) successfully joined Order ${orderId}.`);
        this._saveChanges();
        return true;
      } else {
        // Rollback customer balance if contribution failed
        console.log(`Error: Failed to add contribution to order ${orderId} after balance change. Rolling back balance for ${customerId}.`);
        customer._changeBalance(amount); // Add back the amount
        return false;
      }
    } else {
      console.log(`Error: Could not decrease balance for Customer ${customerId}.`);
      return false;
    }
  }
  
  /**
   * Mark a milestone as complete by the contractor
   */
  markMilestoneComplete(contractorId, orderId, milestoneId) {
    const contractor = this._getUser(contractorId);
    const order = this._getOrder(orderId);
    
    if (!contractor || !(contractor instanceof Contractor)) {
      return null;
    }
    
    if (!order) {
      return null;
    }
    
    if (order.contractor_id !== contractorId) {
      console.log(`Error: Contractor ${contractor.name} (${contractorId}) is not assigned to Order ${orderId}.`);
      return null;
    }
    
    // Delegate to order object, which handles status checks
    const result = order.markMilestoneCompleteByContractor(milestoneId);
    if (result) {
      this._saveChanges();
    }
    return result;
  }
  
  /**
   * Sign an act to approve a milestone
   */
  signAct(signerId, orderId, milestoneId) {
    const order = this._getOrder(orderId);
    if (!order) {
      return false;
    }
    
    const milestone = order.getMilestone(milestoneId);
    if (!milestone) {
      console.log(`Error: Milestone ${milestoneId} not found in Order ${orderId}.`);
      return false;
    }
    
    if (!milestone.act) {
      console.log(`Error: Act for Milestone ${milestoneId} does not exist yet. Contractor must mark complete first.`);
      return false;
    }
    
    // Validate signer role
    const isPlatform = signerId === PLATFORM_SIGNATURE_ID;
    const isContractor = signerId === order.contractor_id;
    const isRepresentative = signerId === order.representative_id;
    
    let signerDesc = "Unknown";
    
    if (isPlatform) {
      signerDesc = "Platform";
    } else if (isContractor) {
      const contrUser = this._getUser(order.contractor_id);
      signerDesc = `Contractor (${contrUser ? contrUser.name : order.contractor_id})`;
    } else if (isRepresentative) {
      const repUser = this._getUser(order.representative_id);
      signerDesc = `Representative (${repUser ? repUser.name : order.representative_id})`;
    } else {
      const user = this._getUser(signerId);
      if (user && user instanceof Customer && signerId in order.contributions) {
        signerDesc = `Customer (${user.name}, not representative)`;
      } else if (user) {
        signerDesc = `User (${user.name}, wrong type or not involved)`;
      } else {
        signerDesc = `Invalid Signer ID (${signerId})`;
      }
    }
    
    if (!isPlatform && !isContractor && !isRepresentative) {
      console.log(`Error: Signer '${signerId}' (${signerDesc}) is not authorized to sign Act ${milestone.act.act_id} for Order ${orderId}. Requires: Platform, Contractor ${order.contractor_id}, or Representative ${order.representative_id}.`);
      return false;
    }
    
    console.log(`Attempting signature by '${signerDesc}' for Act ${milestone.act.act_id} (Milestone ${milestoneId})...`);
    
    // Check milestone status before signing
    if (milestone.status !== MilestoneStatus.COMPLETED_BY_CONTRACTOR) {
      if (milestone.status === MilestoneStatus.PAID) {
        console.log(`Warning: Attempting to sign act for milestone ${milestoneId} which is already PAID.`);
      } else if (milestone.status === MilestoneStatus.PENDING) {
        console.log(`Error: Cannot sign Act for milestone ${milestoneId} because it is still in PENDING status.`);
        return false;
      }
    }
    
    const signatureAdded = milestone.act.addSignature(signerId);
    
    if (signatureAdded) {
      // Act signature added. Check if it became complete and release funds
      // Check milestone status again inside this block to prevent race conditions
      if (milestone.act.is_complete && milestone.status === MilestoneStatus.COMPLETED_BY_CONTRACTOR) {
        console.log(`Act ${milestone.act.act_id} is now complete. Releasing funds...`);
        this._processPaymentForMilestone(order, milestone);
      }
      
      this._saveChanges();
      return true;
    } else {
      // Signature was not added
      return false;
    }
  }
  
  /**
   * Process payment for a completed milestone
   */
  _processPaymentForMilestone(order, milestone) {
    const [success, amountReleased] = order.releaseFundsForMilestone(milestone);
    
    if (success) {
      const contractor = this._getUser(order.contractor_id);
      
      if (contractor) {
        contractor._changeBalance(amountReleased);
        console.log(`Contractor ${contractor.user_id}'s balance updated by +${amountReleased.toFixed(2)}.`);
      } else {
        console.log(`CRITICAL ERROR: Contractor ${order.contractor_id} not found during fund release for Order ${order.order_id}, Milestone ${milestone.milestone_id}! Escrow reduced but contractor not paid.`);
      }
      
      this._saveChanges();
    } else {
      console.log(`Error during automated fund release for Act ${milestone.act.act_id} of Order ${order.order_id}.`);
    }
  }
  
  /**
   * Vote for a new representative of the order
   */
  voteForRepresentative(voterCustomerId, orderId, candidateCustomerId) {
    const voter = this._getUser(voterCustomerId);
    const candidate = this._getUser(candidateCustomerId);
    const order = this._getOrder(orderId);
    
    if (!voter || !(voter instanceof Customer)) {
      return false;
    }
    
    if (!candidate || !(candidate instanceof Customer)) {
      console.log(`Error: Candidate ${candidateCustomerId} not found or is not a Customer.`);
      return false;
    }
    
    if (!order) {
      return false;
    }
    
    // Delegate to order, which checks contributions and performs vote logic
    const result = order.addVote(voterCustomerId, candidateCustomerId);
    
    if (result) {
      this._saveChanges();
    }
    
    return result;
  }
  
  /**
   * View a user's balance
   */
  viewUserBalance(userId) {
    const user = this._getUser(userId);
    if (user) {
      return user.viewBalance();
    }
    return null;
  }
  
  /**
   * View order details
   */
  viewOrderDetails(orderId) {
    const order = this._getOrder(orderId);
    if (order) {
      const status = order.viewStatus();
      const milestones = order.viewMilestones();
      return { status, milestones };
    }
    return null;
  }
  
  /**
   * View orders associated with a user
   */
  viewUserOrders(userId) {
    const user = this._getUser(userId);
    if (!user) {
      return null;
    }
    
    console.log(`\n--- Orders associated with ${user.name} (${userId}) ---`);
    
    const result = {
      user: {
        name: user.name,
        user_id: user.user_id,
        user_type: user.user_type
      },
      orders_created: [],
      orders_joined: [],
      orders_assigned: []
    };
    
    if (user instanceof Customer) {
      console.log("Orders Created:");
      if (Object.keys(user.orders_created).length > 0) {
        for (const oid of Object.keys(user.orders_created)) {
          console.log(`  - ${oid}`);
          const order = this._getOrder(oid);
          if (order) {
            result.orders_created.push(order.toJSON());
          }
        }
      } else {
        console.log("  (None)");
      }
      
      console.log("Orders Joined (Contributions):");
      if (Object.keys(user.orders_joined).length > 0) {
        for (const [oid, amount] of Object.entries(user.orders_joined)) {
          console.log(`  - ${oid} (Contributed: ${parseFloat(amount).toFixed(2)})`);
          const order = this._getOrder(oid);
          if (order) {
            result.orders_joined.push({
              ...order.toJSON(),
              contribution_amount: amount
            });
          }
        }
      } else {
        console.log("  (None)");
      }
    } else if (user instanceof Contractor) {
      console.log("Orders Assigned:");
      if (user.assigned_orders.size > 0) {
        for (const oid of user.assigned_orders) {
          console.log(`  - ${oid}`);
          const order = this._getOrder(oid);
          if (order) {
            result.orders_assigned.push(order.toJSON());
          }
        }
      } else {
        console.log("  (None)");
      }
    }
    
    console.log("-".repeat(30));
    
    return result;
  }
  
  /**
   * Get all users of a specific type
   */
  getAllUsers(userType = null) {
    if (userType) {
      return Object.values(this.users).filter(user => user.user_type === userType);
    } else {
      return Object.values(this.users);
    }
  }
  
  /**
   * Get all orders 
   */
  getAllOrders() {
    return Object.values(this.orders);
  }
  
  /**
   * Get orders by status
   */
  getOrdersByStatus(status) {
    return Object.values(this.orders).filter(order => order.status === status);
  }
  
  /**
   * Clear all application data
   */
  clearAllData() {
    this.users = {};
    this.orders = {};
    this.storage.clearAllData();
  }
}

// Export the class
export default EscrowApplication; 