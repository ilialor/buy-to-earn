/**
 * Team Section Functionality
 * 
 * JavaScript functionality for the team section on the project details page.
 */

// Initialize team section functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initTeamFilters();
  initTeamContactButtons();
  initTeamSectionButtons();
});

/**
 * Initialize team filters functionality
 */
function initTeamFilters() {
  const filterButtons = document.querySelectorAll('.team-filter-btn');
  const teamMembers = document.querySelectorAll('.team-member');
  
  if (!filterButtons.length || !teamMembers.length) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Show/hide team members based on filter
      teamMembers.forEach(member => {
        if (filter === 'all') {
          member.style.display = 'flex';
          // Add animation
          animateTeamMember(member);
        } else {
          const category = member.getAttribute('data-category');
          if (category === filter) {
            member.style.display = 'flex';
            // Add animation
            animateTeamMember(member);
          } else {
            member.style.display = 'none';
          }
        }
      });
    });
  });
}

/**
 * Animate team member card appearance
 * @param {HTMLElement} member - The team member element to animate
 */
function animateTeamMember(member) {
  // Reset animation
  member.style.animation = 'none';
  
  // Trigger reflow
  void member.offsetWidth;
  
  // Start animation
  member.style.animation = 'fadeInUp 0.5s ease forwards';
}

/**
 * Initialize team contact buttons
 */
function initTeamContactButtons() {
  const contactButtons = document.querySelectorAll('.contact-member-btn');
  
  if (!contactButtons.length) return;
  
  contactButtons.forEach(button => {
    button.addEventListener('click', function() {
      const memberName = this.getAttribute('data-member');
      
      // Open contact modal
      const contactModal = document.getElementById('contact-team-modal');
      if (contactModal) {
        // Set the team member name in the modal
        const modalTitle = contactModal.querySelector('.modal-title');
        if (modalTitle) {
          modalTitle.textContent = `Связаться с ${memberName}`;
        }
        
        // Show the modal
        contactModal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Add event listener to close the modal
        const closeModalBtn = contactModal.querySelector('.close-modal');
        if (closeModalBtn) {
          closeModalBtn.addEventListener('click', function() {
            contactModal.classList.remove('active');
            document.body.classList.remove('modal-open');
          });
        }
      }
    });
  });
}

/**
 * Initialize team section buttons
 */
function initTeamSectionButtons() {
  const viewAllTeamBtn = document.getElementById('view-all-team');
  const joinTeamBtn = document.getElementById('join-team');
  
  if (viewAllTeamBtn) {
    viewAllTeamBtn.addEventListener('click', function() {
      // Redirect to team page or show full team modal
      showNotification('Полная информация о команде будет доступна в ближайшее время', 'info');
    });
  }
  
  if (joinTeamBtn) {
    joinTeamBtn.addEventListener('click', function() {
      // Open join team modal or redirect to join page
      showNotification('Форма для присоединения к команде будет открыта', 'success');
      
      // Redirect to join team page after a short delay
      setTimeout(() => {
        // This would be replaced with actual redirect
        console.log('Redirecting to join team page...');
        // window.location.href = 'join-team.html';
      }, 1500);
    });
  }
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) return;
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Create notification content
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    </div>
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Add active class after a small delay (for animation)
  setTimeout(() => {
    notification.classList.add('active');
  }, 10);
  
  // Add close button functionality
  const closeButton = notification.querySelector('.notification-close');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      closeNotification(notification);
    });
  }
  
  // Auto close after 5 seconds
  setTimeout(() => {
    closeNotification(notification);
  }, 5000);
}

/**
 * Close notification
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
  notification.classList.remove('active');
  
  // Remove from DOM after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}
