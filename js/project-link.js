// Project Link JavaScript
// 
// This file contains functionality for opening the project details modal.

// Используем функции из modal-handler.js

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  // Находим все кнопки "Details" на странице
  const detailsButtons = document.querySelectorAll('.details-btn');
  
  // Добавляем обработчик событий для первой кнопки "Details" (первая карточка проекта)
  if (detailsButtons.length > 0) {
    const firstDetailsButton = detailsButtons[0];
    
    // Заменяем стандартное поведение кнопки
    firstDetailsButton.addEventListener('click', function(event) {
      // Предотвращаем стандартное поведение (вызов функции showOrderDetails)
      event.preventDefault();
      
      // Открываем модальное окно с деталями проекта
      // Используем функцию из modal-handler.js
      console.log('Открываем модальное окно проекта');
      
      // Проверяем, что функция доступна
      if (typeof window.showProjectModal === 'function') {
        window.showProjectModal('project-details-modal');
      } else {
        // Фолбэк на случай, если функция недоступна
        const modal = document.getElementById('project-details-modal');
        if (modal) {
          modal.style.display = 'flex';
          modal.classList.add('show');
        }
      }
    });
    
    // Не изменяем текст кнопки, чтобы не влиять на другие карточки
    // firstDetailsButton.innerHTML = 'Подробнее <i class="fas fa-arrow-right"></i>';
    
    // Удаляем атрибут onclick, чтобы предотвратить вызов функции showOrderDetails
    firstDetailsButton.removeAttribute('onclick');
  }
  
  // Обработка взаимодействия с элементами в модальном окне деталей проекта
  setupProjectDetailsInteractions();
});

/**
 * Setup interactions for project details modal
 * 
 * This function is now just a placeholder since modal functionality
 * has been moved to modal-handler.js
 */
function setupProjectDetailsInteractions() {
  // Функциональность перенесена в modal-handler.js
  console.log('Функциональность модального окна перенесена в modal-handler.js');
  
  // Показать/скрыть детали этапов проекта
  const stageItems = document.querySelectorAll('.timeline-item');

  stageItems.forEach(item => {
    const stageTitle = item.querySelector('.stage-title');
    const stageDetails = item.querySelector('.stage-details');
    
    if (stageTitle && stageDetails) {
      stageTitle.addEventListener('click', function() {
        // Закрыть все другие детали
        document.querySelectorAll('.stage-details').forEach(details => {
          if (details !== stageDetails) {
            details.style.display = 'none';
          }
        });
        
        // Переключить текущие детали
        stageDetails.style.display = stageDetails.style.display === 'block' ? 'none' : 'block';
      });
    }
  });
  
  // Выбор опции инвестирования
  const investmentOptions = document.querySelectorAll('.investment-option');
  investmentOptions.forEach(option => {
    option.addEventListener('click', function() {
      investmentOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
  
  // Функциональность сворачивания/разворачивания модального окна уже добавлена выше
}
