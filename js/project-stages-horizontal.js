/**
 * Project Stages Horizontal Timeline
 * 
 * JavaScript functionality for the horizontal project stages timeline.
 */

document.addEventListener('DOMContentLoaded', function() {
  initProjectStagesTimeline();
  initStageDetailButtons();
});

/**
 * Initialize project stages timeline
 */
function initProjectStagesTimeline() {
  // Calculate and set progress bar width
  calculateTimelineProgress();
  
  // Add animation to timeline items
  animateTimelineItems();
  
  // Initialize AOS for scroll animations if available
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}

/**
 * Calculate and set timeline progress based on completed stages
 */
function calculateTimelineProgress() {
  const timelineItems = document.querySelectorAll('.timeline-item-horizontal');
  const progressBar = document.querySelector('.timeline-progress');
  
  if (!timelineItems.length || !progressBar) return;
  
  let completedCount = 0;
  let totalItems = timelineItems.length;
  let currentIndex = 0;
  
  // Count completed items and find current stage index
  timelineItems.forEach((item, index) => {
    if (item.classList.contains('completed')) {
      completedCount++;
    }
    if (item.classList.contains('current')) {
      currentIndex = index;
    }
  });
  
  // Calculate progress percentage
  // For completed stages: full width
  // For current stage: half width (in progress)
  let progressPercentage = ((completedCount + 0.5) / totalItems) * 100;
  
  // If there's no current stage, just use completed count
  if (!document.querySelector('.timeline-item-horizontal.current')) {
    progressPercentage = (completedCount / totalItems) * 100;
  }
  
  // Set progress bar width
  progressBar.style.width = `${progressPercentage}%`;
}

/**
 * Animate timeline items with staggered delay
 */
function animateTimelineItems() {
  const timelineItems = document.querySelectorAll('.timeline-item-horizontal');
  
  if (!timelineItems.length) return;
  
  timelineItems.forEach((item, index) => {
    // Reset any existing animations
    item.style.animation = 'none';
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    // Add staggered animation
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

/**
 * Initialize stage detail buttons
 */
function initStageDetailButtons() {
  const stageButtons = document.querySelectorAll('.stage-more-btn');
  
  if (!stageButtons.length) return;
  
  stageButtons.forEach(button => {
    button.addEventListener('click', function() {
      const stageName = this.getAttribute('data-stage');
      showStageDetails(stageName);
    });
  });
}

/**
 * Show stage details in a modal or notification
 * @param {string} stageName - The name of the stage
 */
function showStageDetails(stageName) {
  // Stage details data
  const stageDetails = {
    concept: {
      title: 'Этап "Концепция"',
      description: 'На этом этапе была разработана основная концепция платформы AIgents, проведено исследование рынка и конкурентов, определены ключевые особенности проекта и целевая аудитория. Были созданы первые наброски пользовательского интерфейса и архитектуры системы.',
      achievements: [
        'Проведено исследование рынка GameFi и AI-проектов',
        'Разработана концепция платформы и экономическая модель',
        'Сформирована команда проекта',
        'Создан бизнес-план и дорожная карта'
      ],
      date: 'Январь 2025 - Февраль 2025'
    },
    alpha: {
      title: 'Этап "Альфа"',
      description: 'На этапе Альфа был разработан прототип платформы с базовым функционалом, проведено внутреннее тестирование и получена обратная связь от фокус-группы. Были реализованы основные механики взаимодействия с AI-агентами и интеграция с блокчейном.',
      achievements: [
        'Разработан прототип платформы с базовым функционалом',
        'Реализована интеграция с блокчейном',
        'Проведено внутреннее тестирование',
        'Получена обратная связь от фокус-группы'
      ],
      date: 'Март 2025 - Апрель 2025'
    },
    beta: {
      title: 'Этап "Бета" (Текущий)',
      description: 'В настоящее время проект находится на этапе Бета-тестирования. Расширяется функционал платформы, проводится тестирование с участием более широкой аудитории, оптимизируется производительность и улучшается пользовательский опыт.',
      achievements: [
        'Расширение функционала платформы',
        'Публичное бета-тестирование',
        'Оптимизация производительности',
        'Улучшение пользовательского интерфейса'
      ],
      date: 'Май 2025 - Июнь 2025'
    },
    launch: {
      title: 'Этап "Запуск" (Планируется)',
      description: 'Официальный запуск платформы запланирован на июль 2025 года. Будет проведена масштабная маркетинговая кампания, запущена полная версия платформы с полным функционалом и начнется активное привлечение пользователей.',
      achievements: [
        'Запуск полной версии платформы',
        'Маркетинговая кампания',
        'Листинг токена на биржах',
        'Активное привлечение пользователей'
      ],
      date: 'Июль 2025'
    },
    expansion: {
      title: 'Этап "Расширение" (Планируется)',
      description: 'После успешного запуска платформы планируется ее дальнейшее расширение через интеграцию с партнерами, добавление новых функций и возможностей, а также выход на новые рынки.',
      achievements: [
        'Интеграция с партнерскими проектами',
        'Добавление новых функций и возможностей',
        'Расширение экосистемы',
        'Выход на новые рынки'
      ],
      date: 'Август 2025 - Декабрь 2025'
    }
  };
  
  // Get stage data
  const stage = stageDetails[stageName];
  if (!stage) return;
  
  // Create modal content
  let achievementsList = '';
  stage.achievements.forEach(achievement => {
    achievementsList += `<li><i class="fas fa-check"></i> ${achievement}</li>`;
  });
  
  const modalContent = `
    <div class="stage-detail-modal-content">
      <h3>${stage.title}</h3>
      <div class="stage-detail-date"><i class="far fa-calendar-alt"></i> ${stage.date}</div>
      <p>${stage.description}</p>
      <h4>Ключевые достижения:</h4>
      <ul class="stage-achievements-list">
        ${achievementsList}
      </ul>
    </div>
  `;
  
  // Show in modal
  showModal(modalContent);
}

/**
 * Show modal with content
 * @param {string} content - HTML content for the modal
 */
function showModal(content) {
  // Check if modal container exists, if not create it
  let modalContainer = document.getElementById('stage-detail-modal');
  
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'stage-detail-modal';
    modalContainer.className = 'modal';
    
    const modalHTML = `
      <div class="modal-content">
        <button class="close-modal"><i class="fas fa-times"></i></button>
        <div class="modal-body"></div>
      </div>
    `;
    
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Add close button functionality
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
      modalContainer.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }
  
  // Set modal content
  const modalBody = modalContainer.querySelector('.modal-body');
  modalBody.innerHTML = content;
  
  // Show modal
  modalContainer.classList.add('active');
  document.body.classList.add('modal-open');
}

// Add window resize handler to recalculate timeline on window resize
window.addEventListener('resize', function() {
  // Recalculate timeline progress after resize
  calculateTimelineProgress();
});
