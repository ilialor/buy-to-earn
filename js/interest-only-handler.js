/**
 * Interest-only button functionality handler
 * This module manages both static and dynamic interest buttons (favorite star icons)
 */

// Import auth service
import authService from './auth-service.js';

// Import UI utilities - showModal function
import { showModal } from './ui.js';

// Store API base URL from global config or default value
const apiBaseUrl = window.apiBaseUrl || '';

// Use local development mode flag
const isLocalDevelopment = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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
  console.log('Initializing interest buttons (favorites)...');
  
  // Find all static interest/favorite buttons
  const staticButtons = document.querySelectorAll('.favorite-btn, .interest-only-btn');
  
  // Set up click handlers for all static buttons
  staticButtons.forEach(button => {
    // Skip if handler already attached (prevents duplicate listeners)
    if (button.dataset.handlerAttached) return;
    
    // Add click event listener
    button.addEventListener('click', function() {
      const orderId = this.getAttribute('data-order-id');
      if (orderId) {
        toggleInterestOnly(orderId);
      } else {
        console.error('Button is missing data-order-id attribute');
      }
    });
    
    // Mark as initialized to prevent duplicate handlers
    button.dataset.handlerAttached = 'true';
    
    // Check current status - for local development, use localStorage
    const orderId = button.getAttribute('data-order-id');
    if (orderId) {
      updateButtonStatus(button, orderId);
    }
  });
}

/**
 * Update interest-only button status based on current state
 * @param {HTMLElement} button - Button element to update
 * @param {string} orderId - Order ID to check status for
 */
async function updateButtonStatus(button, orderId) {
  try {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      return;
    }
    
    // Get current interest status - from localStorage for local dev, API for production
    let isInterested;
    
    if (isLocalDevelopment) {
      // Use localStorage for local development
      try {
        const interestedOrders = JSON.parse(localStorage.getItem('interestedOrders') || '[]');
        isInterested = interestedOrders.includes(orderId);
      } catch (err) {
        console.warn('Could not read interest state from localStorage', err);
        isInterested = false;
      }
    } else {
      // Use API for production
      isInterested = await checkInterestStatus(orderId);
    }
    
    // Update button appearance based on status
    const icon = button.querySelector('i');
    if (icon) {
      if (isInterested) {
        icon.className = 'fas fa-star';
        button.title = 'Remove from Interesting';
      } else {
        icon.className = 'far fa-star';
        button.title = 'Add to Interesting';
      }
    }
  } catch (error) {
    console.error('Error updating button status:', error);
  }
}

/**
 * Toggle interest status for an order
 * @param {string} orderId - Order ID to toggle interest for
 * @returns {Promise<boolean>} New interest status
 */
async function toggleInterestOnly(orderId) {
  // Check if user is authenticated
  if (!isUserAuthenticated()) {
    console.log('User not authenticated, showing auth modal');
    showModal('auth-modal');
    return false;
  }

  try {
    console.log(`Toggling interest for order: ${orderId}`);
    
    // Optimistically update UI to improve perceived performance
    const buttons = document.querySelectorAll(`.favorite-btn[data-order-id="${orderId}"], .interest-only-btn[data-order-id="${orderId}"]`);
    let isInterested = false;
    
    buttons.forEach(button => {
      // Add loading state
      button.classList.add('loading');
      
      // Check current state for optimistic update
      const icon = button.querySelector('i');
      isInterested = icon?.className.includes('fas fa-star') ? false : true;
    });
    
    // For local development environment, use mock data instead of API
    if (isLocalDevelopment) {
      console.log('Using mock interest toggle in local development mode');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update all matching buttons for this order
      buttons.forEach(button => {
        button.classList.remove('loading');
        
        // Update icon to filled or empty star based on local state
        const icon = button.querySelector('i');
        if (icon) {
          icon.className = isInterested ? 'fas fa-star' : 'far fa-star';
          button.title = isInterested ? 'Remove from Interesting' : 'Add to Interesting';
        }
      });
      
      // Store interest state in localStorage for persistence
      try {
        const interestedOrders = JSON.parse(localStorage.getItem('interestedOrders') || '[]');
        if (isInterested) {
          if (!interestedOrders.includes(orderId)) {
            interestedOrders.push(orderId);
          }
        } else {
          const index = interestedOrders.indexOf(orderId);
          if (index > -1) {
            interestedOrders.splice(index, 1);
          }
        }
        localStorage.setItem('interestedOrders', JSON.stringify(interestedOrders));
      } catch (err) {
        console.warn('Could not save interest state to localStorage', err);
      }
      
      return isInterested;
    }
    
    // Make API request to toggle interest for production
    const response = await fetch(`${apiBaseUrl}/api/orders/interest-only`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ orderId })
    });

    // Get actual state from the API response
    const result = await response.json();
    isInterested = result.isInterested;
    
    // Update all matching buttons for this order
    buttons.forEach(button => {
      button.classList.remove('loading');
      
      // Update icon to filled or empty star based on response
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = isInterested ? 'fas fa-star' : 'far fa-star';
        button.title = isInterested ? 'Remove from Interesting' : 'Add to Interesting';
      }
    });

    return isInterested;
  } catch (error) {
    console.error('Error toggling interest:', error);
    // Restore original state and show error
    document.querySelectorAll(`.favorite-btn[data-order-id="${orderId}"], .interest-only-btn[data-order-id="${orderId}"]`).forEach(button => {
      button.classList.remove('loading');
    });
    return false;
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
    
    // For local development, use localStorage
    if (isLocalDevelopment) {
      try {
        const interestedOrders = JSON.parse(localStorage.getItem('interestedOrders') || '[]');
        return interestedOrders.includes(orderId);
      } catch (err) {
        console.warn('Could not read interest state from localStorage', err);
        return false;
      }
    }
    
    // For production, use API
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

/**
 * Helper function to show notification
 * Fallback if global function is not available
 */
function showNotification(message, type = 'info') {
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
  // Initialize immediately for favorite/interest buttons
  initInterestOnlyButtons();
  
  // Re-initialize after any order list update
  // Using custom event that should be dispatched after order list updates
  document.addEventListener('ordersUpdated', initInterestOnlyButtons);
});
