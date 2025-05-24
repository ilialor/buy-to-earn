// Project Details JavaScript

/**
 * Project Details Page JavaScript
 * 
 * This file contains functionality for the project details page.
 * Includes scroll functionality for navigation between sections,
 * initialization of components, and interactive elements.
 */

/**
 * Scrolls to the specified element on the page
 * @param {string} selector - CSS selector of the target element
 */
function scrollToElement(selector) {
  // Find the target element
  const targetElement = document.querySelector(selector);
  
  // If element exists, scroll to it with smooth animation
  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop - 80, // Add padding for header
      behavior: 'smooth'
    });
  }
}

/**
 * Initialize AIlock buttons functionality
 */
function initAIlockButtons() {
  // Calculate button
  const calculateBtn = document.querySelector('.ailock-calculate-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function() {
      // Заменяем alert на более современное уведомление
      showNotification('AIlock анализирует проект и рассчитывает потенциальную доходность...', 'info');
      
      // Имитация загрузки и расчета
      setTimeout(() => {
        // Показываем результаты в модальном окне или уведомлении
        showNotification('Расчет завершен: Прогнозируемая доходность 215% за 18 месяцев', 'success');
      }, 1500);
    });
  }
  
  // Ask button
  const askBtn = document.querySelector('.ailock-ask-btn');
  if (askBtn) {
    askBtn.addEventListener('click', function() {
      // Заменяем alert на более современное уведомление
      showNotification('AIlock анализирует ваш вопрос...', 'info');
      
      // Имитация обработки запроса
      setTimeout(() => {
        // Показываем результаты в модальном окне
        showAIlockExplanation();
      }, 1000);
    });
  }
}

/**
 * Initialize investment options functionality
 */
function initInvestmentOptions() {
  const investOptions = document.querySelectorAll('.investment-option input');
  const joinButton = document.querySelector('.btn-join');
  
  if (investOptions.length && joinButton) {
    // Update join button text based on selected option
    investOptions.forEach(option => {
      option.addEventListener('change', function() {
        const price = this.closest('.investment-option')
          .querySelector('.option-price').textContent;
        joinButton.textContent = `Инвестировать ${price}`;
        
        // Анимация выбранного варианта
        const allOptions = document.querySelectorAll('.investment-option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        this.closest('.investment-option').classList.add('selected');
      });
    });
    
    // Join button click handler
    joinButton.addEventListener('click', function() {
      const selectedOption = document.querySelector('input[name="investment-option"]:checked');
      if (selectedOption) {
        const optionTitle = selectedOption.closest('.investment-option')
          .querySelector('.option-title').textContent;
        const optionPrice = selectedOption.closest('.investment-option')
          .querySelector('.option-price').textContent;
        
        // Заменяем alert на более современное уведомление
        showNotification(`Вы выбрали пакет "${optionTitle}" стоимостью ${optionPrice}`, 'success');
        
        // Имитация перехода к оплате
        setTimeout(() => {
          showNotification('Переход к системе оплаты...', 'info');
        }, 1500);
      } else {
        showNotification('Пожалуйста, выберите вариант инвестирования', 'warning');
      }
    });
  }
}

/**
 * Initialize dashboard functionality
 */
function initDashboard() {
  // Dashboard refresh button
  const refreshBtn = document.querySelector('.btn-dashboard-action:nth-child(1)');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      // Показываем анимацию обновления
      this.querySelector('i').classList.add('fa-spin');
      
      // Имитация обновления данных
      setTimeout(() => {
        this.querySelector('i').classList.remove('fa-spin');
        showNotification('Данные дашборда обновлены', 'success');
        
        // Обновляем некоторые метрики с небольшими изменениями
        const investorsValue = document.querySelector('.dashboard-metric-card:nth-child(2) .metric-value');
        if (investorsValue) {
          const currentValue = parseInt(investorsValue.textContent);
          investorsValue.textContent = currentValue + Math.floor(Math.random() * 5);
        }
      }, 1000);
    });
  }
  
  // Dashboard fullscreen button
  const fullscreenBtn = document.querySelector('.btn-dashboard-action:nth-child(3)');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
      const dashboard = document.querySelector('.project-dashboard');
      if (dashboard) {
        dashboard.classList.toggle('fullscreen');
        
        // Изменяем иконку в зависимости от состояния
        const icon = this.querySelector('i');
        if (dashboard.classList.contains('fullscreen')) {
          icon.classList.remove('fa-expand');
          icon.classList.add('fa-compress');
        } else {
          icon.classList.remove('fa-compress');
          icon.classList.add('fa-expand');
        }
      }
    });
  }
}

// Make the function globally available
window.scrollToElement = scrollToElement;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initAIlockButtons();
  initInvestmentOptions();
  initDashboard();
  
  // Загружаем расширенную функциональность
  loadEnhancedFunctionality();
  
  // Initialize similar projects hover effects
  const projectCards = document.querySelectorAll('.similar-project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
});

/**
 * Load enhanced functionality if script exists
 */
function loadEnhancedFunctionality() {
  // Динамически загружаем расширенный скрипт
  const enhancedScript = document.createElement('script');
  enhancedScript.src = 'js/project-details-enhanced.js';
  enhancedScript.onload = function() {
    console.log('Enhanced functionality loaded successfully');
  };
  enhancedScript.onerror = function() {
    console.error('Failed to load enhanced functionality');
  };
  document.head.appendChild(enhancedScript);
  
  // Загружаем расширенные стили
  const enhancedStyles = document.createElement('link');
  enhancedStyles.rel = 'stylesheet';
  enhancedStyles.href = 'styles/project-details-enhanced.css';
  document.head.appendChild(enhancedStyles);
}
