# Система авторизации Co-Intent Platform

## Общий обзор

Система авторизации Co-Intent Platform реализована с использованием гибкой архитектуры, поддерживающей два режима работы:
1. **Firebase Authentication** - полнофункциональная облачная авторизация для производственной среды
2. **Локальная авторизация** - эмуляция системы авторизации через localStorage для разработки и тестирования

Такая архитектура обеспечивает независимость разработки от облачных сервисов и возможность быстрого тестирования.

## Компоненты системы

### Firebase Authentication
- Аутентификация по email/password
- Аутентификация через Google (OAuth)
- Верификация email
- Восстановление пароля
- Управление профилем пользователя

### Локальная авторизация
- Эмуляция Firebase Auth API через localStorage
- Поддержка регистрации/входа по email/password
- Управление сессией пользователя
- Тестовый аккаунт по умолчанию (test@example.com / password)

## Файловая структура

```
js/
  ├── auth.js             # Основной интерфейс для работы с авторизацией
  ├── firebase-config.js  # Конфигурация Firebase
  └── local-auth.js       # Локальная эмуляция Firebase Auth
```

## Процесс инициализации

1. Система проверяет доступность Firebase:
```javascript
function checkAndInitAuth() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    console.log("Firebase доступен, используем Firebase Auth");
    firebaseWorking = true;
  } else {
    console.log("Firebase недоступен, используем локальную авторизацию");
    firebaseWorking = false;
    initLocalAuth();
  }
}
```

2. Если Firebase недоступен, активируется локальная авторизация:
```javascript
function initLocalAuth() {
  if (typeof LocalAuth !== 'undefined') {
    LocalAuth.init();
    console.log("Локальная авторизация инициализирована");
  } else {
    console.error("Ошибка: модуль локальной авторизации не найден");
  }
}
```

## Режимы работы

### Firebase Auth

```javascript
// Регистрация нового пользователя
async function signUp(email, password, displayName) {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName });
    return userCredential.user;
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    throw error;
  }
}

// Вход пользователя
async function signIn(email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Ошибка при входе:", error);
    throw error;
  }
}

// Выход пользователя
async function signOut() {
  try {
    await firebase.auth().signOut();
    return true;
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    throw error;
  }
}

// Слушатель изменений состояния авторизации
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Пользователь вошел:", user.uid);
    // Обновляем UI и состояние
  } else {
    console.log("Пользователь вышел");
    // Обновляем UI и состояние
  }
});
```

### Локальная авторизация

```javascript
const LocalAuth = {
  users: [],
  currentUser: null,
  listeners: [],
  
  // Инициализация
  init() {
    this._loadUsers();
    this._loadSession();
    
    // Создаем тестового пользователя если нет пользователей
    if (this.users.length === 0) {
      this._createTestUser();
    }
  },
  
  // Создание тестового пользователя
  _createTestUser() {
    const testUser = {
      uid: this._generateUid(),
      email: "test@example.com",
      password: "password", // В реальной системе пароль должен быть захеширован
      displayName: "Test User",
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    
    this.users.push(testUser);
    this._saveUsers();
  },
  
  // Регистрация
  createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error("Email и пароль обязательны"));
        return;
      }
      
      // Проверяем, существует ли пользователь
      const existingUser = this.users.find(user => user.email === email);
      if (existingUser) {
        reject(new Error("Пользователь с таким email уже существует"));
        return;
      }
      
      // Создаем нового пользователя
      const newUser = {
        uid: this._generateUid(),
        email,
        password, // В реальной системе пароль должен быть захеширован
        displayName: "",
        emailVerified: false,
        createdAt: new Date().toISOString()
      };
      
      this.users.push(newUser);
      this._saveUsers();
      
      // Устанавливаем текущего пользователя
      this.currentUser = { ...newUser };
      delete this.currentUser.password; // Не храним пароль в объекте текущего пользователя
      this._saveSession();
      
      // Уведомляем слушателей об изменении
      this._notifyListeners();
      
      // Возвращаем объект, имитирующий Firebase UserCredential
      resolve({
        user: this.currentUser,
        operationType: "signIn"
      });
    });
  },
  
  // Вход пользователя
  signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error("Email и пароль обязательны"));
        return;
      }
      
      // Ищем пользователя
      const user = this.users.find(u => u.email === email && u.password === password);
      if (!user) {
        reject(new Error("Неверный email или пароль"));
        return;
      }
      
      // Устанавливаем текущего пользователя
      this.currentUser = { ...user };
      delete this.currentUser.password; // Не храним пароль в объекте текущего пользователя
      this._saveSession();
      
      // Уведомляем слушателей об изменении
      this._notifyListeners();
      
      // Возвращаем объект, имитирующий Firebase UserCredential
      resolve({
        user: this.currentUser,
        operationType: "signIn"
      });
    });
  },
  
  // Выход пользователя
  signOut() {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem('localAuthSession');
      
      // Уведомляем слушателей об изменении
      this._notifyListeners();
      
      resolve();
    });
  },
  
  // Слушатель изменений состояния
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      
      // Сразу вызываем callback с текущим состоянием
      callback(this.currentUser);
    }
    
    // Возвращаем функцию для отписки
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },
  
  // Вспомогательные методы
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
// Инициализация профиля пользователя при первой регистрации
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

// Обновление UI при изменении состояния авторизации
function updateUIOnAuthChange(user) {
  const authButtons = document.getElementById('auth-buttons');
  const userProfile = document.getElementById('user-profile');
  
  if (user) {
    authButtons.style.display = 'none';
    userProfile.style.display = 'flex';
    
    // Загружаем данные пользователя из БД
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

### Хеширование паролей

В производственной среде Firebase автоматически обеспечивает безопасное хранение паролей. В локальной эмуляции для учебных целей хеширование упрощено, но в реальном приложении рекомендуется использовать bcrypt:

```javascript
// Хеширование пароля
function hashPassword(password) {
  // Простая имитация хеширования для учебных целей
  // В реальном приложении используйте bcrypt или аналогичную библиотеку
  return btoa(password + "salt");
}

// Проверка пароля
function verifyPassword(password, hash) {
  return hash === hashPassword(password);
}
```

### Валидация данных

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

Для тестирования системы авторизации во время разработки:

1. Используйте тестовый аккаунт: `test@example.com` / `password`
2. Или создайте нового тестового пользователя через форму регистрации

Команда для запуска локального сервера:
```
python -m http.server 8000
```

## Производственная среда

В производственной среде рекомендуется:
1. Использовать только Firebase Authentication
2. Настроить двухфакторную аутентификацию
3. Ограничить доступ по IP если требуется
4. Активировать проверку подозрительной активности
5. Настроить автоматические уведомления о попытках несанкционированного доступа 