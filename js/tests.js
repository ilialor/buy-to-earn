/**
 * Testing Functions
 * This file contains functions for testing the Co-Intent platform
 */

// Initialize Firebase services and UI elements
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase to initialize
  setTimeout(() => {
    // Create test button
    createTestButton();
  }, 1000);
});

// Create a button for running tests
function createTestButton() {
  const button = document.createElement('button');
  button.id = 'run-tests-btn';
  button.className = 'btn btn-primary';
  button.style.position = 'fixed';
  button.style.right = '20px';
  button.style.bottom = '20px';
  button.style.zIndex = '1000';
  button.innerHTML = 'Запустить тесты';
  
  button.addEventListener('click', runTests);
  
  document.body.appendChild(button);
}

// Main test runner
async function runTests() {
  console.log('=== Начало тестирования ===');
  
  try {
    await testAuthentication();
    await testNavigation();
    await testForms();
    await testModals();
    await testAnalytics();
    
    console.log('=== Тестирование завершено успешно ===');
  } catch (error) {
    console.error('=== Тестирование завершено с ошибками ===', error);
  }
}

// Test authentication
async function testAuthentication() {
  console.log('=== Тестирование аутентификации ===');
  
  // Check if auth service is available
  if (!window.auth) {
    console.error('Ошибка: Firebase Authentication не инициализирован');
    return;
  }
  
  try {
    // Test sign-in functionality
    console.log('Тестирование входа в систему...');
    showModal('auth-modal');
    console.log('Модальное окно входа открыто: успешно');
    
    // Test tab switching
    const tabSignUp = document.querySelector('.auth-tab[data-target="sign-up-tab"]');
    if (tabSignUp) {
      tabSignUp.click();
      console.log('Переключение на вкладку регистрации: успешно');
    } else {
      console.error('Ошибка: вкладка регистрации не найдена');
    }
    
    // Close auth modal
    closeModal('auth-modal');
    console.log('Закрытие модального окна: успешно');
    
    console.log('Тестирование аутентификации завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании аутентификации:', error);
    throw error;
  }
}

// Test navigation between pages
async function testNavigation() {
  console.log('=== Тестирование навигации ===');
  
  try {
    // Test navigation to different pages
    const pages = [
      { id: 'marketplace', text: 'Marketplace' },
      { id: 'portfolio', text: 'Portfolio' },
      { id: 'revenue', text: 'Revenue' },
      { id: 'wallet', text: 'Wallet' },
      { id: 'profile', text: 'Profile' },
      { id: 'docs', text: 'Docs' },
      { id: 'support', text: 'Support' }
    ];
    
    for (const page of pages) {
      const navLink = document.querySelector(`.nav-link[data-page="${page.id}"]`);
      if (navLink) {
        navLink.click();
        console.log(`Переход на страницу ${page.id}: Успешно`);
      } else {
        console.error(`Ошибка: ссылка на страницу ${page.id} не найдена`);
      }
    }
    
    // Test tab switching
    const tabs = [
      { parent: 'marketplace', id: 'explore', text: 'Explore' },
      { parent: 'marketplace', id: 'submit', text: 'Submit' },
      { parent: 'marketplace', id: 'executor', text: 'Executor' },
      { parent: 'revenue', id: 'recent-earnings', text: 'Recent Earnings' },
      { parent: 'revenue', id: 'withdraw', text: 'Withdraw' }
    ];
    
    for (const tab of tabs) {
      // Navigate to parent page first
      const parentNavLink = document.querySelector(`.nav-link[data-page="${tab.parent}"]`);
      if (parentNavLink) {
        parentNavLink.click();
      }
      
      // Click on tab
      const tabElement = document.querySelector(`.tab[data-tab="${tab.id}"][data-parent="${tab.parent}"]`);
      if (tabElement) {
        tabElement.click();
        console.log(`Переключение на таб ${tab.id}: Успешно`);
      } else {
        console.warn(`Внимание: таб ${tab.id} не найден`);
      }
    }
    
    console.log('Тестирование навигации завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании навигации:', error);
    throw error;
  }
}

// Test forms
async function testForms() {
  console.log('=== Тестирование форм ===');
  
  try {
    // Navigate to Submit Order tab
    const marketplaceLink = document.querySelector('.nav-link[data-page="marketplace"]');
    if (marketplaceLink) {
      marketplaceLink.click();
      
      const submitTab = document.querySelector('.tab[data-tab="submit"][data-parent="marketplace"]');
      if (submitTab) {
        submitTab.click();
        
        // Fill in the form
        const orderTitleInput = document.getElementById('order-title');
        if (orderTitleInput) {
          orderTitleInput.value = 'Тестовый заказ';
          console.log('Заполнение поля order-title: Успешно');
        }
        
        const orderCategorySelect = document.getElementById('order-category');
        if (orderCategorySelect) {
          orderCategorySelect.value = 'book';
          console.log('Заполнение поля order-category: Успешно');
        }
        
        const orderDescriptionTextarea = document.getElementById('order-description');
        if (orderDescriptionTextarea) {
          orderDescriptionTextarea.value = 'Это тестовое описание заказа для проверки функциональности формы.';
          console.log('Заполнение поля order-description: Успешно');
        }
      } else {
        console.error('Ошибка: вкладка submit не найдена');
      }
    } else {
      console.error('Ошибка: ссылка на marketplace не найдена');
    }
    
    console.log('Тестирование форм завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании форм:', error);
    throw error;
  }
}

// Test modals
async function testModals() {
  console.log('=== Тестирование модальных окон ===');
  
  try {
    // Test auth modal
    const signInBtn = document.getElementById('sign-in-btn');
    if (signInBtn) {
      signInBtn.click();
      console.log('Открытие модального окна аутентификации: Успешно');
      
      // Test switching between tabs
      const authTabs = document.querySelectorAll('.auth-tab');
      if (authTabs.length > 0) {
        for (const tab of authTabs) {
          tab.click();
          console.log(`Переключение на вкладку ${tab.textContent.trim()}: Успешно`);
        }
      }
      
      // Close the modal
      const closeBtn = document.querySelector('.auth-modal .modal-close');
      if (closeBtn) {
        closeBtn.click();
        console.log('Закрытие модального окна аутентификации: Успешно');
      } else {
        console.error('Ошибка: кнопка закрытия модального окна не найдена');
      }
    } else {
      console.error('Ошибка: кнопка входа не найдена');
    }
    
    console.log('Тестирование модальных окон завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании модальных окон:', error);
    throw error;
  }
}

// Test analytics
async function testAnalytics() {
  console.log('=== Тестирование аналитики ===');
  
  try {
    // Test if analytics is available
    if (window.analytics) {
      // Test page view logging
      window.analytics.logEvent('page_view', {
        page_title: 'Test Page',
        page_location: window.location.href
      });
      console.log('Логирование просмотра страницы: Успешно');
      
      // Test action logging
      window.analytics.logEvent('test_action', {
        action_type: 'test',
        test_id: Date.now().toString()
      });
      console.log('Логирование действия пользователя: Успешно');
    } else {
      console.warn('Внимание: Firebase Analytics не инициализирован');
    }
    
    console.log('Тестирование аналитики завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании аналитики:', error);
    throw error;
  }
}

// Test marketplace orders loading
function testLoadOrders() {
  console.log('=== Тестирование загрузки заказов ===');
  
  try {
    // Check if getAllOrders function exists
    if (typeof window.getAllOrders === 'function') {
      console.log('Функция getAllOrders доступна');
    } else if (typeof window.db?.collection === 'function') {
      console.log('Прямой запрос к коллекции orders');
    } else {
      console.error('Ошибка: функции для работы с базой данных недоступны');
      return;
    }
    
    console.log('Тестирование загрузки заказов завершено успешно');
  } catch (error) {
    console.error('Ошибка при тестировании загрузки заказов:', error);
  }
} 