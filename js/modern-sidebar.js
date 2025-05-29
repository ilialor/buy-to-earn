/**
 * Modern Navigation Sidebar Scripts
 * 
 * This file contains scripts for the modern navigation sidebar
 * on the project details page.
 */

// Function to handle active state of navigation items
function updateActiveNavItem() {
  // Get all sections that correspond to navigation items
  const sections = document.querySelectorAll('section, #overview, #timeline, #revenue, .project-about, .project-media, .project-team, .similar-projects, .join-project-section');
  
  // Get all navigation items
  const navItems = document.querySelectorAll('.sidebar-nav li');
  
  // Set a threshold for when a section is considered in view
  const threshold = 200;
  
  // Function to check if an element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= threshold && 
      rect.bottom >= threshold
    );
  }
  
  // Check which section is currently in view
  let activeSection = null;
  
  sections.forEach(section => {
    if (isInViewport(section)) {
      activeSection = section;
    }
  });
  
  // If a section is in view, update the active navigation item
  if (activeSection) {
    navItems.forEach(item => {
      // Remove active class from all items
      item.classList.remove('active');
      
      // Get the href attribute of the link
      const link = item.querySelector('a');
      const href = link.getAttribute('href');
      
      // Check if the href matches the id of the active section
      // or if the section has a class that matches the href
      if (href === '#' + activeSection.id || 
          (href.startsWith('.') && activeSection.classList.contains(href.substring(1)))) {
        item.classList.add('active');
      }
    });
  }
}

// Function to handle smooth scrolling
function scrollToElement(selector) {
  const element = selector.startsWith('#') 
    ? document.querySelector(selector)
    : document.querySelector(selector);
    
  if (element) {
    // Calculate offset to account for fixed header
    const headerHeight = document.querySelector('header').offsetHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
    
    // Smooth scroll to element
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
  
  // Prevent default anchor click behavior
  return false;
}

// Add scroll event listener to update active navigation item
window.addEventListener('scroll', updateActiveNavItem);

// Initialize active navigation item on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initial update of active navigation item
  updateActiveNavItem();
  
  // Make scrollToElement function available globally
  window.scrollToElement = scrollToElement;
  
  // Handle mobile navigation
  const handleResize = () => {
    const sidebar = document.getElementById('project-sidebar');
    if (window.innerWidth <= 992) {
      sidebar.classList.add('mobile');
    } else {
      sidebar.classList.remove('mobile');
    }
  };
  
  // Initial check and add resize listener
  handleResize();
  window.addEventListener('resize', handleResize);
});
