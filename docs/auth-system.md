# Система авторизации Co-Intent Platform

## Общий обзор

Система авторизации Co-Intent Platform реализована с использованием гибкой архитектуры, поддерживающей два режима работы:
1. **Серверная авторизация** - полноценная авторизация через бэкенд-сервис с PostgreSQL и JWT-токенами
2. **Локальная авторизация** - эмуляция системы авторизации через localStorage для разработки и тестирования

Такая архитектура обеспечивает независимость разработки от облачных сервисов и возможность быстрого тестирования.

Система также использует централизованный API Gateway на основе Nginx для маршрутизации запросов и управления доступом к API.

## Компоненты системы

### Серверная авторизация
- Аутентификация по email/password через бэкенд
- Поддержка OAuth (Google)
- Восстановление пароля
- Управление профилем пользователя

### Локальная авторизация
- Эмуляция системы авторизации через localStorage
- Поддержка регистрации/входа по email/password
- Управление сессией пользователя
- Тестовый аккаунт по умолчанию (test@example.com / password)

## Файловая структура

```
js/
  ├── auth.js             # Основной интерфейс для работы с авторизацией
  └── local-auth.js       # Локальная эмуляция системы авторизации
```

## Публичные API эндпоинты

Система предоставляет следующие публичные эндпоинты для аутентификации:

| Эндпоинт | Метод | Описание |
| --- | --- | --- |
| `/auth/login` | POST | Вход в систему с получением JWT-токенов |
| `/auth/refresh` | POST | Обновление access-токена с помощью refresh-токена |
| `/auth/logout` | POST | Выход из системы и инвалидация токенов |
| `/api/auth/check-email` | POST | Проверка существования email в БД |
| `/api/users` | POST | Создание нового пользователя без авторизации |

### Эндпоинт проверки email

Эндпоинт `/api/auth/check-email` позволяет проверить наличие пользователя с указанным email в БД без необходимости авторизации.

**Запрос:**
```json
{
  "email": "example@mail.com"
}
```

**Ответ:**
```json
{
  "exists": true
}
```

Этот эндпоинт используется при регистрации новых пользователей для проверки доступности email, не раскрывая при этом чувствительных данных пользователя.

### Эндпоинт создания пользователей

Эндпоинт `/api/users` с методом POST позволяет создавать новых пользователей в системе без необходимости предварительной авторизации. Этот эндпоинт используется для синхронизации пользователей между локальной аутентификацией и Escrow API.

**Запрос:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "type": "CUSTOMER",
  "initialBalance": 0
}
```

**Ответ:**
```json
{
  "id": "12345",
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "type": "CUSTOMER",
  "balance": 0,
  "createdAt": "2025-05-11T16:39:29.000Z"
}
```

Этот эндпоинт используется при регистрации новых пользователей или при входе в систему для синхронизации пользователей между локальной аутентификацией и Escrow API.

## Процесс инициализации

1. Система проверяет доступность серверной авторизации:
```javascript
function checkAndInitAuth() {
  if (typeof authBackend !== 'undefined' && authBackend.auth) {
    console.log("Серверная авторизация доступна, используем серверную авторизацию");
    backendWorking = true;
  } else {
    console.log("Серверная авторизация недоступна, используем локальную авторизацию");
    backendWorking = false;
    initLocalAuth();
  }
}
```

2. If server-side authentication is not available, local authentication is activated:
```javascript
function initLocalAuth() {
  if (typeof LocalAuth !== 'undefined') {
    LocalAuth.init();
    console.log("Local authentication initialized");
  } else {
    console.error("Error: local authentication module not found");
  }
}
```

## Режимы работы

### Серверная авторизация

```javascript
// Register a new user
async function signUp(email, password, displayName) {
  try {
    const userCredential = await authBackend.auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName });
    return userCredential.user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

// Sign in user
async function signIn(email, password) {
  try {
    const userCredential = await authBackend.auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

// Sign out user
async function signOut() {
  try {
    await authBackend.auth.signOut();
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}

// Auth state change listener
authBackend.auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    // Update UI and state
  } else {
    console.log("User logged out");
    // Update UI and state
  }
});
```

### Локальная авторизация

```javascript
const LocalAuth = {
  users: [],
  currentUser: null,
  listeners: [],
  
  // Initialization
  init() {
    this._loadUsers();
    this._loadSession();
    
    // Create test user if no users exist
    if (this.users.length === 0) {
      this._createTestUser();
    }
  },
  
  // Create test user
  _createTestUser() {
    const testUser = {
      uid: this._generateUid(),
      email: "test@example.com",
      password: "password", // In a real system, the password should be hashed
      displayName: "Test User",
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    
    this.users.push(testUser);
    this._saveUsers();
  },
  
  // Create user (sign-up)
  createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error("Email and password are required"));
        return;
      }
      
      // Check if user exists
      const existingUser = this.users.find(user => user.email === email);
      if (existingUser) {
        reject(new Error("User with this email already exists"));
        return;
      }
      
      // Create new user
      const newUser = {
        uid: this._generateUid(),
        email,
        password, // In a real system, the password should be hashed
        displayName: "",
        emailVerified: false,
        createdAt: new Date().toISOString()
      };
      
      this.users.push(newUser);
      this._saveUsers();
      
      // Set current user
      this.currentUser = { ...newUser };
      delete this.currentUser.password; // Do not store password in current user object
      this._saveSession();
      
      // Notify listeners of change
      this._notifyListeners();
      
      // Return object mimicking Firebase UserCredential
      resolve({
        user: this.currentUser,
        operationType: "signIn"
      });
    });
  },
  
  // Sign in user
  signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error("Email and password are required"));
        return;
      }
      
      // Find user
      const user = this.users.find(u => u.email === email && u.password === password);
      if (!user) {
        reject(new Error("Invalid email or password"));
        return;
      }
      
      // Set current user
      this.currentUser = { ...user };
      delete this.currentUser.password; // Do not store password in current user object
      this._saveSession();
      
      // Notify listeners of change
      this._notifyListeners();
      
      // Return object mimicking Firebase UserCredential
      resolve({
        user: this.currentUser,
        operationType: "signIn"
      });
    });
  },
  
  // Sign out user
  signOut() {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem('localAuthSession');
      
      // Notify listeners of change
      this._notifyListeners();
      
      resolve();
    });
  },
  
  // Auth state change listener
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      
      // Immediately call callback with current state
      callback(this.currentUser);
    }
    
    // Return function for unsubscribing
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },
  
  // Helper methods
  _loadUsers() {
    const storedUsers = localStorage.getItem('localAuthUsers');
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  },
  
  _saveUsers() {
    localStorage.setItem('localAuthUsers', JSON.stringify(this.users));
  },
  
  _loadSession() {
    const sessionData = localStorage.getItem('localAuthSession');
    this.currentUser = sessionData ? JSON.parse(sessionData) : null;
  },
  
  _saveSession() {
    if (this.currentUser) {
      localStorage.setItem('localAuthSession', JSON.stringify(this.currentUser));
    }
  },
  
  _generateUid() {
    return 'local_' + Math.random().toString(36).substr(2, 9);
  },
  
  _notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error("Ошибка в слушателе авторизации:", error);
      }
    });
  }
};
```

## Обработка ошибок

Система авторизации содержит стандартизированный механизм обработки ошибок:

```javascript
function getAuthErrorMessage(error) {
  const errorMap = {
    'auth/email-already-in-use': 'Этот email уже используется другим пользователем',
    'auth/invalid-email': 'Указан неверный формат email',
    'auth/user-disabled': 'Этот аккаунт был отключен',
    'auth/user-not-found': 'Пользователь с таким email не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
    'auth/too-many-requests': 'Слишком много неудачных попыток. Попробуйте позже',
    'auth/network-request-failed': 'Проблема с сетевым подключением'
  };
  
  const errorCode = error.code || '';
  return errorMap[errorCode] || error.message || 'Произошла ошибка при авторизации';
}
```

## Межсервисное взаимодействие

Система авторизации тесно интегрирована с другими компонентами:

```javascript
// Initialize user profile on first registration
async function initUserProfile(user) {
  if (!user) return;
  
  try {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      createdAt: new Date().toISOString(),
      wallet: {
        balance: 0,
        transactions: []
      }
    };
    
    await db.collection('users').doc(user.uid).set(userProfile);
    console.log("Профиль пользователя создан");
  } catch (error) {
    console.error("Ошибка при создании профиля:", error);
  }
}

// Update UI on auth state change
function updateUIOnAuthChange(user) {
  const authButtons = document.getElementById('auth-buttons');
  const userProfile = document.getElementById('user-profile');
  
  if (user) {
    authButtons.style.display = 'none';
    userProfile.style.display = 'flex';
    
    // Load user data from database
    db.collection('users').doc(user.uid).get()
      .then(doc => {
        if (doc.exists) {
          const userData = doc.data();
          document.getElementById('user-name').textContent = userData.displayName || 'Пользователь';
          document.getElementById('wallet-balance').textContent = `${userData.wallet.balance} RUB`;
        }
      });
  } else {
    authButtons.style.display = 'flex';
    userProfile.style.display = 'none';
  }
}
```

## Безопасность

### Password hashing

In a production environment, server-side authentication provides secure password storage. In local emulation for educational purposes, password hashing is simplified, but in a real application, it is recommended to use bcrypt:

```javascript
// Password hashing
function hashPassword(password) {
  // Simple password hashing for educational purposes
  // In a real application, use bcrypt or a similar library
  return btoa(password + "salt");
}

// Verify password
function verifyPassword(password, hash) {
  return hash === hashPassword(password);
}
```

### Data validation

```javascript
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}
```

## Тестирование

For testing the authentication system during development:

1. Use the test account: `test@example.com` / `password`
2. Or create a new test user through the registration form

Command to run the local server:
```
python -m http.server 8000
```

## Production environment

In a production environment, it is recommended:
1. Use only server-side authentication
2. Configure two-factor authentication
3. Restrict access by IP if necessary
4. Enable suspicious activity detection
5. Configure automatic notifications for unauthorized access attempts