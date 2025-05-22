/**
 * Revenue Distribution Fallback
 * 
 * This script provides a fallback solution for displaying the revenue distribution
 * when Chart.js fails to initialize properly.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up revenue chart fallback');
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not available, using fallback');
        showFallbackChart();
    } else {
        // Wait a bit and check if the chart was created
        setTimeout(function() {
            const canvas = document.getElementById('revenueDistributionChart');
            const canvasContainer = document.querySelector('.revenue-chart-container');
            
            // Проверяем, что Canvas видим и диаграмма не создана
            if (canvasContainer && canvasContainer.style.display !== 'none' && 
                (!canvas || !canvas.__chart__)) {
                console.log('Chart not initialized properly, using fallback');
                
                // Создаем SVG-диаграмму и показываем её
                createSvgChart();
                
                // Показываем SVG-контейнер
                const svgContainer = document.querySelector('.revenue-chart-svg');
                if (svgContainer) {
                    svgContainer.style.display = 'block';
                    canvasContainer.style.display = 'none';
                } else {
                    // Если SVG не удалось создать, показываем CSS-вариант
                    showFallbackChart();
                }
            }
        }, 2000);
    }
});

/**
 * Show the fallback image for the chart
 */
function showFallbackChart() {
    console.log('Showing fallback chart');
    
    // Hide canvas container
    const canvasContainer = document.querySelector('.revenue-chart-container');
    if (canvasContainer) {
        canvasContainer.style.display = 'none';
    }
    
    // Проверяем, отображается ли уже SVG-диаграмма
    const svgContainer = document.querySelector('.revenue-chart-svg');
    const isSvgVisible = svgContainer && svgContainer.style.display === 'block';
    
    // Если SVG-диаграмма не отображается, показываем CSS-вариант
    if (!isSvgVisible) {
        // Show fallback image
        const fallbackContainer = document.querySelector('.revenue-chart-fallback');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
        }
    }
}

/**
 * Create an SVG-based pie chart as a reliable alternative
 */
function createSvgChart() {
    console.log('Creating SVG chart');
    const svgContainer = document.querySelector('.revenue-chart-svg');
    if (!svgContainer) {
        console.error('SVG container not found');
        return;
    }
    
    // Data for the chart
    const data = [
        { label: 'Игроки', value: 65, color: '#4CAF50' },
        { label: 'Создатели', value: 25, color: '#2196F3' },
        { label: 'Платформа', value: 10, color: '#FFC107' }
    ];
    
    try {
        // Create SVG element
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "200");
        svg.setAttribute("height", "200");
        svg.setAttribute("viewBox", "0 0 100 100");
        
        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        // Draw pie segments
        let startAngle = 0;
        data.forEach(item => {
            const percentage = item.value / total;
            const endAngle = startAngle + percentage * 2 * Math.PI;
            
            // Calculate path
            const x1 = 50 + 40 * Math.cos(startAngle);
            const y1 = 50 + 40 * Math.sin(startAngle);
            const x2 = 50 + 40 * Math.cos(endAngle);
            const y2 = 50 + 40 * Math.sin(endAngle);
            
            // Create path element
            const path = document.createElementNS(svgNS, "path");
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            path.setAttribute("d", `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
            path.setAttribute("fill", item.color);
            path.setAttribute("stroke", "#fff");
            path.setAttribute("stroke-width", "1");
            
            // Add tooltip
            path.setAttribute("data-label", `${item.label}: ${item.value}%`);
            
            // Add to SVG
            svg.appendChild(path);
            
            // Update start angle for next segment
            startAngle = endAngle;
        });
        
        // Create hole in the middle for donut chart
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", "50");
        circle.setAttribute("cy", "50");
        circle.setAttribute("r", "25");
        circle.setAttribute("fill", "#fff");
        svg.appendChild(circle);
        
        // Add to container
        svgContainer.innerHTML = '';
        svgContainer.appendChild(svg);
        console.log('SVG chart created successfully');
    } catch (error) {
        console.error('Error creating SVG chart:', error);
    }
}
