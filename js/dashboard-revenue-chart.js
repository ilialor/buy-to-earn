/**
 * Dashboard Revenue Chart
 * 
 * JavaScript для инициализации мини-диаграммы распределения доходов в дашборде проекта.
 */

document.addEventListener('DOMContentLoaded', function() {
  initMiniRevenueChart();
  initRevenueDetailsButton();
});

/**
 * Инициализация мини-диаграммы распределения доходов
 */
function initMiniRevenueChart() {
  const miniChartCanvas = document.getElementById('miniRevenueChart');
  
  if (!miniChartCanvas) {
    showFallbackChart();
    return;
  }
  
  // Проверка поддержки Canvas
  if (!isCanvasSupported()) {
    showFallbackChart();
    return;
  }
  
  // Данные для диаграммы
  const data = {
    labels: ['Игроки', 'Создатели', 'Платформа'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
      borderWidth: 0,
      hoverOffset: 5
    }]
  };
  
  // Опции диаграммы
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };
  
  // Создание диаграммы
  try {
    new Chart(miniChartCanvas, {
      type: 'doughnut',
      data: data,
      options: options
    });
  } catch (error) {
    console.error('Ошибка при создании диаграммы:', error);
    showFallbackChart();
  }
}

/**
 * Проверка поддержки Canvas
 * @returns {boolean} - true, если Canvas поддерживается
 */
function isCanvasSupported() {
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext && canvas.getContext('2d'));
}

/**
 * Показать запасной вариант диаграммы
 */
function showFallbackChart() {
  const miniChartCanvas = document.getElementById('miniRevenueChart');
  const staticPieChart = document.querySelector('.mini-static-pie-chart');
  
  if (miniChartCanvas) {
    miniChartCanvas.style.display = 'none';
  }
  
  if (staticPieChart) {
    staticPieChart.style.display = 'block';
  }
}

/**
 * Инициализация кнопки "Подробнее" для распределения доходов
 */
function initRevenueDetailsButton() {
  const revenueDetailsBtn = document.getElementById('revenue-details-btn');
  
  if (!revenueDetailsBtn) return;
  
  revenueDetailsBtn.addEventListener('click', function() {
    showRevenueDetailsModal();
  });
}

/**
 * Показать модальное окно с подробной информацией о распределении доходов
 */
function showRevenueDetailsModal() {
  // Создаем модальное окно, если оно не существует
  let revenueModal = document.getElementById('revenue-details-modal');
  
  if (!revenueModal) {
    revenueModal = document.createElement('div');
    revenueModal.id = 'revenue-details-modal';
    revenueModal.className = 'modal';
    
    const modalHTML = `
      <div class="modal-content">
        <button class="close-modal"><i class="fas fa-times"></i></button>
        <div class="modal-header">
          <h3 class="modal-title">Распределение доходов</h3>
        </div>
        <div class="modal-body">
          <div class="revenue-details-content">
            <div class="revenue-chart-large">
              <canvas id="largeRevenueChart" width="300" height="300"></canvas>
            </div>
            <div class="revenue-details-info">
              <p class="revenue-details-description">
                Экономическая модель платформы AIgents построена на справедливом распределении доходов между всеми участниками экосистемы:
              </p>
              <ul class="revenue-details-list">
                <li>
                  <span class="revenue-category"><span class="color-dot" style="background-color: #4CAF50;"></span> Игроки (65%)</span>
                  <p>Большая часть доходов распределяется между активными игроками платформы в зависимости от их вклада и активности.</p>
                </li>
                <li>
                  <span class="revenue-category"><span class="color-dot" style="background-color: #2196F3;"></span> Создатели (25%)</span>
                  <p>Разработчики контента и создатели AI-агентов получают вознаграждение за свои творения и их популярность.</p>
                </li>
                <li>
                  <span class="revenue-category"><span class="color-dot" style="background-color: #FFC107;"></span> Платформа (10%)</span>
                  <p>Небольшая часть доходов направляется на поддержку и развитие платформы, обеспечение безопасности и новые функции.</p>
                </li>
              </ul>
              <div class="ailock-button-container">
                <button class="ailock-ask-btn">
                  <i class="fas fa-question-circle"></i> Спросить Айлока о модели распределения
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    revenueModal.innerHTML = modalHTML;
    document.body.appendChild(revenueModal);
    
    // Добавляем обработчик для закрытия модального окна
    const closeButton = revenueModal.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
      revenueModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
    
    // Инициализируем большую диаграмму в модальном окне
    revenueModal.addEventListener('transitionend', function() {
      if (revenueModal.classList.contains('active')) {
        initLargeRevenueChart();
      }
    });
  }
  
  // Показываем модальное окно
  revenueModal.classList.add('active');
  document.body.classList.add('modal-open');
}

/**
 * Инициализация большой диаграммы распределения доходов в модальном окне
 */
function initLargeRevenueChart() {
  const largeChartCanvas = document.getElementById('largeRevenueChart');
  
  if (!largeChartCanvas || !isCanvasSupported()) return;
  
  // Данные для диаграммы
  const data = {
    labels: ['Игроки', 'Создатели', 'Платформа'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };
  
  // Опции диаграммы
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };
  
  // Создание диаграммы
  try {
    new Chart(largeChartCanvas, {
      type: 'doughnut',
      data: data,
      options: options
    });
  } catch (error) {
    console.error('Ошибка при создании большой диаграммы:', error);
  }
}
