/**
 * User service for integrating local user authentication with Escrow API
 * Handles mapping local users to Escrow API users and managing user profiles
 */

import { escrowApi } from './escrow-api.js';
import { ailockApi } from './ailock-api.js';

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
        // User might not exist anymore, continue to check by email
        console.warn('Existing Escrow user not found by ID, trying by email');
      }
    }
    
    // If we have a user email, try to find the user by email in the database
    if (localUser.email) {
      try {
        // Get all users from the database
        const allUsers = await escrowApi.getUsers();
        
        // Find the user with matching email
        const existingUser = allUsers.find(user => user.email === localUser.email);
        
        if (existingUser) {
          console.log(`Found existing user with email ${localUser.email}`);
          
          // Save the mapping between local ID and Escrow ID
          saveEscrowUserId(localUser.uid, existingUser.id);
          
          return existingUser;
        }
      } catch (emailError) {
        console.warn('Error searching for user by email:', emailError);
        // Continue and try to create a new user as fallback
      }
    }
    
    // Если метод поиска по email недоступен, попробуем напрямую создать
    // пользователя и обработать потенциальную ошибку "пользователь уже существует"
    try {
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
    } catch (createError) {
      // Если ошибка указывает на то, что пользователь уже существует
      if (createError.message && createError.message.includes('already exists')) {
        console.log('User already exists, attempting to retrieve by email');
        
        // Возвращаем локальную информацию в виде объекта пользователя
        // так как не можем получить актуальную информацию с сервера
        return {
          id: `existing-${Date.now()}`,
          name: localUser.displayName || localUser.email || 'User',
          email: localUser.email,
          type: mapUserRoleToEscrowType(localUser.role || 'customer'),
          balance: 0,
          _isExistingUser: true
        };
      }
      
      // Другие ошибки пробрасываем дальше
      throw createError;
    }
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

/**
 * Get user profile data from backend
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile() {
  try {
    const escrowUserId = getCurrentEscrowUserId();
    if (!escrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }
    
    // Get user data from Escrow API
    const userData = await escrowApi.getUserById(escrowUserId);
    
    // Get extended profile data from Ailock API
    let profileData = {};
    try {
      profileData = await ailockApi.getUserProfile(escrowUserId);
    } catch (error) {
      console.warn('Could not fetch extended profile from Ailock:', error);
      // Continue with basic profile if extended profile is not available
    }
    
    // Combine data from both APIs
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      type: userData.type,
      balance: userData.balance,
      createdAt: userData.createdAt,
      // Add any extended profile properties
      xp: profileData.xp || 0,
      level: profileData.level || 1,
      bio: profileData.bio || '',
      preferences: profileData.preferences || {},
      stats: {
        investments: profileData.stats?.investments || 0,
        nfts: profileData.stats?.nfts || 0,
        totalEarnings: profileData.balance || 0
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile data
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
async function updateUserProfile(profileData) {
  try {
    const escrowUserId = getCurrentEscrowUserId();
    if (!escrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }
    
    // Split data between services
    const escrowData = {};
    const ailockData = {};
    
    // Data for Escrow API (if update methods become available)
    if (profileData.name) escrowData.name = profileData.name;
    if (profileData.email) escrowData.email = profileData.email;
    
    // Data for Ailock API
    if (profileData.bio) ailockData.bio = profileData.bio;
    if (profileData.preferences) ailockData.preferences = profileData.preferences;
    
    // Update in Escrow API (placeholder for when this becomes available)
    // await escrowApi.updateUser(escrowUserId, escrowData);
    
    // Update in Ailock API
    if (Object.keys(ailockData).length > 0) {
      await ailockApi.updateUserProfile(escrowUserId, ailockData);
    }
    
    // Return the updated profile
    return getUserProfile();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function changePassword(currentPassword, newPassword) {
  try {
    const escrowUserId = getCurrentEscrowUserId();
    if (!escrowUserId) {
      throw new Error('User not authenticated');
    }
    
    // Implement password change logic
    // This would typically use an auth service
    // For now we'll just use the Ailock API as an example
    await ailockApi.changeUserPassword(escrowUserId, currentPassword, newPassword);
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} Updated preferences
 */
async function updateNotificationPreferences(preferences) {
  try {
    const escrowUserId = getCurrentEscrowUserId();
    if (!escrowUserId) {
      throw new Error('User not authenticated');
    }
    
    // Update notification preferences in Ailock API
    await ailockApi.updateUserPreferences(escrowUserId, { notifications: preferences });
    
    return preferences;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

export {
  registerUserWithEscrow,
  updateEscrowUserInfo,
  getEscrowUserId,
  getCurrentEscrowUserId,
  logoutFromEscrow,
  getCurrentUser,
  mapUserRoleToEscrowType,
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateNotificationPreferences
};
