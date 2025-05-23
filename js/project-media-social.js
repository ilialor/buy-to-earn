/**
 * Project Media and Social JavaScript
 * 
 * This file contains functionality for the media gallery and social networks blocks
 * on the project details page.
 */

// Media Tabs Functionality
function initMediaTabs() {
  const tabs = document.querySelectorAll('.media-tab');
  const tabContents = document.querySelectorAll('.media-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show corresponding content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Fullscreen Image Viewer
function initFullscreenViewer() {
  const mediaItems = document.querySelectorAll('.media-item');
  const fullscreenViewer = document.getElementById('fullscreen-viewer');
  const fullscreenImage = document.getElementById('fullscreen-image');
  const closeButton = document.querySelector('.fullscreen-close');
  
  // Open fullscreen viewer
  mediaItems.forEach(item => {
    item.addEventListener('click', function() {
      const imageSrc = this.getAttribute('data-fullscreen');
      fullscreenImage.src = imageSrc;
      fullscreenViewer.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
  });
  
  // Close fullscreen viewer
  closeButton.addEventListener('click', function() {
    fullscreenViewer.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  });
  
  // Close on background click
  fullscreenViewer.addEventListener('click', function(e) {
    if (e.target === fullscreenViewer) {
      fullscreenViewer.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && fullscreenViewer.classList.contains('active')) {
      fullscreenViewer.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Document Download Functionality
function initDocumentDownloads() {
  const downloadButtons = document.querySelectorAll('.btn-download');
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
      const documentTitle = this.closest('.document-item').querySelector('.document-title').textContent;
      
      // Show notification instead of actual download
      if (typeof showNotification === 'function') {
        showNotification(`Загрузка документа "${documentTitle}" начата`, 'info');
      } else {
        alert(`Загрузка документа "${documentTitle}" начата`);
      }
    });
  });
}

// Join Community Button
function initJoinCommunity() {
  const joinButton = document.querySelector('.btn-join-community');
  
  if (joinButton) {
    joinButton.addEventListener('click', function() {
      // Show notification or modal
      if (typeof showNotification === 'function') {
        showNotification('Вы присоединились к сообществу AIgents!', 'success');
      } else {
        alert('Вы присоединились к сообществу AIgents!');
      }
    });
  }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initMediaTabs();
  initFullscreenViewer();
  initDocumentDownloads();
  initJoinCommunity();
});
