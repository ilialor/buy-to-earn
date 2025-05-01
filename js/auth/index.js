/**
 * Auth Module Index
 * Exports authentication services and utilities
 * 
 * UPDATED: Removed legacy auth imports and using centralized JWT auth service
 */

// Import the main authentication service
import authService from '../auth-service.js';

// Re-export the main auth service as default export
export { authService as default };

// Export compatibility wrapper functions to maintain API compatibility
// These functions delegate to the centralized auth service
export const checkAndInitAuth = () => authService.init();
export const signInWithEmail = (email, password) => authService.login(email, password);
export const signUpWithEmail = (email, password, name) => authService.register(email, password, name);
export const resetPassword = (email) => console.warn('Password reset through email is not supported in the new auth system');
export const signOut = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const updateUIOnAuth = () => document.dispatchEvent(new Event('userChanged'));
export const showNotification = (message, type) => {
  console.log(`[${type}] ${message}`);
  // Dispatch an event that UI components can listen for
  document.dispatchEvent(new CustomEvent('notification', { detail: { message, type } }));
};
