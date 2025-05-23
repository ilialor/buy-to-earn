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
      alert('AIlock анализирует проект и рассчитывает потенциальную доходность...');
      // Здесь будет функциональность расчета
    });
  }
  
  // Ask button
  const askBtn = document.querySelector('.ailock-ask-btn');
  if (askBtn) {
    askBtn.addEventListener('click', function() {
      alert('AIlock отвечает на ваши вопросы о распределении доходов...');
      // Здесь будет функциональность ответов на вопросы
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
        
        alert(`Вы выбрали пакет "${optionTitle}" стоимостью ${optionPrice}. Переход к оплате...`);
        // Здесь будет функциональность оплаты
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
