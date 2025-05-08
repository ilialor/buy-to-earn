/**
 * JWT Authentication Form Component
 * Provides login/registration UI for JWT authentication
 */

import authService from '../auth-service.js';

class AuthForm {
  constructor(containerId = 'auth-form-container') {
    this.containerId = containerId;
    this.formContainer = null;
    this.isLoginMode = true; // true = login, false = register
    
    // Bind methods
    this._handleSubmit = this._handleSubmit.bind(this);
    this._switchMode = this._switchMode.bind(this);
  }
  
  /**
   * Initialize the auth form
   */
  init() {
    // Create container if it doesn't exist
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.classList.add('auth-form-container');
      document.body.appendChild(container);
    }
    
    this.formContainer = document.getElementById(this.containerId);
    
    // Render the initial form
    this._renderForm();
    
    // Listen for auth state changes
    document.addEventListener('userChanged', () => {
      this._updateFormVisibility();
    });
    
    // Initial visibility update
    this._updateFormVisibility();
  }
  
  /**
   * Update form visibility based on authentication state
   * @private
   */
  _updateFormVisibility() {
    if (authService.isAuthenticated()) {
      // If user is authenticated, hide the form
      this.formContainer.style.display = 'none';
    } else {
      // If user is not authenticated, show the form
      this.formContainer.style.display = 'block';
    }
  }
  
  /**
   * Render the authentication form
   * @private
   */
  _renderForm() {
    const title = this.isLoginMode ? 'Вход в систему' : 'Регистрация';
    const submitText = this.isLoginMode ? 'Войти' : 'Зарегистрироваться';
    const switchText = this.isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти';
    
    const formHtml = `
      <div class="auth-form-card">
        <h2>${title}</h2>
        <form id="jwt-auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email">
          </div>
          
          <div class="form-group">
            <label for="password">Пароль</label>
            <input type="password" id="password" name="password" required autocomplete="current-password">
          </div>
          
          ${!this.isLoginMode ? `
          <div class="form-group">
            <label for="confirm-password">Подтвердите пароль</label>
            <input type="password" id="confirm-password" name="confirm-password" required autocomplete="new-password">
          </div>
          
          <div class="form-group">
            <label for="username">Имя пользователя</label>
            <input type="text" id="username" name="username" required autocomplete="username">
          </div>
          ` : ''}
          
          <div class="form-error" id="auth-form-error"></div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">${submitText}</button>
            <button type="button" class="btn btn-link switch-mode">${switchText}</button>
          </div>
        </form>
      </div>
    `;
    
    this.formContainer.innerHTML = formHtml;
    
    // Add event listeners
    document.getElementById('jwt-auth-form').addEventListener('submit', this._handleSubmit);
    document.querySelector('.switch-mode').addEventListener('click', this._switchMode);
  }
  
  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   * @private
   */
  async _handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Clear previous errors
    const errorElement = document.getElementById('auth-form-error');
    errorElement.textContent = '';
    
    try {
      if (this.isLoginMode) {
        // Login mode
        await authService.login(email, password);
      } else {
        // Register mode
        const confirmPassword = form['confirm-password'].value;
        const username = form.username.value.trim();
        
        // Validate password match
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        
        // Register user
        await authService.register(email, password, username);
      }
      
      // On success, dispatch userChanged event
      document.dispatchEvent(new Event('userChanged'));
      
    } catch (error) {
      // Display error
      errorElement.textContent = error.message || 'Ошибка аутентификации';
    }
  }
  
  /**
   * Switch between login and register modes
   * @private
   */
  _switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this._renderForm();
  }
  
  /**
   * Show the authentication form
   */
  show() {
    this.formContainer.style.display = 'block';
  }
  
  /**
   * Hide the authentication form
   */
  hide() {
    this.formContainer.style.display = 'none';
  }
}

// Create and export a singleton instance
const authForm = new AuthForm();
export default authForm;
