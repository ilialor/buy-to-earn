/**
 * Escrow Module Index
 * Entry point for escrow functionality
 */

import { 
  PLATFORM_SIGNATURE_ID, 
  UserType, 
  OrderStatus, 
  MilestoneStatus, 
  generateId 
} from './constants.js';
import { 
  User, 
  Customer, 
  Contractor, 
  Milestone, 
  Act, 
  Order 
} from './models.js';
import EscrowLocalStorage from './local-storage.js';
import EscrowApplication from './application.js';
import escrowUI from './ui.js';

// Initialize the escrow UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем наличие функции локализации, ждем если еще не загружена
  const checkLocalization = () => {
    if (typeof window.getCurrentLanguageMessage === 'function') {
      // Функция локализации загружена, можно инициализировать эскроу-интерфейс
      initializeEscrow();
    } else {
      // Ждем и пробуем еще раз
      console.log('Waiting for localization functions to load...');
      setTimeout(checkLocalization, 100);
    }
  };
  
  // Инициализация эскроу-интерфейса
  const initializeEscrow = () => {
    // Check if Escrow API is available
    if (window.escrowAPI) {
      console.log('Escrow API detected, using API integration');
      
      // Add event listener for when user auth changes
      document.addEventListener('userAuthenticated', async (event) => {
        const user = event.detail;
        if (user) {
          try {
            // Initialize API services with current user
            await window.escrowAPI.userService.registerUserWithEscrow(user);
            console.log('Escrow API user registered/retrieved');
          } catch (error) {
            console.error('Failed to register/retrieve Escrow API user:', error);
          }
        }
      });
    } else {
      console.warn('Escrow API not detected, falling back to local implementation');
    }
    
    // Initialize escrow UI
    escrowUI.init();
    
    // Create some test data if needed
    if (window.location.search.includes('test_escrow=1')) {
      createTestData();
    }
    
    console.log('Escrow module initialized');
  };
  
  // Начинаем проверку
  checkLocalization();
});

// Function to create test data
function createTestData() {
  const app = escrowUI.escrowApp;
  
  // Check if we already have test data
  if (app.getAllUsers().length > 0) {
    console.log('Test data already exists, skipping creation');
    return;
  }
  
  console.log('Creating test escrow data...');
  
  // Create users
  const alice = app.createCustomer('Alice');
  const bob = app.createCustomer('Bob');
  const charlie = app.createCustomer('Charlie');
  const dave = app.createContractor('Dave the Developer');
  
  // Add balance
  app.customerDeposit(alice.user_id, 1000);
  app.customerDeposit(bob.user_id, 800);
  app.customerDeposit(charlie.user_id, 500);
  
  // Create an order
  const order1 = app.createOrder(
    alice.user_id, 
    dave.user_id, 
    [
      ['Website Design', 200],
      ['Frontend Development', 300],
      ['Backend Development', 500]
    ]
  );
  
  // Add title and description for UI
  if (order1) {
    order1.title = "E-commerce Website";
    order1.description = "Create a modern e-commerce platform with product listings, shopping cart and payment integration.";
    app.storage.saveOrder(order1.toJSON());
    
    // Bob and Charlie join the order
    app.joinOrder(bob.user_id, order1.order_id, 400);
    app.joinOrder(charlie.user_id, order1.order_id, 600);
    
    // Mark first milestone complete
    const milestone1 = Object.values(order1.milestones)[0];
    if (milestone1) {
      app.markMilestoneComplete(dave.user_id, order1.order_id, milestone1.milestone_id);
      
      // Sign the act
      app.signAct(PLATFORM_SIGNATURE_ID, order1.order_id, milestone1.milestone_id);
      app.signAct(alice.user_id, order1.order_id, milestone1.milestone_id);
    }
  }
  
  // Create a second order
  const order2 = app.createOrder(
    bob.user_id,
    dave.user_id,
    [
      ['Mobile App Design', 150],
      ['Mobile App Development', 450]
    ]
  );
  
  // Add title and description
  if (order2) {
    order2.title = "Task Management App";
    order2.description = "Create a cross-platform mobile app for task management with notifications and team collaboration.";
    app.storage.saveOrder(order2.toJSON());
    
    // Alice joins the order
    app.joinOrder(alice.user_id, order2.order_id, 300);
  }
  
  console.log('Test data created successfully');
}

// Export escrow components
export {
  PLATFORM_SIGNATURE_ID,
  UserType,
  OrderStatus,
  MilestoneStatus,
  generateId,
  User,
  Customer,
  Contractor,
  Milestone,
  Act,
  Order,
  EscrowLocalStorage,
  EscrowApplication,
  escrowUI
}; 