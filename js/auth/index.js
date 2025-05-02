/**
 * Auth Module Index
 * Exports authentication services and utilities
 */

// Import services
import jwtAuthService from './jwt-service.js';
import * as legacyAuth from './legacy-auth.js';

// Re-export for easier imports
export { jwtAuthService as default };
export const legacyAuthService = legacyAuth;

// Export individual utilities from legacy auth
export const {
  checkAndInitAuth,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPassword,
  signOut,
  getCurrentUser,
  updateUIOnAuth,
  showNotification
} = legacyAuth;
