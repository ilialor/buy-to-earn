/**
 * Project Stages Timeline Interactivity
 * 
 * This script adds interactivity to the project stages timeline
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize timeline interactivity
  initializeTimeline();
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
      }
    });
    
    // Add hover effect for stage details
    const stageDetails = item.querySelector('.stage-details');
    if (stageDetails) {
      // Show details on hover
      item.addEventListener('mouseenter', function() {
        stageDetails.style.display = 'block';
      });
      
      // Hide details when mouse leaves
      item.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          stageDetails.style.display = 'none';
        }
      });
    }
  });
  
  // Log initialization
  console.log('Timeline interactivity initialized');
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
