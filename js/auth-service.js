/**
 * Authentication Service for Ateira projects
 * Handles JWT authentication through Nginx API Gateway
 * With support for local mock authentication
 * Ensures consistent auth state between page transitions
 */

class AuthService {
  constructor() {
    // Use window.apiBaseUrl instead of process.env which doesn't work in browser
    this.baseUrl = window.apiBaseUrl || window.API_BASE_URL || 'http://localhost';
    
    // Flag to determine operation mode (real server or mock)
    this.useMockAuth = false; //(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // Возвращаем использование localStorage даже для моковой авторизации,
    // т.к. другие модули (LocalAuth) используют localStorage
    this.storage = localStorage;
    
    // console.log('AuthService: Инициализация в режиме', this.useMockAuth ? 'мок' : 'реальный API');
    // console.log('AuthService: Используется хранилище localStorage для совместимости с LocalAuth');
    
    // Инициализируем токены и пользователя
    this.accessToken = this.storage.getItem('access_token') || null;
    this.refreshToken = this.getCookie('refresh_token') || null;
    this.currentUser = null;
    this.listeners = [];
    
    if (this.useMockAuth) {
      console.warn('Using mock authentication for local development');
    }
    
    // Auth state transition key for preserving state between pages
    this.AUTH_STATE_KEY = 'co-intent-auth-state';
    
    // Добавляем параметр текущего домена для отладки
    this.currentDomain = `${window.location.protocol}//${window.location.host}`;
    console.log('AuthService: Текущий домен', this.currentDomain);
    
    // Ключи для совместимости с LocalAuth
    this.LOCAL_AUTH_USER_KEY = 'auth_user';
    this.LOCAL_AUTH_TOKEN_KEY = 'auth_token';
    
    // Setup page transition handling
    this.setupPageTransitionHandling();
    
    // Инициализируем сразу
    this.init();
  }

  init() {
    console.log('AuthService: Инициализация...');
    
    // Проверяем наличие пользователя в LocalAuth
    const foundLocalUser = this.checkLocalAuthUser();
    
    // Если нет LocalAuth пользователя, пробуем загрузить из нашего хранилища
    if (!foundLocalUser && !this.currentUser) {
      // First try to load from the page transition state storage
      const stateLoaded = this.loadAuthState();
      
      // If no transition state, check normal saved user
      if (!stateLoaded) {
        const savedUser = this.storage.getItem('current_user');
        if (savedUser) {
          try {
            this.currentUser = JSON.parse(savedUser);
            console.log('AuthService: User restored from storage', this.currentUser);
          } catch (e) {
            console.error('AuthService: Error restoring user', e);
            this.storage.removeItem('current_user');
          }
        }
      }
    }

    // Notify listeners if user exists
    if (this.currentUser) {
      this.notifyListeners();
    }
    
    // Обновляем UI
    this.updateAuthUI();
  }
  
  /**
   * Проверяет наличие пользователя в LocalAuth и синхронизирует с AuthService
   */
  checkLocalAuthUser() {
    try {
      // Проверяем, есть ли пользователь в LocalAuth
      const localAuthUser = this.storage.getItem(this.LOCAL_AUTH_USER_KEY);
      const localAuthToken = this.storage.getItem(this.LOCAL_AUTH_TOKEN_KEY);
      
      console.log('AuthService: Проверка LocalAuth пользователя...');
      console.log('AuthService: LocalAuth пользователь существует:', !!localAuthUser);
      
      // Также проверяем наличие объекта window.localAuth
      if (window.localAuth && window.localAuth.currentUser) {
        console.log('AuthService: Найден объект window.localAuth с пользователем:', window.localAuth.currentUser);
        try {
          // Создаем токен на основе данных пользователя
          this.accessToken = 'mock_access_token_' + Date.now();
          this.storage.setItem('access_token', this.accessToken);
          
          // Создаем пользователя для AuthService из window.localAuth
          this.currentUser = {
            id: window.localAuth.currentUser.userId || window.localAuth.currentUser.id || 'mock_user_' + Date.now(),
            email: window.localAuth.currentUser.email || 'user@example.com',
            displayName: window.localAuth.currentUser.displayName || window.localAuth.currentUser.email?.split('@')[0] || 'Test User',
            isVerified: true
          };
          
          // Сохраняем пользователя
          this.storage.setItem('current_user', JSON.stringify(this.currentUser));
          
          // Сохраняем состояние авторизации
          this.saveAuthState();
          
          console.log('AuthService: Пользователь успешно синхронизирован с window.localAuth', this.currentUser);
          return true;
        } catch (e) {
          console.error('AuthService: Ошибка при синхронизации с window.localAuth', e);
        }
      }
      
      if (localAuthUser) {
        console.log('AuthService: Найден пользователь в LocalAuth, синхронизируем');
        
        try {
          // Пробуем разные форматы данных пользователя
          let userObj;
          try {
            // Стандартный формат JSON
            userObj = JSON.parse(localAuthUser);
          } catch (parseError) {
            // Если не удается распарсить JSON, возможно, строка
            userObj = {
              email: localAuthUser,
              id: 'local-user-' + Date.now()
            };
          }
          
          // Создаем токен на основе данных пользователя
          this.accessToken = localAuthToken || 'mock_access_token_' + Date.now();
          this.storage.setItem('access_token', this.accessToken);
          
          // Создаем пользователя для AuthService
          this.currentUser = {
            id: userObj.userId || userObj.id || 'mock_user_' + Date.now(),
            email: userObj.email || 'user@example.com',
            displayName: userObj.displayName || userObj.email?.split('@')[0] || 'Test User',
            isVerified: true
          };
          
          // Сохраняем пользователя
          this.storage.setItem('current_user', JSON.stringify(this.currentUser));
          
          // Сохраняем состояние авторизации
          this.saveAuthState();
          
          console.log('AuthService: Пользователь успешно синхронизирован с LocalAuth', this.currentUser);
          return true;
        } catch (e) {
          console.error('AuthService: Ошибка при синхронизации с LocalAuth', e);
        }
      } else {
        console.log('AuthService: Пользователь в LocalAuth не найден');
      }
    } catch (e) {
      console.error('AuthService: Ошибка при проверке пользователя в LocalAuth', e);
    }
    
    return false;
  }

  // Login through Nginx API Gateway or mock for local development
  async login(credentials) {
    // If using mock auth for local development
    if (this.useMockAuth) {
      console.log('Using mock auth login for local development');
      try {
        // Create mock tokens
        this.accessToken = 'mock_access_token_' + Date.now();
        this.refreshToken = 'mock_refresh_token_' + Date.now();
        
        // Store tokens
        this.storage.setItem('access_token', this.accessToken);
        
        // Create mock user
        this.currentUser = {
          id: 'mock_user_1',
          email: credentials.email || 'user@example.com',
          displayName: credentials.displayName || credentials.email?.split('@')[0] || 'Test User',
          isVerified: true
        };
        
        // Store user
        this.storage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Save auth state for page transitions
        this.saveAuthState();
        
        // Notify listeners
        this.notifyListeners();
        
        // Dispatch login event for other components to react
        document.dispatchEvent(new Event('login'));
        
        return this.currentUser;
      } catch (error) {
        console.error('AuthService: Mock login failed', error);
        throw error;
      }
    }
    
    // Real API login
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Store tokens
      this.storage.setItem('access_token', this.accessToken);
      document.cookie = `refresh_token=${this.refreshToken}; path=/; HttpOnly; SameSite=None; Secure`;

      // Fetch user profile
      await this.loadUserProfile();
      
      // Save auth state for page transitions
      this.saveAuthState();
      
      // Notify listeners
      this.notifyListeners();
      
      // Dispatch login event
      document.dispatchEvent(new Event('login'));

      return this.currentUser;
    } catch (error) {
      console.error('AuthService: Login failed', error);
      throw error;
    }
  }

  // Register user through Nginx API Gateway or mock for local development
  async register(userData) {
    // If using mock auth for local development
    if (this.useMockAuth) {
      console.log('Using mock auth register for local development');
      try {
        // Create mock tokens
        this.accessToken = 'mock_access_token_reg_' + Date.now();
        this.refreshToken = 'mock_refresh_token_reg_' + Date.now();
        
        // Store tokens
        this.storage.setItem('access_token', this.accessToken);
        
        // Create mock user
        this.currentUser = {
          id: 'mock_user_reg_' + Date.now(),
          email: userData.email || 'user@example.com',
          displayName: userData.name || userData.email?.split('@')[0] || 'Registered User',
          isVerified: false // Typically false until email verification
        };
        
        // Store user
        this.storage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Save auth state for page transitions
        this.saveAuthState();
        
        // Notify listeners
        this.notifyListeners();
        
        // Dispatch register event (or login, as registration often implies login)
        document.dispatchEvent(new Event('register')); // Or 'login'
        
        return this.currentUser;
      } catch (error) {
        console.error('AuthService: Mock register failed', error);
        throw error;
      }
    }
    
    // Real API register
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // userData should include { email, password, name }
        credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Assuming registration also returns tokens like login
      this.accessToken = data.access_token; 
      this.refreshToken = data.refresh_token;

      // Store tokens
      this.storage.setItem('access_token', this.accessToken);
      // Consider setting refresh_token as a cookie if your backend expects it
      // document.cookie = `refresh_token=${this.refreshToken}; path=/; HttpOnly; SameSite=None; Secure`;

      // Fetch user profile (or use data from registration response if it's complete)
      // If register response already contains full user profile, this might not be needed
      await this.loadUserProfile(); 
      
      // Save auth state for page transitions
      this.saveAuthState();
      
      // Notify listeners
      this.notifyListeners();
      
      // Dispatch register/login event
      document.dispatchEvent(new Event('register')); // Or 'login'

      return this.currentUser;
    } catch (error) {
      console.error('AuthService: Registration failed', error);
      throw error;
    }
  }

  // Refresh tokens through Nginx API Gateway
  async refreshToken() {
    // For mock auth, just return a new mock token
    if (this.useMockAuth && this.accessToken) {
      console.log('Mock refresh token');
      this.accessToken = 'mock_refreshed_token_' + Date.now();
      this.storage.setItem('access_token', this.accessToken);
      return true;
    }
    
    // Real API refresh
    try {
      const response = await fetch('/auth/refresh', {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Update stored tokens
      this.storage.setItem('access_token', this.accessToken);
      document.cookie = `refresh_token=${this.refreshToken}; path=/; HttpOnly; SameSite=None; Secure`;

      return true;
    } catch (error) {
      console.error('AuthService: Token refresh failed', error);
      this.logout();
      return false;
    }
  }

  // Logout through Nginx API Gateway
  async logout() {
    try {
      // For mock auth, just clear local data
      if (this.useMockAuth) {
        console.log('Using mock logout for local development');
      } else {
        // Real API logout - attempt to call server but don't wait for response
        try {
          fetch('/auth/logout', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            },
            credentials: 'include'
          }).catch(err => {
            console.warn('AuthService: Logout request failed', err);
          });
        } catch (err) {
          console.warn('AuthService: Error during logout request', err);
        }
      }
      
      // Clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      this.currentUser = null;
      
      // Clear storage
      this.storage.removeItem('access_token');
      this.storage.removeItem('current_user');
      this.storage.removeItem(this.AUTH_STATE_KEY);
      
      // Clear cookies
      this.deleteCookie('refresh_token');
      
      // Если есть window.localAuth, вызываем его метод выхода
      if (window.localAuth && typeof window.localAuth.signOut === 'function') {
        try {
          window.localAuth.signOut();
          console.log('AuthService: Успешно вызван window.localAuth.signOut()');
        } catch (e) {
          console.error('AuthService: Ошибка при вызове window.localAuth.signOut()', e);
        }
      }
      
      // Notify listeners
      this.notifyListeners();
      
      // Dispatch logout event for other components to react
      document.dispatchEvent(new Event('logout'));
      
      return true;
    } catch (error) {
      console.error('AuthService: Logout failed', error);
      return false;
    }
  }

  // Load user profile
  async loadUserProfile() {
    if (!this.accessToken) return null;
    
    // For mock auth, just return the current user
    if (this.useMockAuth) {
      return this.currentUser;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const userData = await response.json();
      this.currentUser = userData;
      this.storage.setItem('current_user', JSON.stringify(userData));

      // Notify listeners
      this.notifyListeners();

      return userData;
    } catch (error) {
      console.error('AuthService: Failed to load user profile', error);
      return null;
    }
  }

  // Get current user
  getCurrentUser() {
    // Если текущий пользователь не установлен, попробуем синхронизироваться с LocalAuth
    if (!this.currentUser) {
      this.checkLocalAuthUser();
    }
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    // Если пользователь не установлен, попробуем проверить LocalAuth
    if (!this.currentUser) {
      this.checkLocalAuthUser();
    }
    return !!this.accessToken && !!this.currentUser;
  }
  
  /**
   * Get current JWT access token
   * @returns {string|null} JWT access token or null if not authenticated
   */
  getToken() {
    // Если токен не установлен, попробуем проверить LocalAuth
    if (!this.accessToken) {
      this.checkLocalAuthUser();
    }
    return this.accessToken;
  }
  
  /**
   * Update UI based on authentication status
   * Should be called on all pages with authentication UI
   */
  updateAuthUI() {
    const isAuth = this.isAuthenticated();
    const authControls = document.querySelector('.user-controls-auth');
    const loggedInControls = document.querySelector('.user-controls-logged-in');
    
    if (authControls && loggedInControls) {
      console.log('Статус авторизации:', isAuth ? 'авторизован' : 'не авторизован');
      
      if (isAuth) {
        // Если пользователь авторизован, показываем блок для авторизованных
        authControls.style.display = 'none';
        loggedInControls.style.display = 'flex';
        
        // Обновляем информацию о пользователе
        const userDisplayName = document.getElementById('user-display-name');
        if (userDisplayName) {
          const userName = this.currentUser ? 
            (this.currentUser.displayName || this.currentUser.email || 'Пользователь') : 
            'Пользователь';
          userDisplayName.textContent = userName;
        }
      } else {
        // Если пользователь не авторизован, показываем блок для неавторизованных
        authControls.style.display = 'flex';
        loggedInControls.style.display = 'none';
      }
    }
  }
  
  /**
   * Setup authentication listeners on page
   * Sets up sign in, sign out and profile dropdown functionality
   * This function should be called after DOM is fully loaded
   */
  setupAuthListeners() {
    console.log('AuthService: Настройка обработчиков событий авторизации');
    
    // Используем обычный способ назначения обработчиков для кнопки Sign In
    const signInBtn = document.getElementById('sign-in-btn');
    if (signInBtn) {
      console.log('AuthService: Найдена кнопка sign-in-btn, устанавливаем обработчик');
      signInBtn.onclick = () => {
        console.log('AuthService: Клик по кнопке sign-in-btn');
        
        const authModal = document.getElementById('auth-modal');
        console.log('AuthService: Проверка authModal перед показом:', authModal);
        if (authModal) {
          this.showModal('auth-modal');
        } else {
          // Если модального окна нет, перенаправляем на страницу index.html с параметром auth=signin
          // Сохраняем состояние авторизации перед переходом
          this.saveAuthState();
          
          // Используем просто присваивание location.href вместо всяких переходов
          console.log('AuthService: Перенаправление на index.html?auth=signin');
          window.location.href = 'index.html?auth=signin';
        }
        
        // Возвращаем false, чтобы предотвратить стандартное поведение ссылки
        return false;
      };
    } else {
      console.warn('AuthService: Кнопка sign-in-btn не найдена');
    }
    
    // Кнопка Sign In мобильная - тоже используем прямое присваивание onclick
    const signInMobileBtn = document.getElementById('sign-in-mobile');
    if (signInMobileBtn) {
      console.log('AuthService: Найдена мобильная кнопка sign-in-mobile, устанавливаем обработчик');
      signInMobileBtn.onclick = () => {
        console.log('AuthService: Клик по мобильной кнопке sign-in-mobile');
        
        if (document.getElementById('auth-modal')) {
          this.showModal('auth-modal');
        } else {
          // Сохраняем состояние авторизации перед переходом
          this.saveAuthState();
          
          // Прямое присваивание location.href
          console.log('AuthService: Перенаправление на index.html?auth=signin');
          window.location.href = 'index.html?auth=signin';
        }
        
        // Возвращаем false, чтобы предотвратить стандартное поведение ссылки
        return false;
      };
    }
    
    // Выход из системы - тоже используем прямое присваивание onclick
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.onclick = () => {
        this.logout()
          .then(() => {
            this.showNotification('Вы успешно вышли из системы', 'success');
            this.updateAuthUI();
          })
          .catch(error => {
            console.error('Ошибка при выходе:', error);
            this.showNotification('Ошибка при выходе из системы', 'error');
          });
        
        // Возвращаем false, чтобы предотвратить стандартное поведение ссылки
        return false;
      };
    }
    
    // Обработчик клика по аватару и user-info
    this.setupDropdownHandlers();
    
    // Добавляем обработчики для всех ссылок, чтобы сохранять состояние авторизации перед переходом
    this.setupLinkHandlers();
  }
  
  /**
   * Setup handlers for all links to save auth state before navigation
   */
  setupLinkHandlers() {
    // Находим все ссылки на странице
    const links = document.querySelectorAll('a');
    
    // Добавляем обработчик для каждой ссылки
    links.forEach(link => {
      // Проверяем, является ли ссылка внутренней (не внешней)
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        // Добавляем обработчик для внутренних ссылок
        link.addEventListener('click', (e) => {
          // Сохраняем состояние авторизации перед переходом
          console.log('Переход по ссылке', href, ', сохраняем состояние авторизации');
          this.saveAuthState();
        });
      }
    });
    
    console.log('Настроены обработчики для всех внутренних ссылок');
  }
  
  /**
   * Setup user dropdown menu handlers
   */
  setupDropdownHandlers() {
    // Обработчик клика по блоку информации пользователя
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.addEventListener('click', (e) => {
        console.log('Клик по блоку информации пользователя');
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
          // Явно задаем стили display, т.к. classList.toggle может не работать с CSS
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            dropdown.classList.remove('show');
          } else {
            dropdown.style.display = 'block';
            dropdown.classList.add('show');
          }
          e.stopPropagation();
        }
      });
      
      // Обработчик для аватара отдельно
      const userAvatar = document.getElementById('user-avatar');
      if (userAvatar) {
        userAvatar.addEventListener('click', (e) => {
          console.log('Клик по аватару пользователя');
          const dropdown = document.getElementById('user-dropdown');
          if (dropdown) {
            // Явно задаем стили display, т.к. classList.toggle может не работать с CSS
            if (dropdown.style.display === 'block') {
              dropdown.style.display = 'none';
              dropdown.classList.remove('show');
            } else {
              dropdown.style.display = 'block';
              dropdown.classList.add('show');
            }
            e.stopPropagation();
          }
        });
      }
      
      // Закрытие дропдауна при клике вне него
      document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && (dropdown.style.display === 'block' || dropdown.classList.contains('show')) 
            && !userInfo.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          dropdown.classList.remove('show');
        }
      });
    }
  }
  
  /**
   * Show notification for user feedback
   * @param {string} message Message to display
   * @param {string} type Notification type: info, success, warning, error
   */
  showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Добавляем в контейнер или в body
    const container = document.getElementById('notification-container') || document.body;
    container.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Скрываем через 3 секунды
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  /**
   * Show modal dialog
   * @param {string} modalId Modal element ID
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    console.log('AuthService showModal: попытка показать modalId:', modalId, 'Найденный элемент modal:', modal);
    if (modal) {
      console.log('AuthService showModal: перед добавлением класса show, текущие классы:', modal.className);
      modal.classList.add('show');
      console.log('AuthService showModal: после добавления класса show, текущие классы:', modal.className);
      document.body.style.overflow = 'hidden';
    } else {
      console.error('AuthService showModal: модальное окно с ID', modalId, 'НЕ НАЙДЕНО!');
    }
  }
  
  /**
   * Close modal dialog
   * @param {string} modalId Modal element ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  /**
   * Initialize auth UI on page load
   * Should be called when DOM is ready
   */
  initializeAuthUI() {
    console.log('Инициализация авторизации и UI');
    
    // Синхронизируемся с LocalAuth перед настройкой UI
    this.checkLocalAuthUser();
    
    // Настраиваем обработчики событий
    this.setupAuthListeners();
    
    // Обновляем UI
    this.updateAuthUI();
    
    // Возвращаем this для возможности цепочки вызовов
    return this;
  }

  // Get Authorization header
  getAuthHeader() {
    return this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {};
  }

  // Add auth headers to fetch options
  addAuthHeaders(options = {}) {
    if (this.accessToken) {
      options.headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }
    options.credentials = 'include';
    return options;
  }

  // Add listener for auth state changes
  addAuthStateListener(listener) {
    this.listeners.push(listener);
    if (this.currentUser) {
      listener(this.currentUser);
    }
  }

  // Remove listener
  removeAuthStateListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Notify all listeners of auth state change
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('AuthService: Error in listener', e);
      }
    });
  }

  /**
   * Setup handlers for page transitions to preserve auth state
   */
  setupPageTransitionHandling() {
    // Handle page unload/navigation
    window.addEventListener('beforeunload', () => {
      console.log('beforeunload: Сохраняем состояние авторизации');
      this.saveAuthState();
    });
    
    // For single page app navigation
    window.addEventListener('popstate', () => {
      console.log('popstate: Сохраняем состояние авторизации');
      this.saveAuthState();
    });
    
    // Проверяем загруженное состояние при загрузке страницы
    window.addEventListener('load', () => {
      console.log('load: Проверяем состояние авторизации');
      
      // Сначала проверяем LocalAuth
      this.checkLocalAuthUser();
      
      // Затем пробуем загрузить из нашего хранилища, если LocalAuth не помог
      if (!this.currentUser) {
        this.loadAuthState();
      }
      
      // После успешной загрузки состояния авторизации, обновляем UI
      this.updateAuthUI();
      
      // После полной загрузки DOM, настраиваем обработчики
      this.setupAuthListeners();
      
      // Проверяем URL параметры
      const urlParams = new URLSearchParams(window.location.search);
      const fromPage = urlParams.get('from');
      if (fromPage) {
        console.log('Переход со страницы:', fromPage);
      }
      
      // Если на странице есть форма авторизации, настраиваем ее
      this.setupAuthForm();
    });
  }
  
  /**
   * Настройка формы авторизации, если она есть на странице
   */
  setupAuthForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      console.log('AuthService: Найдена форма авторизации, устанавливаем обработчик');
      
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginForm.querySelector('[name="email"]')?.value;
        const password = loginForm.querySelector('[name="password"]')?.value;
        
        if (email && password) {
          try {
            await this.login({ email, password });
            this.showNotification('Вы успешно вошли в систему', 'success');
            this.updateAuthUI();
            
            // Закрываем модальное окно, если оно есть
            const modal = document.querySelector('.modal.show');
            if (modal) {
              modal.classList.remove('show');
            }
          } catch (error) {
            console.error('Ошибка при входе:', error);
            this.showNotification('Ошибка при входе в систему', 'error');
          }
        } else {
          this.showNotification('Введите email и пароль', 'warning');
        }
      });
    }
  }
  
  /**
   * Save authentication state to storage to persist between page transitions
   */
  saveAuthState() {
    try {
      // Save current user and token to storage
      if (this.currentUser && this.accessToken) {
        const authState = {
          user: this.currentUser,
          token: this.accessToken,
          lastUpdated: Date.now(),
          page: window.location.pathname
        };
        this.storage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
        console.log('Auth state saved for page transition:', authState);
      } else {
        this.storage.removeItem(this.AUTH_STATE_KEY);
        console.log('Auth state cleared (no user or token)');
      }
    } catch (err) {
      console.error('Error saving auth state:', err);
    }
  }

  /**
   * Load authentication state from storage
   * @returns {boolean} - Whether state was successfully loaded
   */
  loadAuthState() {
    try {
      const storedState = this.storage.getItem(this.AUTH_STATE_KEY);
      console.log('Loading auth state, stored state:', storedState);
      
      if (storedState) {
        const state = JSON.parse(storedState);
        
        // Only restore state if it's not too old (30 min)
        const maxAge = 30 * 60 * 1000; // 30 minutes
        const isExpired = (Date.now() - state.lastUpdated) > maxAge;
        
        console.log('Auth state age:', (Date.now() - state.lastUpdated) / 1000, 'seconds');
        console.log('Auth state expired?', isExpired);
        
        if (!isExpired && state.user && state.token) {
          console.log('Restoring auth state from page transition:', state);
          // Restore auth state to service
          this.accessToken = state.token;
          this.currentUser = state.user;
          
          // Also update standard storage
          this.storage.setItem('access_token', this.accessToken);
          this.storage.setItem('current_user', JSON.stringify(this.currentUser));
          
          return true;
        } else if (isExpired) {
          console.log('Stored auth state expired, cleaning up');
          this.storage.removeItem(this.AUTH_STATE_KEY);
        }
      } else {
        console.log('No stored auth state found');
      }
      return false;
    } catch (err) {
      console.error('Error loading auth state:', err);
      return false;
    }
  }

  // Set cookie with optional domain, maxAge, and httpOnly settings
  setCookie(name, value, options = {}) {
    let cookie = `${name}=${value}`;
    
    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }
    
    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`;
    }
    
    if (options.path) {
      cookie += `; path=${options.path}`;
    } else {
      cookie += '; path=/'; // Default path
    }
    
    if (options.secure) {
      cookie += '; secure';
    }
    
    if (options.httpOnly) {
      cookie += '; httpOnly';
    }
    
    if (options.sameSite) {
      cookie += `; sameSite=${options.sameSite}`;
    }
    
    document.cookie = cookie;
  }
  
  // Delete a cookie by setting its expiration in the past
  deleteCookie(name) {
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

// Создаем и экспортируем экземпляр AuthService
const authService = new AuthService();

// Глобально доступный экземпляр для отладки
window.authService = authService;

// Export singleton instance
export default authService;
