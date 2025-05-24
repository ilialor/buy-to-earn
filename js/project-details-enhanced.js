/**
 * Enhanced Project Details JavaScript
 * 
 * This file contains additional functionality for the enhanced project details page.
 * Includes sidebar toggle, scroll progress, quick actions, and dashboard functionality.
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initSidebar();
  initScrollProgress();
  initQuickActions();
  initModals();
  initTooltips();
  initCountdownTimer();
  
  console.log('Enhanced project details functionality initialized');
});

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
  const sidebar = document.getElementById('project-sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  if (sidebar && toggleBtn) {
    // Toggle sidebar collapse state
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      
      // Update toggle button icon
      const icon = this.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
    });
    
    // Highlight active section on scroll
    window.addEventListener('scroll', function() {
      highlightActiveSidebarItem();
    });
    
    // Add click event to sidebar links
    sidebarLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        // Prevent default only if using our custom scroll function
        if (typeof scrollToElement === 'function') {
          e.preventDefault();
          const target = this.getAttribute('href');
          if (target.startsWith('#')) {
            scrollToElement(target);
          }
        }
        
        // Update active class
        sidebarLinks.forEach(link => link.parentElement.classList.remove('active'));
        this.parentElement.classList.add('active');
      });
    });
  }
}

/**
 * Highlight active sidebar item based on scroll position
 */
function highlightActiveSidebarItem() {
  const sections = [
    { id: 'overview', element: document.getElementById('overview') },
    { id: 'about', element: document.querySelector('.project-about') },
    { id: 'timeline', element: document.getElementById('timeline') },
    { id: 'revenue', element: document.getElementById('revenue') },
    { id: 'media', element: document.querySelector('.project-media') },
    { id: 'team', element: document.querySelector('.project-team') },
    { id: 'similar', element: document.querySelector('.similar-projects') },
    { id: 'join', element: document.querySelector('.join-project-section') }
  ];
  
  // Get current scroll position
  const scrollPosition = window.scrollY + 100; // Adding offset for better UX
  
  // Find the current section
  let currentSection = null;
  
  for (const section of sections) {
    if (section.element) {
      const sectionTop = section.element.offsetTop;
      const sectionBottom = sectionTop + section.element.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = section.id;
        break;
      }
    }
  }
  
  // If we're at the bottom of the page and no section is active, use the last section
  if (!currentSection && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    currentSection = sections[sections.length - 1].id;
  }
  
  // Update sidebar active item
  if (currentSection) {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSection}` || href.includes(`.${currentSection}`)) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
  }
}

/**
 * Initialize scroll progress indicator
 */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress-bar');
  
  if (progressBar) {
    window.addEventListener('scroll', function() {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = progress + '%';
    });
  }
}

/**
 * Initialize quick actions panel
 */
function initQuickActions() {
  const quickActionItems = document.querySelectorAll('.quick-action-item');
  
  if (quickActionItems.length) {
    quickActionItems.forEach(function(item, index) {
      item.addEventListener('click', function() {
        // Handle different actions based on index or data attribute
        switch (index) {
          case 0: // Invest
            scrollToElement('.join-project-section');
            break;
          case 1: // Add to favorites
            toggleFavorite();
            break;
          case 2: // Share
            shareProject();
            break;
          case 3: // Contact team
            showModal('contact-team-modal');
            break;
          case 4: // Subscribe to updates
            showModal('subscribe-updates-modal');
            break;
        }
      });
    });
  }
}

/**
 * Toggle project favorite status
 */
function toggleFavorite() {
  const favoriteIcon = document.querySelector('.quick-action-item:nth-child(2) i');
  
  if (favoriteIcon) {
    // Toggle between regular and solid star
    if (favoriteIcon.classList.contains('fas')) {
      favoriteIcon.classList.remove('fas');
      favoriteIcon.classList.add('far');
      showNotification('Проект удален из избранного', 'info');
    } else {
      favoriteIcon.classList.remove('far');
      favoriteIcon.classList.add('fas');
      showNotification('Проект добавлен в избранное', 'success');
    }
  }
}

/**
 * Share project functionality
 */
function shareProject() {
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'AIgents: Эволюционируй своего цифрового ассистента',
      text: 'Революционная платформа для создания, обучения и монетизации персональных ИИ-агентов с использованием технологии блокчейн.',
      url: window.location.href
    })
    .then(() => showNotification('Проект успешно поделен', 'success'))
    .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support Web Share API
    // Copy link to clipboard
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = window.location.href;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification('Ссылка скопирована в буфер обмена', 'success');
  }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container');
  
  if (container) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
      case 'success': icon = 'check-circle'; break;
      case 'error': icon = 'times-circle'; break;
      case 'warning': icon = 'exclamation-triangle'; break;
    }
    
    notification.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (container.contains(notification)) {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
          if (container.contains(notification)) {
            container.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }
}

/**
 * Initialize modal functionality
 */
function initModals() {
  // Get all modals
  const modals = document.querySelectorAll('.modal');
  
  // Add close functionality to all modals
  modals.forEach(function(modal) {
    // Close when clicking the close button
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
      });
    }
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    // Handle form submissions
    const form = modal.querySelector('form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show success message
        showNotification('Форма успешно отправлена', 'success');
        
        // Close modal
        modal.classList.remove('active');
      });
    }
  });
  
  // Initialize contact team form
  const contactForm = document.getElementById('contact-team-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;
      
      console.log('Contact form submitted:', { subject, message });
      
      // Show success message
      showNotification('Сообщение успешно отправлено команде проекта', 'success');
      
      // Close modal
      document.getElementById('contact-team-modal').classList.remove('active');
      
      // Reset form
      this.reset();
    });
  }
  
  // Initialize subscribe form
  const subscribeForm = document.getElementById('subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('notification-email').value;
      const checkboxes = this.querySelectorAll('input[type="checkbox"]:checked');
      const notificationTypes = Array.from(checkboxes).map(cb => cb.value);
      
      console.log('Subscribe form submitted:', { email, notificationTypes });
      
      // Show success message
      showNotification('Вы успешно подписались на обновления проекта', 'success');
      
      // Close modal
      document.getElementById('subscribe-updates-modal').classList.remove('active');
      
      // Reset form
      this.reset();
    });
  }
}

/**
 * Show a specific modal
 * @param {string} modalId - ID of the modal to show
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Initialize tooltips using Tippy.js
 */
function initTooltips() {
  if (typeof tippy === 'function') {
    tippy('[data-tippy-content]', {
      placement: 'left',
      arrow: true,
      animation: 'scale',
      theme: 'light-border'
    });
  }
}

/**
 * Initialize countdown timer
 */
function initCountdownTimer() {
  const countdownElement = document.getElementById('launch-countdown');
  
  if (countdownElement) {
    // Set launch date (42 days from now)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 42);
    
    // Update countdown every second
    const countdownInterval = setInterval(function() {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Format with leading zeros
      const formattedDays = String(days).padStart(2, '0');
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');
      
      // Display countdown
      countdownElement.textContent = `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      
      // If countdown is finished
      if (distance < 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = "Проект запущен!";
      }
    }, 1000);
  }
}
