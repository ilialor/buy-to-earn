/**
 * Add Favorite Buttons Script
 * 
 * Этот скрипт добавляет кнопки избранного ко всем карточкам проектов, где их нет,
 * и исправляет макет карточек проектов для правильного отображения метрик и описаний.
 * Обеспечивает единообразный внешний вид всех карточек проектов.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add favorite buttons to all project cards
  addFavoriteButtons();
  
  // Fix project card layout
  fixProjectCardLayout();
  
  // Fix project descriptions
  fixProjectDescriptions();
});

/**
 * Add favorite buttons to all project cards that don't have them
 */
function addFavoriteButtons() {
  // Get all project cards
  const projectCards = document.querySelectorAll('.project-card');
  
  // Loop through each project card
  projectCards.forEach(function(card, index) {
    // Get the project actions container
    const actionsContainer = card.querySelector('.project-actions');
    
    // Check if the actions container exists
    if (actionsContainer) {
      // Check if the favorite button already exists
      const favoriteBtn = actionsContainer.querySelector('.favorite-btn');
      
      // If the favorite button doesn't exist, add it
      if (!favoriteBtn) {
        // Create the favorite button
        const favBtn = document.createElement('a');
        favBtn.href = 'javascript:void(0)';
        favBtn.className = 'favorite-btn';
        favBtn.setAttribute('data-order-id', '1002');
        favBtn.setAttribute('title', 'Add to Interesting');
        
        // Create the star icon
        const starIcon = document.createElement('i');
        starIcon.className = 'far fa-star';
        
        // Add the star icon to the favorite button
        favBtn.appendChild(starIcon);
        
        // Add the favorite button as the first child of the actions container
        actionsContainer.insertBefore(favBtn, actionsContainer.firstChild);
        
        console.log('Added favorite button to project card', index + 1);
      }
    }
  });
}

/**
 * Исправление макета карточек проектов
 */
function fixProjectCardLayout() {
  // Получаем все карточки проектов
  const projectCards = document.querySelectorAll('.project-card');
  
  // Перемещаем статус Active в блок метрик
  moveStatusToMetrics();
  
  // Проходим по каждой карточке
  projectCards.forEach(function(card, index) {
    // Устанавливаем стили для самой карточки
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.style.boxSizing = 'border-box';
    card.style.padding = '15px';
    card.style.borderRadius = '8px';
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    // Получаем элементы заголовка и метрик
    const header = card.querySelector('.project-card-header');
    const info = card.querySelector('.project-info');
    const title = card.querySelector('.project-title');
    const metrics = card.querySelector('.project-metrics');
    const meta = card.querySelector('.project-meta');
    const logo = card.querySelector('.project-logo');
    
    // Если все необходимые элементы существуют, перестраиваем макет
    if (header && info && title && metrics) {
      // Устанавливаем стили для заголовка карточки
      header.style.position = 'relative';
      header.style.display = 'flex';
      header.style.flexDirection = 'row';
      header.style.alignItems = 'flex-start';
      header.style.paddingBottom = '5px';
      header.style.marginBottom = '0';
      header.style.width = '100%';
      header.style.boxSizing = 'border-box';
      header.style.minHeight = '70px';
      header.style.maxHeight = '80px';
      
      // Устанавливаем стили для блока информации
      info.style.display = 'flex';
      info.style.flexDirection = 'column';
      info.style.width = 'calc(100% - 70px)';
      info.style.boxSizing = 'border-box';
      info.style.position = 'relative';
      info.style.paddingRight = '0';
      info.style.minHeight = '60px';
      info.style.justifyContent = 'space-between';
      
      if (logo) {
        info.style.marginLeft = '10px';
        logo.style.height = '60px';
        logo.style.width = '60px';
        logo.style.objectFit = 'contain';
        logo.style.borderRadius = '6px';
        logo.style.backgroundColor = '#f8f9fa';
        logo.style.padding = '5px';
        logo.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      }
      
      // Перемещаем метрики после заголовка
      if (title.nextElementSibling !== metrics && meta) {
        info.insertBefore(metrics, meta);
      }
      
      // Устанавливаем стили для заголовка
      title.style.width = '100%';
      title.style.margin = '0 0 5px 0';
      title.style.padding = '0';
      title.style.fontSize = '16px';
      title.style.lineHeight = '1.3';
      title.style.fontWeight = 'bold';
      title.style.overflow = 'hidden';
      title.style.whiteSpace = 'normal';
      title.style.maxHeight = '42px';
      title.style.color = '#333';
      title.style.display = '-webkit-box';
      title.style.webkitLineClamp = '2';
      title.style.lineClamp = '2';
      title.style.webkitBoxOrient = 'vertical';
      title.style.order = '0';
      
      // Устанавливаем стили для метрик
      metrics.style.position = 'relative';
      metrics.style.display = 'flex';
      metrics.style.flexDirection = 'row';
      metrics.style.alignItems = 'center';
      metrics.style.justifyContent = 'flex-start';
      metrics.style.marginTop = '0';
      metrics.style.marginBottom = '5px';
      metrics.style.width = '100%';
      metrics.style.height = 'auto';
      metrics.style.zIndex = '1';
      metrics.style.boxSizing = 'border-box';
      metrics.style.overflow = 'hidden';
      metrics.style.order = '1';
      
      // Убеждаемся, что метрики видны
      const roiElement = metrics.querySelector('.roi');
      const ratingElement = metrics.querySelector('.creator-rating');
      
      if (roiElement) {
        roiElement.style.display = 'inline-block';
        roiElement.style.fontWeight = 'bold';
        roiElement.style.color = '#2a9d8f';
        roiElement.style.marginRight = '15px';
        roiElement.style.backgroundColor = 'rgba(42, 157, 143, 0.1)';
        roiElement.style.padding = '3px 8px';
        roiElement.style.borderRadius = '4px';
        roiElement.style.maxWidth = '100px';
        roiElement.style.overflow = 'hidden';
        roiElement.style.textOverflow = 'ellipsis';
        roiElement.style.whiteSpace = 'nowrap';
        roiElement.style.fontSize = '12px';
        roiElement.style.letterSpacing = '0.2px';
      }
      
      if (ratingElement) {
        ratingElement.style.display = 'inline-block';
        ratingElement.style.color = '#e9c46a';
        ratingElement.style.backgroundColor = 'rgba(233, 196, 106, 0.1)';
        ratingElement.style.padding = '3px 8px';
        ratingElement.style.borderRadius = '4px';
        ratingElement.style.maxWidth = '80px';
        ratingElement.style.overflow = 'hidden';
        ratingElement.style.textOverflow = 'ellipsis';
        ratingElement.style.whiteSpace = 'nowrap';
        ratingElement.style.fontSize = '12px';
        ratingElement.style.letterSpacing = '0.2px';
      }
      
      // Устанавливаем стили для мета-данных
      if (meta) {
        meta.style.marginTop = '0';
        meta.style.marginBottom = '5px';
        meta.style.display = 'flex';
        meta.style.flexWrap = 'wrap';
        meta.style.gap = '5px';
        meta.style.order = '1';
        
        // Стилизуем элементы мета-данных
        const metaSpans = meta.querySelectorAll('span');
        metaSpans.forEach(function(span) {
          span.style.fontSize = '11px';
          span.style.lineHeight = '1.2';
          span.style.whiteSpace = 'nowrap';
        });
      }
      
      console.log('Fixed layout for project card', index + 1);
    }
  });
}

/**
 * Перемещение статуса Active в блок метрик
 */
function moveStatusToMetrics() {
  // Получаем все карточки проектов
  const projectCards = document.querySelectorAll('.project-card');
  
  // Проходим по каждой карточке
  projectCards.forEach(function(card) {
    // Получаем блок мета-данных и метрик
    const metaBlock = card.querySelector('.project-meta');
    const metricsBlock = card.querySelector('.project-metrics');
    
    // Проверяем, что оба блока существуют
    if (metaBlock && metricsBlock) {
      // Получаем статус Active
      const statusElement = metaBlock.querySelector('.status');
      
      // Если статус существует и еще не был перемещен
      if (statusElement && !metricsBlock.querySelector('.status')) {
        // Клонируем статус и добавляем в блок метрик
        const clonedStatus = statusElement.cloneNode(true);
        metricsBlock.insertBefore(clonedStatus, metricsBlock.firstChild);
        
        // Скрываем оригинальный статус
        statusElement.style.display = 'none';
        
        // Стилизуем новый статус
        clonedStatus.style.display = 'inline-block';
        clonedStatus.style.fontSize = '12px';
        clonedStatus.style.lineHeight = '1.2';
        clonedStatus.style.whiteSpace = 'nowrap';
        clonedStatus.style.marginRight = '15px';
        
        // Стилизуем статус Active
        if (clonedStatus.classList.contains('status-open')) {
          clonedStatus.style.color = '#4caf50';
          clonedStatus.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
          clonedStatus.style.padding = '3px 8px';
          clonedStatus.style.borderRadius = '4px';
          clonedStatus.style.fontWeight = 'bold';
          clonedStatus.style.letterSpacing = '0.2px';
        }
      }
    }
  });
}

/**
 * Исправление отображения описаний проектов
 */
function fixProjectDescriptions() {
  // Получаем все описания проектов
  const projectDescriptions = document.querySelectorAll('.project-card .project-description');
  
  // Проходим по каждому описанию
  projectDescriptions.forEach(function(description, index) {
    // Устанавливаем стили для описания
    description.style.marginTop = '30px';
    description.style.marginBottom = '10px';
    description.style.borderTop = '1px solid rgba(0, 0, 0, 0.05)';
    description.style.paddingTop = '10px';
    description.style.minHeight = '80px';
    description.style.maxHeight = '104px';
    description.style.overflow = 'hidden';
    description.style.display = '-webkit-box';
    description.style.webkitLineClamp = '5';
    description.style.lineClamp = '5';
    description.style.webkitBoxOrient = 'vertical';
    description.style.lineHeight = '1.4';
    description.style.fontSize = '13px';
    description.style.order = '2';
    description.style.color = '#555';
    description.style.textAlign = 'justify';
    
    console.log('Fixed description for project card', index + 1);
  });
}
