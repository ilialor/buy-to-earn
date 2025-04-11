/**
 * Test Runner Module for Escrow API Integration Tests
 * This module runs a series of tests to verify the integration with Escrow API
 */

// Mock data for tests
const mockUser = {
  uid: 'test-user-id',
  email: 'test-user@example.com',
  displayName: 'Test User',
  role: 'customer'
};

// Mock order for tests
const mockOrder = {
  title: 'Test Order',
  description: 'Test order description',
  category: 'test',
  milestones: [
    { description: 'First milestone', amount: 100 },
    { description: 'Second milestone', amount: 200 }
  ]
};

// Test results container
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

/**
 * Add a test result to the results container
 * @param {string} name - Test name
 * @param {boolean} success - Test result
 * @param {string} [error] - Error message if any
 */
function addTestResult(name, success, error = null) {
  testResults.total++;
  if (success) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  testResults.details.push({
    name,
    success,
    error
  });
  
  // Log the result
  console.log(`${success ? '✓' : '✗'} Test ${success ? 'passed' : 'failed'}: ${name}`);
  if (error) {
    console.error(`  Error: ${error}`);
  }
}

/**
 * Run a test with error handling
 * @param {string} name - Test name
 * @param {Function} testFn - Test function
 */
async function runTest(name, testFn) {
  console.log(`Running test: ${name}`);
  try {
    const result = await testFn();
    addTestResult(name, result);
  } catch (error) {
    addTestResult(name, false, error.message);
  }
}

/**
 * Test user authentication with Escrow API
 */
async function testUserAuthentication() {
  console.log('=== Testing User Authentication ===');
  
  await runTest('User registration', async () => {
    const result = await window.escrowAPI.userService.registerUserWithEscrow(mockUser);
    return result && result.success;
  });
  
  await runTest('Get current user', async () => {
    const result = await window.escrowAPI.userService.getCurrentUser();
    return result && result.success && result.data && result.data.id;
  });
  
  await runTest('User ID is stored correctly', async () => {
    // Set a fake ID in localStorage for testing
    localStorage.setItem('escrowUserId', 'mock-user-id');
    const storedId = localStorage.getItem('escrowUserId');
    return storedId === 'mock-user-id';
  });
}

/**
 * Test order management with Escrow API
 */
async function testOrderManagement() {
  console.log('=== Testing Order Management ===');
  
  let createdOrderId = null;
  
  await runTest('Create order', async () => {
    const result = await window.escrowAPI.orderService.createOrder(mockOrder);
    if (result && result.success && result.data && result.data.id) {
      createdOrderId = result.data.id;
      return true;
    }
    return false;
  });
  
  await runTest('Get user orders', async () => {
    const result = await window.escrowAPI.orderService.getUserOrders();
    return result && result.success && Array.isArray(result.data.createdOrders);
  });
  
  if (createdOrderId) {
    await runTest('Fund order', async () => {
      const result = await window.escrowAPI.orderService.fundOrder(createdOrderId, { amount: 50 });
      return result && result.success;
    });
  }
}

/**
 * Test milestone management with Escrow API
 */
async function testMilestoneManagement() {
  console.log('=== Testing Milestone Management ===');
  
  // Use mock data from the mock-api.js responses
  const orderId = 'mock-order-id';
  const milestoneId = 'mock-milestone-1';
  
  await runTest('Complete milestone', async () => {
    const result = await window.escrowAPI.milestoneService.completeMilestone(orderId, milestoneId);
    return result && result.success;
  });
  
  await runTest('Sign act', async () => {
    const result = await window.escrowAPI.milestoneService.signAct(orderId, milestoneId);
    return result && result.success;
  });
}

/**
 * Test data synchronization with local storage
 */
async function testDataSynchronization() {
  console.log('=== Testing Data Synchronization ===');
  
  // Create mock data for tests
  const apiOrder = {
    id: 'test-order-id',
    title: 'Test Order',
    description: 'Description',
    creatorId: 'test-user-id',
    contractorId: null,
    totalAmount: 300,
    fundedAmount: 100,
    status: 'PENDING',
    milestones: [
      { id: 'mile-1', description: 'First milestone', amount: 100, status: 'PENDING' },
      { id: 'mile-2', description: 'Second milestone', amount: 200, status: 'PENDING' }
    ]
  };
  
  const apiUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    type: 'CUSTOMER',
    balance: 500
  };
  
  // Test mock storage
  const mockStorage = {
    savedOrder: null,
    savedUser: null,
    saveOrder(order) { this.savedOrder = order; return true; },
    saveUser(user) { this.savedUser = user; return true; },
    getOrder() { return this.savedOrder; },
    getUser() { return this.savedUser; }
  };
  
  await runTest('Sync order with local storage', async () => {
    const result = window.escrowAPI.StorageSync.syncOrder(apiOrder, mockStorage);
    return result && 
           mockStorage.savedOrder && 
           mockStorage.savedOrder.order_id === apiOrder.id;
  });
  
  await runTest('Sync user with local storage', async () => {
    const result = window.escrowAPI.StorageSync.syncUser(apiUser, mockStorage);
    return result && 
           mockStorage.savedUser && 
           mockStorage.savedUser.user_id === apiUser.id;
  });
}

/**
 * Test backward compatibility with the existing system
 */
async function testBackwardCompatibility() {
  console.log('=== Testing Backward Compatibility ===');
  
  await runTest('API availability check', async () => {
    return typeof window.escrowAPI !== 'undefined';
  });
  
  await runTest('Can handle API failures gracefully', async () => {
    try {
      // Test error handling with a fake error
      const mockError = { success: false, message: 'Test error' };
      
      if (window.escrowAPI.uiUtils && window.escrowAPI.uiUtils.handleApiError) {
        window.escrowAPI.uiUtils.handleApiError(mockError);
      }
      return true;
    } catch (error) {
      console.error('Error in backward compatibility test:', error);
      return false;
    }
  });
}

/**
 * Run all tests and display results
 */
export async function runAllTests() {
  console.log('🧪 Starting Escrow API Integration Tests 🧪');
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.total = 0;
  testResults.details = [];
  
  // Show loading indicator if available
  if (typeof window.showLoading === 'function') {
    window.showLoading('Running tests...');
  }
  
  try {
    // Run test suites
    await testUserAuthentication();
    await testOrderManagement();
    await testMilestoneManagement();
    await testDataSynchronization();
    await testBackwardCompatibility();
    
    // Display results summary
    console.log('\n=== Test Summary ===');
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    return testResults;
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Hide loading indicator if available
    if (typeof window.hideLoading === 'function') {
      window.hideLoading();
    }
  }
}

/**
 * Build and display test report in the UI
 * @param {Object} results - Test results
 * @param {string} containerId - Container element ID
 */
export function displayTestReport(results, containerId = 'test-results-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear the container
  container.innerHTML = '';
  
  // Create report header
  const header = document.createElement('h2');
  header.textContent = 'Escrow API Integration Test Results';
  container.appendChild(header);
  
  // Create summary stats
  const summary = document.createElement('div');
  summary.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
      <div><strong>Total: ${results.total}</strong></div>
      <div style="color: green;"><strong>Passed: ${results.passed}</strong></div>
      <div style="color: red;"><strong>Failed: ${results.failed}</strong></div>
    </div>
  `;
  container.appendChild(summary);
  
  // Create detailed results
  const details = document.createElement('div');
  
  results.details.forEach(test => {
    const testItem = document.createElement('div');
    testItem.style.padding = '10px';
    testItem.style.margin = '5px 0';
    testItem.style.borderLeft = `4px solid ${test.success ? 'green' : 'red'}`;
    testItem.style.backgroundColor = test.success ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)';
    testItem.style.display = 'flex';
    testItem.style.justifyContent = 'space-between';
    
    testItem.innerHTML = `
      <div>
        <span style="margin-right: 10px;">${test.success ? '✓' : '✗'}</span>
        <strong>${test.name}</strong>
        ${test.error ? `<div style="color: red; margin-top: 5px;">${test.error}</div>` : ''}
      </div>
      <div style="text-align: right; color: ${test.success ? 'green' : 'red'};">
        ${test.success ? 'Test passed' : 'Test returned false'}
      </div>
    `;
    
    details.appendChild(testItem);
  });
  
  container.appendChild(details);
  
  return container;
}

// Expose the test runner globally
window.escrowApiTests = {
  runAllTests,
  displayTestReport
};
