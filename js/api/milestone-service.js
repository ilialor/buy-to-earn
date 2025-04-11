/**
 * Milestone service for integrating with Escrow API
 * Handles milestone completion, acts, and related functionality
 */

import { escrowApi } from './escrow-api.js';
import { getCurrentEscrowUserId } from './user-service.js';

/**
 * Complete a milestone in Escrow API
 * @param {string} orderId - Order ID
 * @param {string} milestoneId - Milestone ID
 * @param {string} deliverableUrl - URL of the deliverable
 * @returns {Promise<Object>} Updated milestone and created act
 */
async function completeMilestone(orderId, milestoneId, deliverableUrl) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    const completionResult = await escrowApi.completeMilestone(orderId, milestoneId, {
      contractorId: currentEscrowUserId,
      deliverableUrl: deliverableUrl
    });
    
    return completionResult;
  } catch (error) {
    console.error('Error completing milestone in Escrow:', error);
    throw error;
  }
}

/**
 * Sign an act in Escrow API
 * @param {string} actId - Act ID
 * @returns {Promise<Object>} Updated act
 */
async function signAct(actId) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    const signResult = await escrowApi.signAct(actId, {
      userId: currentEscrowUserId
    });
    
    return signResult;
  } catch (error) {
    console.error('Error signing act in Escrow:', error);
    throw error;
  }
}

/**
 * Reject an act in Escrow API
 * @param {string} actId - Act ID
 * @param {string} reason - Reason for rejection
 * @returns {Promise<Object>} Updated act
 */
async function rejectAct(actId, reason) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    const rejectResult = await escrowApi.rejectAct(actId, {
      userId: currentEscrowUserId,
      reason: reason
    });
    
    return rejectResult;
  } catch (error) {
    console.error('Error rejecting act in Escrow:', error);
    throw error;
  }
}

/**
 * Get all milestones for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Array>} List of milestones
 */
async function getOrderMilestones(orderId) {
  try {
    const order = await escrowApi.getOrderById(orderId);
    return order.milestones || [];
  } catch (error) {
    console.error(`Error getting milestones for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Create a document linked to a milestone
 * @param {string} orderId - Order ID
 * @param {string} milestoneId - Milestone ID
 * @param {Object} documentData - Document data
 * @returns {Promise<Object>} Created document
 */
async function createMilestoneDocument(orderId, milestoneId, documentData) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    // Add order and milestone references
    const enrichedDocData = {
      ...documentData,
      orderId,
      milestoneId,
      creatorId: currentEscrowUserId
    };

    return await escrowApi.createDocument(enrichedDocData);
  } catch (error) {
    console.error('Error creating milestone document in Escrow:', error);
    throw error;
  }
}

/**
 * Generate an AI document (DoR, Roadmap, DoD) for a milestone
 * @param {string} type - Document type ('DoR', 'Roadmap', 'DoD')
 * @param {string} orderId - Order ID
 * @param {string} milestoneId - Milestone ID
 * @param {Object} promptData - Data for document generation
 * @returns {Promise<Object>} Generated document
 */
async function generateMilestoneDocument(type, orderId, milestoneId, promptData) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    // Add order and milestone references
    const enrichedPromptData = {
      ...promptData,
      orderId,
      milestoneId,
      requesterId: currentEscrowUserId
    };

    return await escrowApi.generateDocument(type, enrichedPromptData);
  } catch (error) {
    console.error(`Error generating ${type} document in Escrow:`, error);
    throw error;
  }
}

/**
 * Validate a deliverable against requirements
 * @param {string} orderId - Order ID
 * @param {string} milestoneId - Milestone ID
 * @param {string} deliverableUrl - Deliverable URL to validate
 * @param {string} requirementsDocId - ID of requirements document
 * @returns {Promise<Object>} Validation result
 */
async function validateDeliverable(orderId, milestoneId, deliverableUrl, requirementsDocId) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    return await escrowApi.validateDeliverable({
      orderId,
      milestoneId,
      deliverableUrl,
      requirementsDocId,
      requesterId: currentEscrowUserId
    });
  } catch (error) {
    console.error('Error validating deliverable in Escrow:', error);
    throw error;
  }
}

export {
  completeMilestone,
  signAct,
  rejectAct,
  getOrderMilestones,
  createMilestoneDocument,
  generateMilestoneDocument,
  validateDeliverable
};
