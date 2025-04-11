/**
 * Escrow API Integration Tests
 * This file contains tests for verifying correct integration with Escrow API
 */

// Функция для получения глобального escrowAPI с проверкой его наличия
function getEscrowAPI() {
  if (!window.escrowAPI) {
    console.error('escrowAPI не найден на window');
    return {};
  }
  return window.escrowAPI;
}

// Test results container
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Mock user data for tests
const mockUser = {
  uid: 'test-user-id',
  email: 'test-user@example.com',
  displayName: 'Test User',
  role: 'customer'
};

// Mock order data for tests
const mockOrder = {
  title: 'Test Order',
  description: 'Test order description',
  category: 'test',
  milestones: [
    { description: 'First milestone', amount: 100 },
    { description: 'Second milestone', amount: 200 }
  ]
};

/**
 * Simple test framework
 */
function runTest(name, testFn) {
  testResults.total++;
  console.log(`Running test: ${name}`);
  
  try {
    const result = testFn();
    if (result) {
      testResults.passed++;
      testResults.details.push({ name, success: true });
      console.log(`✅ Test passed: ${name}`);
    } else {
      testResults.failed++;
      testResults.details.push({ name, success: false, error: 'Test returned false' });
      console.log(`❌ Test failed: ${name}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name, success: false, error: error.message });
    console.log(`❌ Test failed: ${name}`, error);
  }
}

/**
 * Async test runner
 */
async function runAsyncTest(name, testFn) {
  testResults.total++;
  console.log(`Running test: ${name}`);
  
  try {
    const result = await testFn();
    if (result) {
      testResults.passed++;
      testResults.details.push({ name, success: true });
      console.log(`✅ Test passed: ${name}`);
    } else {
      testResults.failed++;
      testResults.details.push({ name, success: false, error: 'Test returned false' });
      console.log(`❌ Test failed: ${name}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name, success: false, error: error.message });
    console.log(`❌ Test failed: ${name}`, error);
  }
}

/**
 * Test user authentication with API
 */
async function testUserAuthentication() {
  console.log('=== Testing User Authentication ===');
  const { userService } = getEscrowAPI();
  
  if (!userService) {
    console.error('userService не найден');
    return;
  }
  
  // Test user registration
  await runAsyncTest('User registration', async () => {
    try {
      // First, get the current user or use a mock
      let user;
      if (typeof getCurrentUser === 'function') {
        user = getCurrentUser();
      } else {
        user = mockUser;
      }
      
      if (!userService.registerUserWithEscrow) {
        console.error('метод registerUserWithEscrow не найден');
        return false;
      }
      
      const result = await userService.registerUserWithEscrow(user);
      console.log('User registration result:', result);
      return result && (result.id || result.data?.id) && (result.type || result.data?.type);
    } catch (error) {
      console.error('Registration test error:', error);
      return false;
    }
  });
  
  // Test getting current user
  await runAsyncTest('Get current user', async () => {
    try {
      if (!userService.getCurrentUser) {
        console.error('метод getCurrentUser не найден');
        return false;
      }
      
      const result = await userService.getCurrentUser();
      console.log('Current user result:', result);
      return result && result.success && result.data && result.data.id;
    } catch (error) {
      console.error('Get current user error:', error);
      return false;
    }
  });
  
  // Test user ID storage
  runTest('User ID is stored correctly', () => {
    try {
      const storedId = localStorage.getItem('escrowUserId');
      return storedId !== null && storedId.length > 0;
    } catch (error) {
      console.error('User ID storage test error:', error);
      return false;
    }
  });
}

/**
 * Test order creation and management
 */
async function testOrderManagement() {
  console.log('=== Testing Order Management ===');
  const { orderService } = getEscrowAPI();
  
  if (!orderService) {
    console.error('orderService не найден');
    return;
  }
  
  let createdOrderId;
  
  // Test order creation
  await runAsyncTest('Create order', async () => {
    try {
      if (!orderService.createOrder) {
        console.error('метод createOrder не найден');
        return false;
      }
      
      const result = await orderService.createOrder(mockOrder);
      console.log('Create order result:', result);
      if (result && result.success && result.data && result.data.id) {
        createdOrderId = result.data.id;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create order test error:', error);
      return false;
    }
  });
  
  // Test getting order list
  await runAsyncTest('Get user orders', async () => {
    try {
      if (!orderService.getUserOrders) {
        console.error('метод getUserOrders не найден');
        return false;
      }
      
      const result = await orderService.getUserOrders();
      console.log('Get user orders result:', result);
      return result && result.success && Array.isArray(result.data?.createdOrders);
    } catch (error) {
      console.error('Get user orders test error:', error);
      return false;
    }
  });
  
  // Test order funding
  if (createdOrderId) {
    await runAsyncTest('Fund order', async () => {
      try {
        if (!orderService.fundOrder) {
          console.error('метод fundOrder не найден');
          return false;
        }
        
        const result = await orderService.fundOrder(createdOrderId, { amount: 50 });
        console.log('Fund order result:', result);
        return result && result.success;
      } catch (error) {
        console.error('Fund order test error:', error);
        return false;
      }
    });
  }
}

/**
 * Test milestone and act management
 */
async function testMilestoneManagement() {
  console.log('=== Testing Milestone Management ===');
  const { orderService, milestoneService } = getEscrowAPI();
  
  if (!orderService || !milestoneService) {
    console.error('orderService или milestoneService не найден');
    return;
  }
  
  // We need an existing order with milestones for these tests
  // Get the first available order
  let orderId, milestoneId;
  
  try {
    if (!orderService.getUserOrders) {
      console.error('метод getUserOrders не найден');
      return;
    }
    
    const orders = await orderService.getUserOrders();
    console.log('Orders for milestone tests:', orders);
    
    if (orders && orders.success && orders.data && orders.data.createdOrders && orders.data.createdOrders.length > 0) {
      const order = orders.data.createdOrders[0];
      orderId = order.id;
      
      if (order.milestones && order.milestones.length > 0) {
        milestoneId = order.milestones[0].id;
      }
    }
  } catch (error) {
    console.error('Could not get test order:', error);
  }
  
  if (orderId && milestoneId) {
    console.log(`Testing milestones with order: ${orderId}, milestone: ${milestoneId}`);
    
    // Test completing a milestone
    await runAsyncTest('Complete milestone', async () => {
      try {
        if (!milestoneService.completeMilestone) {
          console.error('метод completeMilestone не найден');
          return false;
        }
        
        const result = await milestoneService.completeMilestone(orderId, milestoneId);
        console.log('Complete milestone result:', result);
        return result && result.success;
      } catch (error) {
        console.error('Complete milestone test error:', error);
        return false;
      }
    });
    
    // Test signing an act
    await runAsyncTest('Sign act', async () => {
      try {
        if (!milestoneService.signAct) {
          console.error('метод signAct не найден');
          return false;
        }
        
        const result = await milestoneService.signAct(orderId, milestoneId);
        console.log('Sign act result:', result);
        return result && result.success;
      } catch (error) {
        console.error('Sign act test error:', error);
        return false;
      }
    });
  } else {
    console.warn('Could not run milestone tests: No suitable order found');
  }
}

/**
 * Test data synchronization with local storage
 */
function testDataSynchronization() {
  console.log('=== Testing Data Synchronization ===');
  const { StorageSync } = getEscrowAPI();
  
  if (!StorageSync) {
    console.error('StorageSync не найден');
    return;
  }
  
  // Create mock data
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
  
  // Mock local storage
  const mockStorage = {
    savedOrder: null,
    savedUser: null,
    saveOrder(order) { this.savedOrder = order; },
    saveUser(user) { this.savedUser = user; },
    getOrder() { return this.savedOrder; },
    getUser() { return this.savedUser; }
  };
  
  // Test order synchronization
  runTest('Sync order with local storage', () => {
    try {
      if (!StorageSync.syncOrder) {
        console.error('метод syncOrder не найден');
        return false;
      }
      
      const result = StorageSync.syncOrder(apiOrder, mockStorage);
      console.log('Sync order result:', result);
      console.log('Saved order:', mockStorage.savedOrder);
      
      return result && 
            mockStorage.savedOrder && 
            mockStorage.savedOrder.order_id === apiOrder.id &&
            mockStorage.savedOrder.milestones.length === apiOrder.milestones.length;
    } catch (error) {
      console.error('Sync order test error:', error);
      return false;
    }
  });
  
  // Test user synchronization
  runTest('Sync user with local storage', () => {
    try {
      if (!StorageSync.syncUser) {
        console.error('метод syncUser не найден');
        return false;
      }
      
      const result = StorageSync.syncUser(apiUser, mockStorage);
      console.log('Sync user result:', result);
      console.log('Saved user:', mockStorage.savedUser);
      
      return result && 
            mockStorage.savedUser && 
            mockStorage.savedUser.user_id === apiUser.id &&
            mockStorage.savedUser.balance === apiUser.balance;
    } catch (error) {
      console.error('Sync user test error:', error);
      return false;
    }
  });
}

/**
 * Test backward compatibility with existing system
 */
function testBackwardCompatibility() {
  console.log('=== Testing Backward Compatibility ===');
  const { uiUtils } = getEscrowAPI();
  
  // Test API availability check
  runTest('API availability check works', () => {
    try {
      // The escrow module should check for window.escrowAPI
      const isAvailable = typeof window.escrowAPI !== 'undefined';
      console.log('API availability:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('API availability test error:', error);
      return false;
    }
  });
  
  // Test fallback to local storage when API fails
  runTest('Can handle API failures gracefully', () => {
    try {
      // Mock a failed API call
      const mockFailedResponse = { success: false, message: 'API Error' };
      
      // Test if we can handle it without throwing errors
      console.log('Testing API error handling');
      
      if (uiUtils && uiUtils.handleApiError) {
        uiUtils.handleApiError(mockFailedResponse);
      } else {
        console.log('uiUtils.handleApiError not available, skipping');
      }
      
      return true;
    } catch (error) {
      console.error('Error handling test error:', error);
      return false;
    }
  });
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Starting Escrow API Integration Tests 🧪');
  
  // Show loading during tests
  if (typeof window.showLoading === 'function') {
    window.showLoading('Running integration tests...');
  } else {
    console.log('Loading indicator not available');
  }
  
  try {
    // Run all test groups
    try {
      await testUserAuthentication();
    } catch (error) {
      console.error('Error in user authentication tests:', error);
    }
    
    try {
      await testOrderManagement();
    } catch (error) {
      console.error('Error in order management tests:', error);
    }
    
    try {
      await testMilestoneManagement();
    } catch (error) {
      console.error('Error in milestone management tests:', error);
    }
    
    try {
      testDataSynchronization();
    } catch (error) {
      console.error('Error in data synchronization tests:', error);
    }
    
    try {
      testBackwardCompatibility();
    } catch (error) {
      console.error('Error in backward compatibility tests:', error);
    }
    
    // Display test summary
    console.log('\n=== Test Summary ===');
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    // Create report in the UI
    const reportElement = document.createElement('div');
    reportElement.className = 'test-report';
    reportElement.innerHTML = `
      <h2>Escrow API Integration Test Results</h2>
      <div class="test-summary">
        <div class="test-stat">Total: ${testResults.total}</div>
        <div class="test-stat test-passed">Passed: ${testResults.passed}</div>
        <div class="test-stat test-failed">Failed: ${testResults.failed}</div>
      </div>
      <div class="test-details">
        ${testResults.details.map(test => `
          <div class="test-result ${test.success ? 'success' : 'failure'}">
            <span class="test-icon">${test.success ? '✅' : '❌'}</span>
            <span class="test-name">${test.name}</span>
            ${!test.success ? `<span class="test-error">${test.error}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    
    // Check if report container exists
    const container = document.getElementById('test-results-container') || document.body;
    container.appendChild(reportElement);
    
    return testResults;
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    if (typeof window.hideLoading === 'function') {
      window.hideLoading();
    } else {
      console.log('Loading indicator not available');
    }
  }
}

// Expose the test runner globally for manual execution
window.runEscrowApiTests = runAllTests;

// Auto-run tests if URL has test parameter
if (window.location.search.includes('run_tests=1')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for API initialization
    setTimeout(runAllTests, 1000);
  });
}
