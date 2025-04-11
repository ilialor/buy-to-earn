/**
 * Mock implementation of EscrowLocalStorage for testing purposes
 * This file simulates the behavior of the local storage system
 */

export default class MockEscrowStorage {
  constructor() {
    this.users = {};
    this.orders = {};
    this.milestones = {};
  }

  // User methods
  saveUser(user) {
    this.users[user.user_id || user.id] = user;
    return true;
  }

  getUser(userId) {
    return this.users[userId] || null;
  }

  getUsers() {
    return Object.values(this.users);
  }

  // Order methods
  saveOrder(order) {
    this.orders[order.order_id || order.id] = order;
    return true;
  }

  getOrder(orderId) {
    return this.orders[orderId] || null;
  }

  getOrders() {
    return Object.values(this.orders);
  }

  getUserOrders(userId) {
    return Object.values(this.orders).filter(order => 
      order.creator_id === userId || order.contractor_id === userId
    );
  }

  // Milestone methods
  saveMilestone(orderId, milestone) {
    if (!this.milestones[orderId]) {
      this.milestones[orderId] = {};
    }
    this.milestones[orderId][milestone.milestone_id || milestone.id] = milestone;
    return true;
  }

  getMilestone(orderId, milestoneId) {
    if (!this.milestones[orderId]) return null;
    return this.milestones[orderId][milestoneId] || null;
  }

  getOrderMilestones(orderId) {
    if (!this.milestones[orderId]) return [];
    return Object.values(this.milestones[orderId]);
  }

  // Clear all data (for testing)
  clearAll() {
    this.users = {};
    this.orders = {};
    this.milestones = {};
  }
}
