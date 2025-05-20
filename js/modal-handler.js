/**
 * Modal Window Handler
 * 
 * This file contains functionality for handling modal windows,
 * specifically for the project details modal.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize modal handlers
  initializeProjectDetailsModal();
  
  // Make sure modal is hidden on page load
  const modal = document.getElementById('project-details-modal');
  if (modal) {
    modal.style.display = 'none';
  }
});

/**
 * Initialize project details modal functionality
 */
function initializeProjectDetailsModal() {
  // Get modal elements
  const modal = document.getElementById('project-details-modal');
  const closeBtn = document.getElementById('close-project-modal');
  const minimizeBtn = document.getElementById('minimize-modal');
  
  if (!modal || !closeBtn) {
    console.error('Modal elements not found');
    return;
  }
  
  // Close button handler - прямое добавление обработчика
  closeBtn.addEventListener('click', closeModalHandler);
  
  // Добавляем также и прямой обработчик onclick
  closeBtn.onclick = closeModalHandler;
  
  // Функция обработчика закрытия
  function closeModalHandler(e) {
    console.log('Кнопка закрытия нажата');
    
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = 'auto';
    
    // Скрываем модальное окно
    modal.style.display = 'none';
    modal.classList.remove('show');
    modal.classList.remove('minimized-mode');
    
    // Сбрасываем состояние свернутости
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent && modalContent.classList.contains('minimized')) {
      modalContent.classList.remove('minimized');
      
      // Восстанавливаем иконку
      const icon = minimizeBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-minus');
      }
    }
    
    // Предотвращаем все возможные действия по умолчанию
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    return false;
  }
  
  // Minimize button handler - улучшенная версия
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function() {
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        // Переключаем класс для содержимого модального окна
        modalContent.classList.toggle('minimized');
        
        // Также переключаем класс для самого модального окна
        modal.classList.toggle('minimized-mode');
        
        // Change button icon
        const icon = this.querySelector('i');
        if (icon) {
          if (modalContent.classList.contains('minimized')) {
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-expand');
            
            // Убедимся, что страница доступна для взаимодействия
            document.body.style.overflow = 'auto';
          } else {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-minus');
            
            // Блокируем прокрутку страницы при развернутом модальном окне
            document.body.style.overflow = 'hidden';
          }
        }
      }
    });
  }
  
  // Close when clicking outside modal content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Close with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
  
  console.log('Project details modal initialized');
}

/**
 * Show modal window
 * @param {string} modalId - ID of the modal to show
 */
function showProjectModal(modalId) {
  // Гарантируем, что модальное окно не открывается автоматически при загрузке
  // Проверяем, что страница полностью загружена
  if (document.readyState !== 'complete') {
    console.log('Страница еще не загружена, откладываем открытие модального окна');
    return;
  }
  
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log('Открываем модальное окно:', modalId);
    modal.style.display = 'flex';
    
    // Добавляем класс для анимации появления
    setTimeout(function() {
      modal.classList.add('show');
    }, 10);
  }
}

/**
 * Close modal window
 * @param {string} modalId - ID of the modal to close
 */
function closeProjectModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log('Закрываем модальное окно:', modalId);
    
    // Удаляем класс анимации и скрываем модальное окно
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Дополнительная проверка через небольшой промежуток времени
    setTimeout(function() {
      if (modal.style.display !== 'none') {
        modal.style.display = 'none';
      }
    }, 100);
  }
}

// Make functions available globally
window.showProjectModal = showProjectModal;
window.closeProjectModal = closeProjectModal;
