# Система хранения данных Co-Intent Platform

## Общий обзор

Система хранения данных Co-Intent Platform реализована с использованием двух основных подходов:
1. **PostgreSQL** - основное облачное хранилище для производственной среды
2. **LocalStorage** - локальное хранилище для разработки и тестирования

Такая архитектура обеспечивает гибкость разработки и тестирования без необходимости постоянного подключения к облаку.

## Структура данных

### Коллекции

Система организует данные в следующие основные коллекции:

#### 1. Users
```
users/{userId}
```
Хранит информацию о пользователях:
- `uid` - уникальный идентификатор
- `email` - электронная почта пользователя
- `displayName` - отображаемое имя
- `photoURL` - URL аватара
- `emailVerified` - флаг верификации email
- `createdAt` - дата создания аккаунта
- `wallet` - баланс кошелька
- `transactions` - история транзакций

#### 2. Orders
```
orders/{orderId}
```
История заказов и покупок:
- `userId` - идентификатор пользователя
- `productId` - идентификатор продукта
- `tokenId` - идентификатор приобретенного токена
- `amount` - сумма заказа
- `status` - статус заказа
- `createdAt` - дата создания
- `completedAt` - дата завершения

#### 3. Participations
```
participations/{participationId}
```
Участие пользователей в проектах:
- `userId` - идентификатор пользователя
- `projectId` - идентификатор проекта
- `tokens` - массив приобретенных токенов
- `joinedAt` - дата присоединения
- `totalRevenue` - общий доход

#### 4. NFTs
```
nfts/{nftId}
```
Информация о NFT-токенах:
- `tokenId` - идентификатор токена
- `projectId` - идентификатор проекта
- `ownerId` - идентификатор владельца
- `issueDate` - дата выпуска
- `metadata` - метаданные токена
- `transactionHistory` - история транзакций

#### 5. Revenues
```
revenues/{revenueId}
```
Данные о доходах:
- `projectId` - идентификатор проекта
- `amount` - сумма
- `distributionDate` - дата распределения
- `shares` - распределение долей

#### 6. Transactions
```
transactions/{transactionId}
```
История транзакций:
- `userId` - идентификатор пользователя
- `type` - тип транзакции (покупка, продажа, выплата)
- `amount` - сумма
- `timestamp` - временная метка
- `status` - статус
- `details` - детали транзакции

## Реализация

### Firebase Firestore

Основная реализация использует Firebase Firestore для хранения данных:

```javascript
// Инициализация Firestore
const db = firebase.firestore();
db.enablePersistence({
  synchronizeTabs: true
}).catch(err => {
  console.error("Ошибка включения персистентности:", err);
});
```

#### Методы работы с данными:

1. **Создание документа**
```javascript
async function createDocument(collection, data) {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Ошибка при создании документа:", error);
    throw error;
  }
}
```

2. **Чтение документа**
```javascript
async function getDocument(collection, documentId) {
  try {
    const doc = await db.collection(collection).doc(documentId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error("Ошибка при чтении документа:", error);
    throw error;
  }
}
```

3. **Обновление документа**
```javascript
async function updateDocument(collection, documentId, data) {
  try {
    await db.collection(collection).doc(documentId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Ошибка при обновлении документа:", error);
    throw error;
  }
}
```

4. **Удаление документа**
```javascript
async function deleteDocument(collection, documentId) {
  try {
    await db.collection(collection).doc(documentId).delete();
    return true;
  } catch (error) {
    console.error("Ошибка при удалении документа:", error);
    throw error;
  }
}
```

### LocalStorage (для разработки)

Локальная реализация эмулирует Firestore через localStorage:

```javascript
const localDb = {
  collections: {},
  
  // Инициализация локальной БД
  init() {
    this.loadFromStorage();
  },
  
  // Загрузка данных из localStorage
  loadFromStorage() {
    const storedData = localStorage.getItem('localDb');
    if (storedData) {
      this.collections = JSON.parse(storedData);
    } else {
      this.collections = {
        users: {},
        orders: {},
        participations: {},
        nfts: {},
        revenues: {},
        transactions: {}
      };
      this.saveToStorage();
    }
  },
  
  // Сохранение в localStorage
  saveToStorage() {
    localStorage.setItem('localDb', JSON.stringify(this.collections));
  }
};
```

## Схема выбора хранилища

Система автоматически выбирает подходящее хранилище в зависимости от доступности Firebase:

```javascript
let dbService;

function initializeDatabase() {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    console.log("Используем Firebase Firestore");
    dbService = new FirestoreService();
  } else {
    console.log("Firebase недоступен, используем LocalStorage");
    dbService = new LocalStorageService();
  }
  
  return dbService.init();
}
```

## Безопасность данных

### Правила доступа Firestore

```
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для коллекции пользователей
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Правила для заказов
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Общие правила для других коллекций
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Шифрование данных LocalStorage

Для повышения безопасности локального хранилища применяется базовое шифрование:

```javascript
// Шифрование данных
function encryptData(data, key) {
  // Простое шифрование для демонстрации
  const stringData = JSON.stringify(data);
  return btoa(stringData);
}

// Расшифровка данных
function decryptData(encryptedData, key) {
  // Простая расшифровка для демонстрации
  const decodedData = atob(encryptedData);
  return JSON.parse(decodedData);
}
```

## Расположение файлов

```
js/
  ├── db.js            # Основной интерфейс для работы с БД
  ├── firebase-config.js  # Конфигурация Firebase
  └── local-db.js      # Эмуляция БД через localStorage
```

## Миграция и резервное копирование

Для переноса данных между локальным и облачным хранилищем реализованы функции:

```javascript
// Экспорт данных из локального хранилища
function exportLocalData() {
  return JSON.stringify(localDb.collections);
}

// Импорт данных в Firestore
async function importDataToFirestore(jsonData) {
  const data = JSON.parse(jsonData);
  
  for (const collectionName in data) {
    const collection = data[collectionName];
    for (const docId in collection) {
      await db.collection(collectionName).doc(docId).set(collection[docId]);
    }
  }
  
  return true;
}
```

## Тестирование

При разработке рекомендуется использовать локальное хранилище для быстрого тестирования:

```
firebase serve --only functions,hosting
```

Для тестирования с эмулятором Firestore:

```
firebase emulators:start --only firestore
```

## Производственная среда

В производственной среде система автоматически использует Firebase Firestore со следующими преимуществами:
- Масштабируемость
- Автоматическое резервное копирование
- Глобальная репликация
- Контроль доступа на основе правил безопасности
- Интеграция с Firebase Authentication 