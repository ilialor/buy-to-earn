/**
 * Similar Projects Scroll Navigation
 * 
 * This script handles horizontal scrolling for similar projects cards
 * with navigation buttons.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const projectsGrid = document.getElementById('similar-projects-grid');
    const prevButton = document.getElementById('similar-prev');
    const nextButton = document.getElementById('similar-next');
    
    if (!projectsGrid || !prevButton || !nextButton) return;
    
    // Calculate scroll amount (width of one card + gap)
    const calculateScrollAmount = () => {
        const cards = projectsGrid.querySelectorAll('.similar-project-card');
        if (cards.length === 0) return 300;
        
        const card = cards[0];
        const cardWidth = card.offsetWidth;
        const computedStyle = window.getComputedStyle(projectsGrid);
        const gap = parseInt(computedStyle.getPropertyValue('gap'), 10) || 16;
        
        return cardWidth + gap;
    };
    
    // Scroll functions
    const scrollLeft = () => {
        projectsGrid.scrollBy({
            left: -calculateScrollAmount(),
            behavior: 'smooth'
        });
    };
    
    const scrollRight = () => {
        projectsGrid.scrollBy({
            left: calculateScrollAmount(),
            behavior: 'smooth'
        });
    };
    
    // Add event listeners
    prevButton.addEventListener('click', scrollLeft);
    nextButton.addEventListener('click', scrollRight);
    
    // Update button visibility based on scroll position
    const updateButtonVisibility = () => {
        const isAtStart = projectsGrid.scrollLeft <= 10;
        const isAtEnd = projectsGrid.scrollLeft + projectsGrid.clientWidth >= projectsGrid.scrollWidth - 10;
        
        prevButton.style.opacity = isAtStart ? '0.5' : '1';
        prevButton.style.pointerEvents = isAtStart ? 'none' : 'auto';
        
        nextButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextButton.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };
    
    // Initial button visibility
    updateButtonVisibility();
    
    // Update button visibility on scroll
    projectsGrid.addEventListener('scroll', updateButtonVisibility);
    
    // Update on window resize
    window.addEventListener('resize', updateButtonVisibility);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!projectsGrid.matches(':hover')) return;
        
        if (e.key === 'ArrowLeft') {
            scrollLeft();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            scrollRight();
            e.preventDefault();
        }
    });
});
