/**
 * Project Stages Timeline Interactivity
 * 
 * This script adds interactivity to the project stages timeline
 * and provides animations for better user experience
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize timeline interactivity
  initializeTimeline();
  
  // Add animation to timeline when it comes into view
  initializeTimelineAnimation();
});

/**
 * Initialize timeline interactivity
 */
function initializeTimeline() {
  // Get all timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // Add click event to each timeline item
  timelineItems.forEach(function(item) {
    item.addEventListener('click', function() {
      // Toggle active class on clicked item
      const isActive = this.classList.contains('active');
      
      // Remove active class from all items
      timelineItems.forEach(function(i) {
        i.classList.remove('active');
      });
      
      // If item wasn't active before, make it active
      if (!isActive) {
        this.classList.add('active');
        
        // Show more detailed information about this stage
        const stageName = this.getAttribute('data-stage');
        const stageTitle = this.querySelector('.stage-title').textContent;
        showStageDetails(stageName, stageTitle);
      }
    });
    
    // Add hover effect for stage details
    const stageDetails = item.querySelector('.stage-details');
    if (stageDetails) {
      // Show details on hover
      item.addEventListener('mouseenter', function() {
        stageDetails.style.display = 'block';
        stageDetails.style.opacity = '1';
      });
      
      // Hide details when mouse leaves
      item.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          stageDetails.style.opacity = '0';
          setTimeout(() => {
            stageDetails.style.display = 'none';
          }, 300); // Соответствует времени transition в CSS
        }
      });
    }
  });
  
  // Highlight current stage
  highlightCurrentStage();
  
  // Log initialization
  console.log('Timeline interactivity initialized');
}

/**
 * Initialize animation when timeline comes into view
 */
function initializeTimelineAnimation() {
  // Используем Intersection Observer для определения, когда временная шкала появляется в поле зрения
  const timeline = document.querySelector('.timeline');
  
  if (timeline && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Добавляем класс для анимации
          timeline.classList.add('animate-timeline');
          // Отключаем наблюдение после первого появления
          observer.unobserve(timeline);
        }
      });
    }, { threshold: 0.2 }); // Запускаем анимацию, когда 20% элемента видно
    
    observer.observe(timeline);
  } else {
    // Fallback для браузеров без поддержки Intersection Observer
    timeline.classList.add('animate-timeline');
  }
}

/**
 * Highlight the current stage in the timeline
 */
function highlightCurrentStage() {
  // Находим текущий этап (с классом 'current')
  const currentStageItem = document.querySelector('.timeline-item.current');
  
  if (currentStageItem) {
    // Добавляем эффект пульсации для выделения текущего этапа
    currentStageItem.classList.add('pulse');
    
    // Автоматически показываем детали текущего этапа
    const stageDetails = currentStageItem.querySelector('.stage-details');
    if (stageDetails) {
      setTimeout(() => {
        stageDetails.style.display = 'block';
        stageDetails.style.opacity = '1';
      }, 1000); // Показываем детали через 1 секунду после загрузки
    }
  }
}

/**
 * Show detailed information about a specific stage
 * @param {string} stageName - Stage identifier
 * @param {string} stageTitle - Stage title
 */
function showStageDetails(stageName, stageTitle) {
  // Здесь можно добавить логику для показа дополнительной информации об этапе
  console.log(`Showing details for stage: ${stageName} - ${stageTitle}`);
  
  // Обновляем статус в зависимости от выбранного этапа
  const stageInfo = getStageInfo(stageName);
  if (stageInfo) {
    updateTimelineStatus(stageInfo.completedStages, stageInfo.totalStages, stageTitle);
  }
}

/**
 * Get information about a specific stage
 * @param {string} stageName - Stage identifier
 * @returns {Object} Stage information
 */
function getStageInfo(stageName) {
  // Информация о каждом этапе
  const stagesInfo = {
    'concept': { completedStages: 1, totalStages: 5, description: 'Разработка концепции и исследование рынка' },
    'alpha': { completedStages: 2, totalStages: 5, description: 'Разработка прототипа и тестирование основных функций' },
    'beta': { completedStages: 3, totalStages: 5, description: 'Расширенное тестирование и доработка функционала' },
    'launch': { completedStages: 4, totalStages: 5, description: 'Официальный запуск платформы и маркетинговая кампания' },
    'expansion': { completedStages: 5, totalStages: 5, description: 'Интеграция с партнерами и расширение экосистемы' }
  };
  
  return stagesInfo[stageName];
}

/**
 * Update timeline status
 * @param {number} completedStages - Number of completed stages
 * @param {number} totalStages - Total number of stages
 * @param {string} currentStage - Name of the current stage
 */
function updateTimelineStatus(completedStages, totalStages, currentStage) {
  const statusCompletedEl = document.querySelector('.stages-completed');
  const statusCurrentEl = document.querySelector('.stages-current');
  
  if (statusCompletedEl) {
    statusCompletedEl.textContent = `${completedStages}/${totalStages} Завершено`;
  }
  
  if (statusCurrentEl) {
    statusCurrentEl.textContent = `• Текущий: ${currentStage}`;
  }
  
  console.log(`Timeline status updated: ${completedStages}/${totalStages}, Current: ${currentStage}`);
}
