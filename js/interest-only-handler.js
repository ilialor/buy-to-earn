/**
 * Interest-only button functionality handler
 * This module manages both static and dynamic interest-only buttons
 */

// Store API base URL from global config or default value
const apiBaseUrl = window.apiBaseUrl || '';

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
  try {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      showModal('auth-modal');
      return;
    }
    
    // Show loading state
    const originalInnerHTML = buttonElement.innerHTML;
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
    showNotification(getCurrentLanguageMessage('notification.error'), 'danger');
    
    // Make sure button is restored in case of error
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.innerHTML = originalInnerHTML || '';
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

// Initialization - call on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize immediately for static buttons
  initInterestOnlyButtons();
  
  // Re-initialize after any order list update
  // Using custom event that should be dispatched after order list updates
  document.addEventListener('ordersUpdated', initInterestOnlyButtons);
});
