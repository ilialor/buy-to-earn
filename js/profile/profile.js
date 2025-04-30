/**
 * Profile management module
 * Handles loading and updating user profile data
 */

import { getUserProfile, updateUserProfile, changePassword, updateNotificationPreferences } from '../api/user-service.js';

// DOM elements
const profileLoading = document.getElementById('profile-loading');
const profileError = document.getElementById('profile-error');
const profileContent = document.getElementById('profile-content');
const retryButton = document.getElementById('retry-profile-load');

// Profile info elements
const profileHeaderName = document.getElementById('profile-header-name');
const profileHeaderEmail = document.getElementById('profile-header-email');
const profileHeaderMemberSince = document.getElementById('profile-header-member-since');
const profileInvestments = document.getElementById('profile-investments');
const profileNfts = document.getElementById('profile-nfts');
const profileEarnings = document.getElementById('profile-earnings');

// Form elements
const profileForm = document.getElementById('profile-form');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileBio = document.getElementById('profile-bio');
const profileFormError = document.getElementById('profile-form-error');

// Password form elements
const passwordForm = document.getElementById('password-form');
const currentPassword = document.getElementById('current-password');
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const passwordFormError = document.getElementById('password-form-error');

// Notification form elements
const notificationForm = document.getElementById('notification-form');
const investmentNotifications = document.getElementById('investment-notifications');
const paymentNotifications = document.getElementById('payment-notifications');
const marketingNotifications = document.getElementById('marketing-notifications');
const notificationFormError = document.getElementById('notification-form-error');

/**
 * Format date to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format currency with dollar sign
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '$0';
  return `$${amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
}

/**
 * Show error message in form
 * @param {HTMLElement} errorElement - Error element
 * @param {string} message - Error message
 */
function showFormError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

/**
 * Load user profile data
 */
async function loadUserProfile() {
  profileLoading.style.display = 'flex';
  profileError.style.display = 'none';
  profileContent.style.display = 'none';
  
  try {
    const profile = await getUserProfile();
    
    // Update header info
    profileHeaderName.textContent = profile.name || '';
    profileHeaderEmail.textContent = profile.email || '';
    profileHeaderMemberSince.textContent = `Участник с: ${formatDate(profile.createdAt)}`;
    
    // Update stats
    profileInvestments.textContent = profile.stats?.investments || '0';
    profileNfts.textContent = profile.stats?.nfts || '0';
    profileEarnings.textContent = formatCurrency(profile.stats?.totalEarnings);
    
    // Update form values
    profileName.value = profile.name || '';
    profileEmail.value = profile.email || '';
    profileBio.value = profile.bio || '';
    
    // Update notification checkboxes
    investmentNotifications.checked = profile.preferences?.notifications?.investmentNotifications !== false;
    paymentNotifications.checked = profile.preferences?.notifications?.paymentNotifications !== false;
    marketingNotifications.checked = profile.preferences?.notifications?.marketingNotifications === true;
    
    // Show profile content
    profileLoading.style.display = 'none';
    profileContent.style.display = 'block';
  } catch (error) {
    console.error('Error loading profile:', error);
    profileLoading.style.display = 'none';
    profileError.style.display = 'block';
  }
}

/**
 * Update user profile
 * @param {Event} event - Form submission event
 */
async function handleProfileUpdate(event) {
  event.preventDefault();
  
  const updateData = {
    name: profileName.value,
    email: profileEmail.value,
    bio: profileBio.value
  };
  
  try {
    // Show loading state
    const submitButton = profileForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Обновление...';
    submitButton.disabled = true;
    
    // Submit update
    await updateUserProfile(updateData);
    
    // Reload profile
    await loadUserProfile();
    
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    showFormError(profileFormError, 'Не удалось обновить профиль. Пожалуйста, попробуйте позже.');
    
    // Reset button
    const submitButton = profileForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Обновить профиль';
    submitButton.disabled = false;
  }
}

/**
 * Change user password
 * @param {Event} event - Form submission event
 */
async function handlePasswordChange(event) {
  event.preventDefault();
  
  // Validate passwords
  if (newPassword.value !== confirmPassword.value) {
    showFormError(passwordFormError, 'Новые пароли не совпадают.');
    return;
  }
  
  try {
    // Show loading state
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Изменение...';
    submitButton.disabled = true;
    
    // Submit password change
    await changePassword(currentPassword.value, newPassword.value);
    
    // Clear form
    passwordForm.reset();
    
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    
    // Show success message
    showFormError(passwordFormError, 'Пароль успешно изменен.');
    passwordFormError.style.color = 'green';
  } catch (error) {
    console.error('Error changing password:', error);
    showFormError(passwordFormError, 'Не удалось изменить пароль. Проверьте текущий пароль.');
    
    // Reset button
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Изменить пароль';
    submitButton.disabled = false;
  }
}

/**
 * Update notification preferences
 * @param {Event} event - Form submission event
 */
async function handleNotificationUpdate(event) {
  event.preventDefault();
  
  const preferences = {
    investmentNotifications: investmentNotifications.checked,
    paymentNotifications: paymentNotifications.checked,
    marketingNotifications: marketingNotifications.checked
  };
  
  try {
    // Show loading state
    const submitButton = notificationForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Сохранение...';
    submitButton.disabled = true;
    
    // Submit update
    await updateNotificationPreferences(preferences);
    
    // Reset button
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    
    // Show success message
    showFormError(notificationFormError, 'Настройки уведомлений обновлены.');
    notificationFormError.style.color = 'green';
  } catch (error) {
    console.error('Error updating notifications:', error);
    showFormError(notificationFormError, 'Не удалось обновить настройки уведомлений.');
    
    // Reset button
    const submitButton = notificationForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Сохранить настройки';
    submitButton.disabled = false;
  }
}

/**
 * Initialize profile functionality
 */
function initProfile() {
  // Load profile data
  loadUserProfile();
  
  // Set up event listeners
  retryButton.addEventListener('click', loadUserProfile);
  profileForm.addEventListener('submit', handleProfileUpdate);
  passwordForm.addEventListener('submit', handlePasswordChange);
  notificationForm.addEventListener('submit', handleNotificationUpdate);
}

// Export the init function
export { initProfile };
