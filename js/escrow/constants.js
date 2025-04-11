/**
 * Escrow Constants Module
 * Constants and enumerations for escrow functionality
 */

// Constants
const PLATFORM_SIGNATURE_ID = "PLATFORM";
const MIN_SIGNATURES_REQUIRED = 2;
const REP_VOTE_THRESHOLD_PERCENT = 75.0;

// Enumerations (using strings to match Python implementation)
const UserType = {
  CUSTOMER: "CUSTOMER",
  CONTRACTOR: "CONTRACTOR"
};

const OrderStatus = {
  PENDING: "PENDING",      // Waiting for funding
  FUNDED: "FUNDED",        // Enough funds in escrow, work can start
  IN_PROGRESS: "IN_PROGRESS", // At least one milestone marked complete
  COMPLETED: "COMPLETED",  // All milestones paid
  CANCELLED: "CANCELLED"   // Optional future state
};

const MilestoneStatus = {
  PENDING: "PENDING",      // Not started or not marked complete
  COMPLETED_BY_CONTRACTOR: "COMPLETED_BY_CONTRACTOR", // Marked done, waiting for signatures
  PAID: "PAID"             // Signatures received, funds released
};

// Utility Functions
function generateId(prefix = "") {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
}

// Export all constants and utilities
export {
  PLATFORM_SIGNATURE_ID,
  MIN_SIGNATURES_REQUIRED,
  REP_VOTE_THRESHOLD_PERCENT,
  UserType,
  OrderStatus,
  MilestoneStatus,
  generateId
}; 