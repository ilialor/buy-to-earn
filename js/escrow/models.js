/**
 * Escrow Models Module
 * Data models for escrow functionality
 */

import {
  PLATFORM_SIGNATURE_ID,
  MIN_SIGNATURES_REQUIRED,
  REP_VOTE_THRESHOLD_PERCENT,
  UserType,
  OrderStatus,
  MilestoneStatus,
  generateId
} from './constants.js';

/**
 * Base User class
 */
class User {
  constructor(name, userType) {
    this.user_id = generateId(`${userType.toLowerCase()}_`);
    this.name = name;
    this.user_type = userType;
    this.balance = 0;
    console.log(`${userType} '${name}' created with ID: ${this.user_id}`);
  }
  
  _changeBalance(amount) {
    if (this.balance + amount < 0) {
      console.log(`Error: Insufficient balance for ${this.name} (${this.user_id}).`);
      return false;
    }
    this.balance += amount;
    console.log(`Balance updated for ${this.name} (${this.user_id}): ${this.balance.toFixed(2)}`);
    return true;
  }
  
  viewBalance() {
    console.log(`--- Balance for ${this.name} (${this.user_id}) ---`);
    console.log(`Current Balance: ${this.balance.toFixed(2)}`);
    console.log('-'.repeat(30));
    
    return {
      name: this.name,
      userId: this.user_id,
      balance: this.balance
    };
  }
  
  toJSON() {
    return {
      user_id: this.user_id,
      name: this.name,
      user_type: this.user_type,
      balance: this.balance
    };
  }
}

/**
 * Customer class (extends User)
 */
class Customer extends User {
  constructor(name) {
    super(name, UserType.CUSTOMER);
    this.orders_created = {}; // order_id: Order
    this.orders_joined = {};  // order_id: contributed_amount
  }
  
  deposit(amount) {
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      console.log("Error: Deposit amount must be positive.");
      return false;
    }
    console.log(`Attempting deposit of ${amount.toFixed(2)} for ${this.name}...`);
    return this._changeBalance(amount);
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      orders_created: Object.keys(this.orders_created),
      orders_joined: this.orders_joined
    };
  }
}

/**
 * Contractor class (extends User)
 */
class Contractor extends User {
  constructor(name) {
    super(name, UserType.CONTRACTOR);
    this.assigned_orders = new Set(); // set of order_ids
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      assigned_orders: Array.from(this.assigned_orders)
    };
  }
}

/**
 * Milestone class
 */
class Milestone {
  constructor(description, amount) {
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Milestone amount must be positive.");
    }
    
    this.milestone_id = generateId("ms_");
    this.description = description;
    this.amount = amount;
    this.status = MilestoneStatus.PENDING;
    this.act = null;
  }
  
  toJSON() {
    return {
      milestone_id: this.milestone_id,
      description: this.description,
      amount: this.amount,
      status: this.status,
      act: this.act ? this.act.toJSON() : null
    };
  }
}

/**
 * Act class for milestone completion
 */
class Act {
  constructor(milestone_id, order_id) {
    this.act_id = generateId("act_");
    this.milestone_id = milestone_id;
    this.order_id = order_id;
    this.signatures = new Set();
    this.is_complete = false;
    console.log(`Act ${this.act_id} created for Milestone ${milestone_id} in Order ${order_id}.`);
  }
  
  addSignature(signer_id) {
    if (this.is_complete) {
      console.log(`Act ${this.act_id} is already complete. No more signatures needed.`);
      return false;
    }
    
    if (this.signatures.has(signer_id)) {
      console.log(`Warning: ${signer_id} has already signed Act ${this.act_id}.`);
      return false;
    }
    
    this.signatures.add(signer_id);
    console.log(`Signature from '${signer_id}' added to Act ${this.act_id}.`);
    this.checkCompletion();
    return true;
  }
  
  checkCompletion() {
    if (this.signatures.size >= MIN_SIGNATURES_REQUIRED) {
      this.is_complete = true;
      console.log(`Act ${this.act_id} is now complete with ${this.signatures.size} signatures.`);
    }
    return this.is_complete;
  }
  
  toJSON() {
    return {
      act_id: this.act_id,
      milestone_id: this.milestone_id,
      order_id: this.order_id,
      signatures: Array.from(this.signatures),
      is_complete: this.is_complete
    };
  }
}

/**
 * Order class for escrow
 */
class Order {
  constructor(creator_id, contractor_id, milestonesData) {
    this.order_id = generateId('order');
    this.creator_id = creator_id;
    this.contractor_id = contractor_id || '';
    this.status = OrderStatus.PENDING;
    this.escrow_balance = 0;
    this.total_cost = 0;
    this.milestones = {};
    this.contributions = {};
    this.representative_id = creator_id; // Initially, the creator is the representative
    this.votes = {}; // Mapping of user_id -> candidate_id
    
    // Initialize with milestones
    if (Array.isArray(milestonesData)) {
      for (const [description, amount] of milestonesData) {
        if (typeof amount !== 'number' || amount <= 0) {
          throw new Error(`Invalid milestone amount: ${amount}`);
        }
        
        const milestone = new Milestone(description, amount);
        this.milestones[milestone.milestone_id] = milestone;
        this.total_cost += amount;
      }
    }
    
    console.log(`Creating Order ${this.order_id} by Customer ${creator_id} for Contractor ${contractor_id}.`);
    console.log(`Order ${this.order_id} created. Total Cost: ${this.total_cost.toFixed(2)}, Representative: ${this.representative_id}`);
  }
  
  addContribution(customer_id, amount) {
    if (this.status !== OrderStatus.PENDING) {
      console.log(`Error: Order ${this.order_id} is not pending contributions (Status: ${this.status}).`);
      return false;
    }
    
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      console.log("Error: Contribution amount must be positive.");
      return false;
    }
    
    this.escrow_balance += amount;
    this.contributions[customer_id] = (this.contributions[customer_id] || 0) + amount;
    console.log(`Contribution of ${amount.toFixed(2)} from Customer ${customer_id} added to Order ${this.order_id}.`);
    console.log(`  Order ${this.order_id} Escrow: ${this.escrow_balance.toFixed(2)} / ${this.total_cost.toFixed(2)}`);
    this.checkFundingStatus();
    return true;
  }
  
  checkFundingStatus() {
    if (this.status === OrderStatus.PENDING && this.escrow_balance >= this.total_cost) {
      this.status = OrderStatus.FUNDED;
      console.log(`Order ${this.order_id} is now fully FUNDED!`);
    }
    return this.status;
  }
  
  getMilestone(milestone_id) {
    return this.milestones[milestone_id];
  }
  
  markMilestoneCompleteByContractor(milestoneId) {
    // Проверяем, есть ли контрактор для этого заказа
    if (!this.contractor_id) {
      console.log(`Error: Order ${this.order_id} has no assigned contractor. Cannot mark milestones complete.`);
      return false;
    }
    
    // Проверяем статус заказа
    if (![OrderStatus.FUNDED, OrderStatus.IN_PROGRESS].includes(this.status)) {
      console.log(`Error: Order ${this.order_id} is not in FUNDED or IN_PROGRESS status (Current: ${this.status}). Contractor cannot mark milestones.`);
      return false;
    }
    
    // Получаем объект milestone
    const milestone = this.getMilestone(milestoneId);
    if (!milestone) {
      console.log(`Error: Milestone ${milestoneId} not found in order ${this.order_id}.`);
      return false;
    }
    
    if (milestone.status !== MilestoneStatus.PENDING) {
      console.log(`Error: Milestone ${milestoneId} is not in PENDING status (Current: ${milestone.status}).`);
      return false;
    }
    
    // Создаем акт выполнения работ
    milestone.status = MilestoneStatus.COMPLETED_BY_CONTRACTOR;
    milestone.act = new Act(milestoneId, this.order_id);
    
    // Добавляем подпись исполнителя
    milestone.act.addSignature(this.contractor_id);
    
    // Обновляем статус заказа, если еще не в процессе
    if (this.status === OrderStatus.FUNDED) {
      this.status = OrderStatus.IN_PROGRESS;
    }
    
    return true;
  }
  
  releaseFundsForMilestone(milestone) {
    if (!milestone || !milestone.act || !milestone.act.is_complete) {
      console.log(`Error: Cannot release funds. Act for milestone ${milestone?.milestone_id} not complete or doesn't exist.`);
      return [false, 0];
    }
    
    if (milestone.status === MilestoneStatus.PAID) {
      console.log(`Warning: Funds for milestone ${milestone.milestone_id} already released.`);
      return [false, 0];
    }
    
    // Double check status allows payment release
    if (milestone.status !== MilestoneStatus.COMPLETED_BY_CONTRACTOR) {
      console.log(`Error: Milestone ${milestone.milestone_id} is not in '${MilestoneStatus.COMPLETED_BY_CONTRACTOR}' status (Current: ${milestone.status}). Cannot release funds.`);
      return [false, 0];
    }
    
    const amount_to_release = milestone.amount;
    if (this.escrow_balance < amount_to_release) {
      console.log(`CRITICAL ERROR: Insufficient escrow balance (${this.escrow_balance.toFixed(2)}) for milestone ${milestone.milestone_id} amount (${amount_to_release.toFixed(2)}). Order ${this.order_id}`);
      return [false, 0];
    }
    
    this.escrow_balance -= amount_to_release;
    milestone.status = MilestoneStatus.PAID;
    console.log(`Funds (${amount_to_release.toFixed(2)}) released for Milestone ${milestone.milestone_id} ('${milestone.description}') in Order ${this.order_id}.`);
    console.log(`  Order ${this.order_id} New Escrow Balance: ${this.escrow_balance.toFixed(2)}`);
    
    this._checkOrderCompletion();
    return [true, amount_to_release];
  }
  
  _checkOrderCompletion() {
    const all_paid = Object.values(this.milestones).every(ms => ms.status === MilestoneStatus.PAID);
    if (all_paid && this.status !== OrderStatus.COMPLETED) {
      this.status = OrderStatus.COMPLETED;
      console.log(`Order ${this.order_id} is now fully COMPLETED.`);
    }
  }
  
  addVote(voter_id, candidate_id) {
    if (!this.contributions[voter_id]) {
      console.log(`Error: Voter ${voter_id} has not contributed to Order ${this.order_id}.`);
      return false;
    }
    
    if (!this.contributions[candidate_id]) {
      console.log(`Error: Candidate ${candidate_id} has not contributed to Order ${this.order_id}.`);
      return false;
    }
    
    this.votes[voter_id] = candidate_id;
    console.log(`Vote recorded: ${voter_id} votes for ${candidate_id} in Order ${this.order_id}.`);
    this.checkVotes();
    return true;
  }
  
  checkVotes() {
    console.log(`Checking votes for representative change in Order ${this.order_id}...`);
    const candidate_support = {}; // candidate_id -> total contribution amount of supporters
    let total_contributed_by_voters = 0;
    
    for (const [voter_id, candidate_id] of Object.entries(this.votes)) {
      const voter_contribution = this.contributions[voter_id] || 0;
      candidate_support[candidate_id] = (candidate_support[candidate_id] || 0) + voter_contribution;
      total_contributed_by_voters += voter_contribution;
    }
    
    // 75% of the total cost threshold
    const threshold_amount = (this.total_cost * REP_VOTE_THRESHOLD_PERCENT) / 100.0;
    
    console.log(`  Vote support totals:`, candidate_support);
    console.log(`  Total Order Cost (Base for %): ${this.total_cost.toFixed(2)}`);
    console.log(`  Required support amount (>= ${REP_VOTE_THRESHOLD_PERCENT}%): ${threshold_amount.toFixed(2)}`);
    
    let successful_candidate = null;
    let max_support = -1;
    
    for (const [candidate_id, support_amount] of Object.entries(candidate_support)) {
      if (support_amount >= threshold_amount) {
        if (support_amount > max_support) {
          successful_candidate = candidate_id;
          max_support = support_amount;
          console.log(`  Candidate ${candidate_id} reached threshold with ${support_amount.toFixed(2)} support!`);
          break; // Take the first one to reach threshold
        }
      }
    }
    
    if (successful_candidate) {
      if (successful_candidate !== this.representative_id) {
        const old_rep = this.representative_id;
        this.representative_id = successful_candidate;
        this.votes = {}; // Reset votes after successful change
        console.log(`Representative CHANGE successful for Order ${this.order_id}!`);
        console.log(`  Old Representative: ${old_rep}`);
        console.log(`  New Representative: ${this.representative_id}`);
        console.log("  Votes have been reset.");
      } else {
        console.log(`  Vote confirms current representative ${this.representative_id}. No change needed.`);
        this.votes = {};
        console.log("  Votes have been reset.");
      }
    } else {
      console.log("  No candidate reached the 75% threshold yet.");
    }
  }
  
  viewStatus() {
    console.log(`\n--- Status for Order ${this.order_id} ---`);
    console.log(`Status: ${this.status}`);
    console.log(`Creator: ${this.creator_id}`);
    console.log(`Contractor: ${this.contractor_id}`);
    console.log(`Representative: ${this.representative_id}`);
    console.log(`Total Cost: ${this.total_cost.toFixed(2)}`);
    console.log(`Escrow Balance: ${this.escrow_balance.toFixed(2)}`);
    
    const funding_pct = (this.total_cost > 0) ? (this.escrow_balance / this.total_cost * 100) : 0;
    console.log(`Funding Progress: ${funding_pct.toFixed(1)}% funded`);
    
    console.log("Contributions:");
    if (Object.keys(this.contributions).length > 0) {
      for (const [cid, amount] of Object.entries(this.contributions)) {
        console.log(`  - ${cid}: ${amount.toFixed(2)}`);
      }
    } else {
      console.log("  (No contributions yet)");
    }
    
    console.log("Current Votes for Representative:");
    if (Object.keys(this.votes).length > 0) {
      for (const [voter, candidate] of Object.entries(this.votes)) {
        console.log(`  - ${voter} voted for ${candidate}`);
      }
    } else {
      console.log("  (No active votes)");
    }
    
    console.log("-".repeat(`--- Status for Order ${this.order_id} ---`.length));
    
    return {
      order_id: this.order_id,
      status: this.status,
      creator_id: this.creator_id,
      contractor_id: this.contractor_id,
      representative_id: this.representative_id,
      total_cost: this.total_cost,
      escrow_balance: this.escrow_balance,
      funding_pct: funding_pct,
      contributions: this.contributions,
      votes: this.votes
    };
  }
  
  viewMilestones() {
    console.log(`--- Milestones for Order ${this.order_id} ---`);
    
    const result = [];
    
    if (Object.keys(this.milestones).length === 0) {
      console.log(" (No milestones defined)");
    } else {
      for (const [ms_id, ms] of Object.entries(this.milestones)) {
        console.log(`  - ID: ${ms_id}`);
        console.log(`    Desc: ${ms.description}`);
        console.log(`    Amount: ${ms.amount.toFixed(2)}`);
        console.log(`    Status: ${ms.status}`);
        
        const milestoneData = {
          milestone_id: ms_id,
          description: ms.description,
          amount: ms.amount,
          status: ms.status,
          act: null
        };
        
        if (ms.act) {
          console.log(`    Act ID: ${ms.act.act_id}`);
          console.log(`    Act Signatures: ${ms.act.signatures.size > 0 ? Array.from(ms.act.signatures).join(', ') : '(None)'}`);
          console.log(`    Act Complete: ${ms.act.is_complete}`);
          
          milestoneData.act = {
            act_id: ms.act.act_id,
            signatures: Array.from(ms.act.signatures),
            is_complete: ms.act.is_complete
          };
        }
        
        result.push(milestoneData);
      }
    }
    
    console.log("-".repeat(`--- Milestones for Order ${this.order_id} ---`.length));
    
    return result;
  }
  
  toJSON() {
    const milestones = {};
    for (const [id, milestone] of Object.entries(this.milestones)) {
      milestones[id] = milestone.toJSON();
    }
    
    return {
      order_id: this.order_id,
      creator_id: this.creator_id,
      contractor_id: this.contractor_id,
      representative_id: this.representative_id,
      milestones: milestones,
      total_cost: this.total_cost,
      escrow_balance: this.escrow_balance,
      status: this.status,
      contributions: this.contributions,
      votes: this.votes
    };
  }
}

// Export all classes
export {
  User,
  Customer,
  Contractor,
  Milestone,
  Act,
  Order
}; 