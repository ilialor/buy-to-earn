/**
 * Revenue Distribution Chart
 * 
 * This script initializes and manages the revenue distribution pie chart
 * using Chart.js library.
 */

// Глобальная переменная для хранения экземпляра диаграммы
let revenueChart = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up revenue chart initialization');
    
    // Инициализируем диаграмму при загрузке страницы
    setTimeout(function() {
        console.log('Attempting to initialize revenue chart');
        initRevenueChart();
    }, 1000);
    
    // Проверяем поддержку Canvas и показываем запасной вариант, если нужно
    checkCanvasSupport();
    
    // Инициализируем кнопку "Спросить Айлока"
    initAskAIlockButton();
});

/**
 * Initialize the revenue distribution pie chart
 */
function initRevenueChart() {
    console.log('initRevenueChart called');
    
    // Скрываем SVG-диаграмму, если она видима
    const svgContainer = document.querySelector('.revenue-chart-svg');
    if (svgContainer) {
        svgContainer.style.display = 'none';
    }
    
    // Скрываем CSS-диаграмму, если она видима
    const fallbackContainer = document.querySelector('.revenue-chart-fallback');
    if (fallbackContainer) {
        fallbackContainer.style.display = 'none';
    }
    
    // Get the canvas element
    const ctx = document.getElementById('revenueDistributionChart');
    
    // Check if canvas exists
    if (!ctx) {
        console.error('Canvas element not found');
        return;
    }
    
    console.log('Canvas found:', ctx);
    
    // If chart already exists, destroy it to prevent duplicates
    if (revenueChart) {
        console.log('Destroying existing chart');
        revenueChart.destroy();
        revenueChart = null;
    }
    
    // Data for the pie chart
    const data = {
        labels: ['Игроки', 'Создатели', 'Платформа'],
        datasets: [{
            data: [65, 25, 10],
            backgroundColor: [
                '#4CAF50', // Green for Players
                '#2196F3', // Blue for Creators
                '#FFC107'  // Yellow for Platform
            ],
            borderColor: [
                '#388E3C',
                '#1976D2',
                '#FFA000'
            ],
            borderWidth: 1,
            hoverOffset: 10
        }]
    };
    
    // Configuration for the pie chart
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false // Hide default legend as we have custom one
                },
                tooltip: {
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
        }
    };
    
    try {
        // Create the chart
        console.log('Creating new chart');
        revenueChart = new Chart(ctx, config);
        console.log('Chart created successfully');
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

/**
 * Initialize the "Ask AIlock" button functionality
 */
function initAskAIlockButton() {
    const askButton = document.querySelector('.ailock-ask-btn');
    
    if (askButton) {
        askButton.addEventListener('click', function() {
            // Show a tooltip or modal with information about revenue distribution
            showAIlockExplanation();
        });
    }
}

/**
 * Check if Canvas is supported and show fallback if needed
 */
function checkCanvasSupport() {
    // Проверяем поддержку Canvas
    const canvas = document.createElement('canvas');
    const isCanvasSupported = !!(canvas.getContext && canvas.getContext('2d'));
    
    // Если Canvas не поддерживается или Chart.js не загружен
    if (!isCanvasSupported || typeof Chart === 'undefined') {
        console.log('Canvas or Chart.js not supported, showing fallback');
        
        // Скрываем контейнер Canvas
        const canvasContainer = document.querySelector('.revenue-chart-container');
        if (canvasContainer) {
            canvasContainer.style.display = 'none';
        }
        
        // Показываем запасной вариант диаграммы
        const fallbackContainer = document.querySelector('.revenue-chart-fallback');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
        }
    }
}

/**
 * Display AIlock explanation about revenue distribution
 */
function showAIlockExplanation() {
    // Create tooltip content
    const explanationHTML = `
        <div class="ailock-explanation">
            <h4>Прогрессивная модель распределения доходов</h4>
            <p>Наша модель распределения доходов обеспечивает справедливое вознаграждение для всех участников экосистемы:</p>
            <ul>
                <li><strong>65% - Игроки:</strong> Большая часть доходов направляется непосредственно игрокам в качестве вознаграждения за их активность и вклад.</li>
                <li><strong>25% - Создатели:</strong> Четверть доходов получают разработчики и создатели проекта для поддержки развития платформы.</li>
                <li><strong>10% - Платформа:</strong> Небольшая часть идет на поддержку инфраструктуры и операционные расходы платформы.</li>
            </ul>
            <p>Эта модель стимулирует активное участие и обеспечивает устойчивое развитие проекта.</p>
        </div>
    `;
    
    // Check if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        // Create or get modal
        let modal = document.getElementById('ailock-explanation-modal');
        
        if (!modal) {
            // Create modal if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'ailock-explanation-modal';
            modal.className = 'modal fade';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">AIlock объясняет</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${explanationHTML}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } else {
            // Update existing modal content
            modal.querySelector('.modal-body').innerHTML = explanationHTML;
        }
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } else {
        // Fallback to alert if Bootstrap is not available
        alert('Прогрессивная модель распределения доходов: Игроки (65%), Создатели (25%), Платформа (10%)');
    }
}
