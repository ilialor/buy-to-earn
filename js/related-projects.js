/**
 * Related Projects Navigation
 * 
 * This script handles horizontal scrolling for related projects cards
 * with navigation buttons and scroll indicators.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const scroller = document.getElementById('related-projects-scroller');
    const prevButton = document.getElementById('related-prev');
    const nextButton = document.getElementById('related-next');
    const dots = document.querySelectorAll('.related-scroll-indicator .dot');
    
    if (!scroller || !prevButton || !nextButton) return;
    
    // Calculate scroll amount (width of one card + gap)
    const calculateScrollAmount = () => {
        const cards = scroller.querySelectorAll('.related-card');
        if (cards.length === 0) return 300;
        
        const card = cards[0];
        const cardWidth = card.offsetWidth;
        const computedStyle = window.getComputedStyle(scroller);
        const gap = parseInt(computedStyle.getPropertyValue('gap'), 10) || 20;
        
        return cardWidth + gap;
    };
    
    // Scroll functions
    const scrollLeft = () => {
        scroller.scrollBy({
            left: -calculateScrollAmount(),
            behavior: 'smooth'
        });
    };
    
    const scrollRight = () => {
        scroller.scrollBy({
            left: calculateScrollAmount(),
            behavior: 'smooth'
        });
    };
    
    // Add event listeners
    prevButton.addEventListener('click', scrollLeft);
    nextButton.addEventListener('click', scrollRight);
    
    // Update button visibility and dots based on scroll position
    const updateNavigation = () => {
        const isAtStart = scroller.scrollLeft <= 10;
        const isAtEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 10;
        
        // Update buttons
        prevButton.style.opacity = isAtStart ? '0.5' : '1';
        prevButton.style.pointerEvents = isAtStart ? 'none' : 'auto';
        
        nextButton.style.opacity = isAtEnd ? '0.5' : '1';
        nextButton.style.pointerEvents = isAtEnd ? 'none' : 'auto';
        
        // Update dots
        if (dots.length > 0) {
            const totalWidth = scroller.scrollWidth - scroller.clientWidth;
            const progress = totalWidth > 0 ? scroller.scrollLeft / totalWidth : 0;
            const activeDotIndex = Math.min(
                Math.floor(progress * dots.length),
                dots.length - 1
            );
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        }
    };
    
    // Initial navigation state
    updateNavigation();
    
    // Update navigation on scroll
    scroller.addEventListener('scroll', updateNavigation);
    
    // Update on window resize
    window.addEventListener('resize', updateNavigation);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!scroller.matches(':hover')) return;
        
        if (e.key === 'ArrowLeft') {
            scrollLeft();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            scrollRight();
            e.preventDefault();
        }
    });
});
