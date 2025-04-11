/**
 * Payment System Wrapper
 * Provides integration between existing payment system and Escrow API
 */

import { escrowApi } from './escrow-api.js';
import * as uiUtils from './ui-utils.js';

/**
 * Initializes the payment integration
 */
export function initPaymentSystem() {
  // Listen for payment events from the existing system
  document.addEventListener('paymentProcessed', handlePaymentEvent);
  console.log('Payment wrapper initialized');
}

/**
 * Handle payment events from existing payment system
 * @param {CustomEvent} event - The payment event
 */
async function handlePaymentEvent(event) {
  if (!event || !event.detail) return;
  
  const { userId, amount, orderId, type } = event.detail;
  
  if (!userId || !amount) {
    console.error('Invalid payment event data');
    return;
  }
  
  uiUtils.showLoading();
  
  try {
    // Handle different payment types
    switch (type) {
      case 'deposit':
        // Add funds to user's escrow balance
        await escrowApi.updateUserBalance(userId, amount);
        break;
        
      case 'orderFund':
        if (!orderId) {
          throw new Error('Order ID is required for funding operations');
        }
        
        // Fund the specific order
        await escrowApi.fundOrder(orderId, { amount });
        break;
        
      default:
        console.warn(`Unknown payment type: ${type}`);
        break;
    }
    
    // Show success notification
    window.showNotification('Payment processed successfully', 'success');
    
    // Dispatch completion event
    document.dispatchEvent(new CustomEvent('escrowPaymentCompleted', { 
      detail: { success: true, userId, amount, orderId, type }
    }));
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Show error notification
    window.showNotification(error.message || 'Payment processing failed', 'error');
    
    // Dispatch error event
    document.dispatchEvent(new CustomEvent('escrowPaymentError', { 
      detail: { success: false, error: error.message, userId, amount, orderId, type }
    }));
  } finally {
    uiUtils.hideLoading();
  }
}

/**
 * Process a deposit to user's escrow balance
 * @param {string} userId - The user ID
 * @param {number} amount - The amount to deposit
 * @returns {Promise<Object>} Result object with success status
 */
export async function processDeposit(userId, amount) {
  if (!userId || !amount || amount <= 0) {
    return { success: false, message: 'Invalid deposit parameters' };
  }
  
  uiUtils.showLoading();
  
  try {
    // Update user balance using the API
    const result = await escrowApi.updateUserBalance(userId, amount);
    
    uiUtils.hideLoading();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error processing deposit:', error);
    uiUtils.hideLoading();
    return { success: false, message: error.message || 'Failed to process deposit' };
  }
}

export default {
  initPaymentSystem,
  processDeposit
};
