/**
 * Interest-only button functionality handler
 * This module manages both static and dynamic interest-only buttons
 */

// Import auth service
import authService from './auth-service.js';

// При необходимости импортируем утилиты UI
// Импортируем showModal если эта функция существует или создаем свою
import { showModal as uiShowModal } from './ui.js';

// Store API base URL from global config or default value
const apiBaseUrl = window.apiBaseUrl || '';

// Используем импортированную функцию showModal или создаем заглушку
const showModal = uiShowModal || window.showModal || function(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    modalElement.style.display = 'flex';
  } else {
    console.warn(`Modal with ID ${modalId} not found`);
    // Fallback - redirect to login
    window.location.href = '/login.html';
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isUserAuthenticated() {
  return authService.isAuthenticated();
}

/**
 * Get authentication token
 * @returns {Promise<string>} Auth token
 */
async function getAuthToken() {
  return authService.accessToken;
}

/**
 * Initialize all interest-only buttons on the page
 * Works with both static HTML buttons and dynamically created ones
 */
export async function initInterestOnlyButtons() {
  console.log('Initializing interest-only buttons...');
  
  // Find all static interest-only buttons
  const staticButtons = document.querySelectorAll('.interest-only-btn');
  
  // Set up click handlers for all static buttons
  staticButtons.forEach(button => {
    // Skip if handler already attached (prevents duplicate listeners)
    if (button.dataset.handlerAttached) return;
    
    // Add click event listener
    button.addEventListener('click', function() {
      const orderId = this.getAttribute('data-order-id');
      if (orderId) {
        toggleInterestOnly(orderId, this);
      } else {
        console.error('Button is missing data-order-id attribute');
      }
    });
    
    // Mark as initialized to prevent duplicate handlers
    button.dataset.handlerAttached = 'true';
    
    // Check current status
    const orderId = button.getAttribute('data-order-id');
    if (orderId) {
      updateButtonStatus(button, orderId);
    }
  });
}

/**
 * Update interest-only button status based on current state from API
 * @param {HTMLElement} button - Button element to update
 * @param {string} orderId - Order ID to check status for
 */
async function updateButtonStatus(button, orderId) {
  try {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      return;
    }
    
    // Get current interest status from API
    const isInterested = await checkInterestStatus(orderId);
    
    // Update button appearance based on status
    if (isInterested) {
      button.classList.remove('btn-outline-info');
      button.classList.add('btn-info');
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-star-o');
        icon.classList.add('fa-star');
      }
    }
  } catch (error) {
    console.error('Error updating button status:', error);
  }
}

/**
 * Toggle interest-only status for an order
 * @param {string} orderId - Order ID to toggle interest for
 * @param {HTMLElement} buttonElement - Button element that was clicked
 */
export async function toggleInterestOnly(orderId, buttonElement) {
  // Store original HTML before any operations
  const originalInnerHTML = buttonElement?.innerHTML || '';
  
  try {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      // Show auth modal for unauthenticated users
      if (typeof showModal === 'function') {
        showModal('auth-modal');
      } else {
        console.warn('Auth modal function not found');
        // Redirect to login page as fallback
        window.location.href = '/login.html';
      }
      return;
    }
    
    // Show loading state
    buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    buttonElement.disabled = true;
    
    const isCurrentlyInterested = buttonElement.classList.contains('btn-info');
    
    // Make API call to the escrow service
    const response = await fetch(`${apiBaseUrl}/api/orders/interest-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ orderId })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Update button appearance based on API response
    if (result.action === 'removed') {
      buttonElement.classList.remove('btn-info');
      buttonElement.classList.add('btn-outline-info');
      buttonElement.querySelector('i').classList.remove('fa-star');
      buttonElement.querySelector('i').classList.add('fa-star-o');
      showNotification(getCurrentLanguageMessage('notification.interestRemoved'), 'info');
    } else if (result.action === 'added') {
      buttonElement.classList.remove('btn-outline-info');
      buttonElement.classList.add('btn-info');
      buttonElement.querySelector('i').classList.remove('fa-star-o');
      buttonElement.querySelector('i').classList.add('fa-star');
      showNotification(getCurrentLanguageMessage('notification.interestAdded'), 'success');
    }
    
    // Re-enable button and restore original content
    buttonElement.disabled = false;
    buttonElement.innerHTML = originalInnerHTML;
    
    // Apply i18n to the button text again
    if (window.applyI18n) {
      window.applyI18n(buttonElement.querySelector('[data-i18n]'));
    }
    
  } catch (error) {
    console.error('Error toggling interest:', error);
    
    // Use safe notification display
    if (typeof getCurrentLanguageMessage === 'function' && typeof showNotification === 'function') {
      showNotification(getCurrentLanguageMessage('notification.error'), 'danger');
    } else {
      console.error('Could not show notification: function not available');
    }
    
    // Make sure button is restored in case of error
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.innerHTML = originalInnerHTML;
    }
  }
}

/**
 * Check if the user has marked interest in an order
 * @param {string} orderId - Order ID to check interest status for
 * @returns {Promise<boolean>} Whether user has marked interest
 */
export async function checkInterestStatus(orderId) {
  try {
    // Don't check if user isn't authenticated
    if (!isUserAuthenticated()) {
      return false;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/orders/interest-only`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    return result.interestedOrderIds && result.interestedOrderIds.includes(orderId);
  } catch (error) {
    console.error('Error checking interest status:', error);
    return false;
  }
}

// Функция showModal уже определена выше в начале файла

/**
 * Helper function to show notification
 * Fallback if global function is not available
 */
function getCurrentLanguageMessage(key) {
  // Try to use global function if available
  if (typeof window.getCurrentLanguageMessage === 'function') {
    return window.getCurrentLanguageMessage(key);
  }
  
  // Fallback messages
  const messages = {
    'notification.error': 'Произошла ошибка',
    'notification.interestAdded': 'Добавлено в интересующие',
    'notification.interestRemoved': 'Удалено из интересующих'
  };
  
  return messages[key] || key;
}

/**
 * Helper function to show notification
 * Fallback if global function is not available 
 */
function showNotification(message, type) {
  // Try to use global function if available
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Simple fallback notification
  console.log(`[${type}] ${message}`);
  
  // Create simple toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-body">${message}</div>`;
  toast.style.position = 'fixed';
  toast.style.top = '10px';
  toast.style.right = '10px';
  toast.style.zIndex = '9999';
  toast.style.backgroundColor = type === 'danger' ? '#f8d7da' : 
                               type === 'success' ? '#d4edda' : 
                               type === 'info' ? '#d1ecf1' : '#fff3cd';
  toast.style.color = '#212529';
  toast.style.padding = '0.75rem 1.25rem';
  toast.style.borderRadius = '0.25rem';
  toast.style.boxShadow = '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)';
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}

// Initialization - call on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize immediately for static buttons
  initInterestOnlyButtons();
  
  // Re-initialize after any order list update
  // Using custom event that should be dispatched after order list updates
  document.addEventListener('ordersUpdated', initInterestOnlyButtons);
});
