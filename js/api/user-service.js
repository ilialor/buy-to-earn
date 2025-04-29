/**
 * User service for integrating local user authentication with Escrow API
 * Handles mapping local users to Escrow API users
 */

import { escrowApi } from './escrow-api.js';

/**
 * Map local user role to Escrow API user type
 * @param {string} role - Local user role
 * @returns {string} Escrow user type (CUSTOMER, CONTRACTOR, PLATFORM)
 */
function mapUserRoleToEscrowType(role) {
  switch (role) {
    case 'customer':
      return 'CUSTOMER';
    case 'contractor':
      return 'CONTRACTOR';
    case 'admin':
      return 'PLATFORM';
    default:
      return 'CUSTOMER';
  }
}

/**
 * Save Escrow user ID to local storage
 * @param {string} localUserId - Local user ID
 * @param {string} escrowUserId - Escrow API user ID
 */
function saveEscrowUserId(localUserId, escrowUserId) {
  // Store mapping between local user ID and Escrow user ID
  const mapping = JSON.parse(localStorage.getItem('escrowUserMapping') || '{}');
  mapping[localUserId] = escrowUserId;
  localStorage.setItem('escrowUserMapping', JSON.stringify(mapping));
  
  // Also set current escrow user ID for convenience
  localStorage.setItem('currentEscrowUserId', escrowUserId);
}

/**
 * Get Escrow user ID for a local user
 * @param {string} localUserId - Local user ID
 * @returns {string|null} Escrow user ID or null if not found
 */
function getEscrowUserId(localUserId) {
  const mapping = JSON.parse(localStorage.getItem('escrowUserMapping') || '{}');
  return mapping[localUserId] || null;
}

/**
 * Get current Escrow user ID
 * @returns {string|null} Current Escrow user ID or null if not authenticated
 */
function getCurrentEscrowUserId() {
  return localStorage.getItem('currentEscrowUserId') || null;
}

/**
 * Register or retrieve an Escrow user for the local user
 * @param {Object} localUser - Local user object
 * @returns {Promise<Object>} Created or retrieved Escrow user
 */
async function registerUserWithEscrow(localUser) {
  try {
    // Check if we already have an Escrow user ID for this local user
    const existingEscrowUserId = getEscrowUserId(localUser.uid);
    
    if (existingEscrowUserId) {
      // Try to get the user from Escrow API
      try {
        const escrowUser = await escrowApi.getUserById(existingEscrowUserId);
        return escrowUser;
      } catch (error) {
        // User might not exist anymore, create a new one
        console.warn('Existing Escrow user not found, creating a new one');
      }
    }
    
    // Create a new user in Escrow API
    const escrowUser = await escrowApi.createUser({
      name: localUser.displayName || localUser.email || 'User',
      email: localUser.email || `user-${localUser.uid}@example.com`,
      type: mapUserRoleToEscrowType(localUser.role || 'customer'),
      initialBalance: 0
    });
    
    // Save the mapping
    saveEscrowUserId(localUser.uid, escrowUser.id);
    
    return escrowUser;
  } catch (error) {
    console.error('Error registering user with Escrow:', error);
    throw error;
  }
}

/**
 * Update Escrow user info when local user info changes
 * @param {Object} localUser - Updated local user object
 * @returns {Promise<Object>} Updated Escrow user
 */
async function updateEscrowUserInfo(localUser) {
  // Note: The current API doesn't support updating user info directly,
  // so this is a placeholder for future implementation
  return registerUserWithEscrow(localUser);
}

/**
 * Logout from Escrow API
 */
function logoutFromEscrow() {
  localStorage.removeItem('currentEscrowUserId');
}

/**
 * Get current Escrow user
 */
async function getCurrentUser() {
  const escrowUserId = getCurrentEscrowUserId();
  if (!escrowUserId) {
    throw new Error('User not authenticated with Escrow');
  }
  return escrowApi.getUserById(escrowUserId);
}

export {
  registerUserWithEscrow,
  updateEscrowUserInfo,
  getEscrowUserId,
  getCurrentEscrowUserId,
  logoutFromEscrow,
  getCurrentUser,
  mapUserRoleToEscrowType
};
