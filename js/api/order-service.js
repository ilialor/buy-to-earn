/**
 * Order service for integrating with Escrow API
 * Handles order creation, funding, and management
 */

import { escrowApi } from './escrow-api.js';
import { getCurrentEscrowUserId } from './user-service.js';

/**
 * Create a new order in Escrow API
 * @param {Object} orderData - Order data 
 * @returns {Promise<Object>} Created order
 */
async function createEscrowOrder(orderData) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    // Format milestones for API
    const milestones = orderData.milestones.map(m => ({
      description: m.description,
      amount: m.amount.toString(),
      deadline: m.deadline instanceof Date ? m.deadline.toISOString() : m.deadline
    }));

    // Create order through API
    const escrowOrder = await escrowApi.createOrder({
      customerId: currentEscrowUserId,
      title: orderData.title,
      description: orderData.description,
      milestones: milestones
    });
    
    return escrowOrder;
  } catch (error) {
    console.error('Error creating order in Escrow:', error);
    throw error;
  }
}

/**
 * Create a group order in Escrow API
 * @param {Object} orderData - Order data
 * @param {Array<string>} customerIds - Array of customer IDs
 * @returns {Promise<Object>} Created group order
 */
async function createGroupEscrowOrder(orderData, customerIds) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    // Ensure current user is included in customers
    if (!customerIds.includes(currentEscrowUserId)) {
      customerIds.push(currentEscrowUserId);
    }

    // Format milestones for API
    const milestones = orderData.milestones.map(m => ({
      description: m.description,
      amount: m.amount.toString(),
      deadline: m.deadline instanceof Date ? m.deadline.toISOString() : m.deadline
    }));

    // Create group order through API
    const escrowOrder = await escrowApi.createGroupOrder({
      customerIds: customerIds,
      title: orderData.title,
      description: orderData.description,
      initialRepresentativeId: currentEscrowUserId,
      milestones: milestones
    });
    
    return escrowOrder;
  } catch (error) {
    console.error('Error creating group order in Escrow:', error);
    throw error;
  }
}

/**
 * Fund an order in Escrow API
 * @param {string} orderId - Order ID
 * @param {number} amount - Amount to fund
 * @returns {Promise<Object>} Updated order
 */
async function fundEscrowOrder(orderId, amount) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    const fundResult = await escrowApi.fundOrder(orderId, {
      customerId: currentEscrowUserId,
      amount: amount.toString()
    });
    
    return fundResult;
  } catch (error) {
    console.error('Error funding order in Escrow:', error);
    throw error;
  }
}

/**
 * Assign a contractor to an order
 * @param {string} orderId - Order ID
 * @param {string} contractorId - Contractor ID
 * @returns {Promise<Object>} Updated order
 */
async function assignContractorToOrder(orderId, contractorId) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    // Only the representative (for group orders) or the customer can assign a contractor
    const order = await escrowApi.getOrderById(orderId);
    const canAssign = order.isGroupOrder 
      ? (order.representativeId === currentEscrowUserId)
      : (order.customerIds.includes(currentEscrowUserId));
    
    if (!canAssign) {
      throw new Error('Not authorized to assign contractor');
    }

    const assignResult = await escrowApi.assignContractor(orderId, {
      contractorId: contractorId
    });
    
    return assignResult;
  } catch (error) {
    console.error('Error assigning contractor in Escrow:', error);
    throw error;
  }
}

/**
 * Get all orders from Escrow API
 * @returns {Promise<Array>} List of orders
 */
async function getEscrowOrders() {
  try {
    return await escrowApi.getOrders();
  } catch (error) {
    console.error('Error getting orders from Escrow:', error);
    throw error;
  }
}

/**
 * Get an order by ID from Escrow API
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
async function getEscrowOrderById(orderId) {
  try {
    return await escrowApi.getOrderById(orderId);
  } catch (error) {
    console.error(`Error getting order ${orderId} from Escrow:`, error);
    throw error;
  }
}

/**
 * Vote for representative in a group order
 * @param {string} orderId - Order ID
 * @param {string} candidateId - Candidate user ID
 * @returns {Promise<Object>} Updated order
 */
async function voteForRepresentative(orderId, candidateId) {
  try {
    const currentEscrowUserId = getCurrentEscrowUserId();
    if (!currentEscrowUserId) {
      throw new Error('User not authenticated with Escrow');
    }

    const voteResult = await escrowApi.voteForRepresentative(orderId, {
      voterId: currentEscrowUserId,
      candidateId: candidateId
    });
    
    return voteResult;
  } catch (error) {
    console.error('Error voting for representative in Escrow:', error);
    throw error;
  }
}

export {
  createEscrowOrder,
  createGroupEscrowOrder,
  fundEscrowOrder,
  assignContractorToOrder,
  getEscrowOrders,
  getEscrowOrderById,
  voteForRepresentative
};
