/**
 * UI utilities for Escrow API integration
 * Provides error handling and notification functions
 */

/**
 * Show error message to the user
 * @param {string} message - Error message
 * @param {Error} error - Original error object (optional)
 */
export function showErrorMessage(message, error = null) {
  // Log detailed error to console for debugging
  if (error) {
    console.error(`${message}:`, error);
  }

  // Create error notification element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Add to document body
  document.body.appendChild(errorElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorElement.classList.add('fade-out');
    setTimeout(() => {
      errorElement.remove();
    }, 300); // After fade animation
  }, 5000);
}

/**
 * Show notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('info', 'success', 'warning')
 */
export function showNotification(message, type = 'info') {
  // Create notification element
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification ${type}`;
  notificationElement.textContent = message;
  
  // Add to document body
  document.body.appendChild(notificationElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notificationElement.classList.add('fade-out');
    setTimeout(() => {
      notificationElement.remove();
    }, 300); // After fade animation
  }, 5000);
}

/**
 * Show loading indicator
 * @param {HTMLElement} container - Container element to append loader to
 * @returns {HTMLElement} Created loader element
 */
export function showLoader(container) {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = '<div class="spinner"></div>';
  
  container.appendChild(loader);
  return loader;
}

/**
 * Hide loading indicator
 * @param {HTMLElement} loader - Loader element to remove
 */
export function hideLoader(loader) {
  if (loader && loader.parentNode) {
    loader.parentNode.removeChild(loader);
  }
}

/**
 * Format currency amount with proper decimal places
 * @param {string|number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with 2 decimal places
  return numAmount.toFixed(2);
}

/**
 * Format date to local string representation
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format date
  return dateObj.toLocaleDateString();
}

/**
 * Translate order status to human-readable text
 * @param {string} status - Order status
 * @returns {string} Human-readable status
 */
export function translateOrderStatus(status) {
  const statusMap = {
    'CREATED': 'Создан',
    'FUNDED': 'Профинансирован',
    'IN_PROGRESS': 'В работе',
    'COMPLETED': 'Завершен',
    'CANCELLED': 'Отменен'
  };
  
  return statusMap[status] || status;
}

/**
 * Translate milestone status to human-readable text
 * @param {string} status - Milestone status
 * @returns {string} Human-readable status
 */
export function translateMilestoneStatus(status) {
  const statusMap = {
    'CREATED': 'Создана',
    'IN_PROGRESS': 'В работе',
    'COMPLETED': 'Завершена',
    'PAID': 'Оплачена'
  };
  
  return statusMap[status] || status;
}
