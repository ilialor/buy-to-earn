/**
 * Escrow API Integration
 * Main entry point for all Escrow API-related functionality
 */

// Import and re-export all services
import { escrowApi } from './escrow-api.js';
import * as userService from './user-service.js';
import * as orderService from './order-service.js';
import * as milestoneService from './milestone-service.js';
import * as uiUtils from './ui-utils.js';
import StorageSync from './storage-sync.js';
import paymentWrapper from './payment-wrapper.js';

// Initialize the API integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we should synchronize current user
  if (window.currentUser) {
    userService.registerUserWithEscrow(window.currentUser)
      .then(escrowUser => {
        console.log('Escrow user synchronized:', escrowUser.id);
      })
      .catch(error => {
        console.error('Failed to synchronize user with Escrow API:', error);
      });
  }
  
  console.log('Escrow API integration initialized');
});

// Export all components
export { 
  escrowApi,
  userService,
  orderService, 
  milestoneService,
  uiUtils,
  StorageSync,
  paymentWrapper
};
