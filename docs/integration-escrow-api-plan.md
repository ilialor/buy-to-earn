# План интеграции buy-to-earn с escrow-api-1

## 1. Общая информация

**Бэкенд API:**
- URL: `https://escrow-ocezgvm46-avas-projects-1e47760b.vercel.app/api`
- API-ключ: `Escrow-secret-test-1`

## 2. Структура интеграции

### 2.1. Создание API-клиента

Разработать JavaScript-модуль `js/api/escrow-client.js`:

```javascript
// js/api/escrow-client.js
export class EscrowClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const options = {
      method,
      headers,
      credentials: 'include'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Произошла ошибка при выполнении запроса');
    }

    return await response.json();
  }

  // Методы для работы с пользователями
  async createUser(userData) {
    return this.request('/users', 'POST', userData);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserBalance(userId, amount) {
    return this.request(`/users/${userId}/balance`, 'PATCH', { amount });
  }

  // Методы для работы с заказами
  async createOrder(orderData) {
    return this.request('/orders', 'POST', orderData);
  }

  async createGroupOrder(groupOrderData) {
    return this.request('/group-orders', 'POST', groupOrderData);
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async fundOrder(orderId, fundData) {
    return this.request(`/orders/${orderId}/fund`, 'POST', fundData);
  }

  async assignContractor(orderId, assignData) {
    return this.request(`/orders/${orderId}/assign`, 'POST', assignData);
  }

  async completeMilestone(orderId, milestoneId, completionData) {
    return this.request(`/orders/${orderId}/milestones/${milestoneId}/complete`, 'POST', completionData);
  }

  async voteForRepresentative(orderId, voteData) {
    return this.request(`/orders/${orderId}/vote`, 'POST', voteData);
  }

  // Методы для работы с актами
  async createAct(actData) {
    return this.request('/acts', 'POST', actData);
  }

  async signAct(actId, signData) {
    return this.request(`/acts/${actId}/sign`, 'POST', signData);
  }

  async rejectAct(actId, rejectData) {
    return this.request(`/acts/${actId}/reject`, 'POST', rejectData);
  }

  // Методы для работы с документами
  async createDocument(documentData) {
    return this.request('/documents', 'POST', documentData);
  }

  async generateDocument(type, documentData) {
    return this.request(`/documents/generate/${type}`, 'POST', documentData);
  }
}
```

### 2.2. Инициализация клиента

Создать модуль для инициализации клиента `js/api/escrow-api.js`:

```javascript
// js/api/escrow-api.js
import { EscrowClient } from './escrow-client.js';

const API_BASE_URL = 'https://escrow-ocezgvm46-avas-projects-1e47760b.vercel.app/api';
const API_KEY = 'Escrow-secret-test-1';

export const escrowApi = new EscrowClient(API_BASE_URL, API_KEY);
```

## 3. Интеграция с существующей системой аутентификации

### 3.1. Связывание пользователей

Модифицировать процесс регистрации/входа в buy-to-earn, чтобы создавать соответствующих пользователей в escrow-api:

```javascript
// js/auth/user-service.js
import { escrowApi } from '../api/escrow-api.js';

// Добавить в существующий сервис аутентификации:
async function registerUserWithEscrow(user) {
  try {
    const escrowUser = await escrowApi.createUser({
      name: user.name,
      email: user.email,
      type: mapUserRoleToEscrowType(user.role), // Функция для маппинга ролей
      initialBalance: 0
    });
    
    // Сохранить ID пользователя в escrow системе в локальное хранилище
    localStorage.setItem('escrowUserId', escrowUser.id);
    
    return escrowUser;
  } catch (error) {
    console.error('Ошибка при создании пользователя в escrow:', error);
    throw error;
  }
}

// Функция маппинга ролей:
function mapUserRoleToEscrowType(role) {
  switch (role) {
    case 'customer': return 'CUSTOMER';
    case 'contractor': return 'CONTRACTOR';
    case 'admin': return 'PLATFORM';
    default: return 'CUSTOMER';
  }
}
```

## 4. Интеграция с интерфейсом заказов

### 4.1. Создание заказа

Модифицировать соответствующие обработчики в buy-to-earn:

```javascript
// js/orders/order-service.js
import { escrowApi } from '../api/escrow-api.js';

// Добавить в существующий сервис заказов:
async function createEscrowOrder(orderData) {
  try {
    const milestones = orderData.milestones.map(m => ({
      description: m.description,
      amount: m.amount.toString(),
      deadline: m.deadline
    }));

    const escrowOrder = await escrowApi.createOrder({
      customerId: localStorage.getItem('escrowUserId'),
      title: orderData.title,
      description: orderData.description,
      milestones: milestones
    });
    
    // Сохранить ID заказа в escrow системе
    return escrowOrder;
  } catch (error) {
    console.error('Ошибка при создании заказа в escrow:', error);
    throw error;
  }
}

async function createGroupEscrowOrder(orderData, customerIds) {
  try {
    const milestones = orderData.milestones.map(m => ({
      description: m.description,
      amount: m.amount.toString(),
      deadline: m.deadline
    }));

    const escrowOrder = await escrowApi.createGroupOrder({
      customerIds: customerIds,
      title: orderData.title,
      description: orderData.description,
      initialRepresentativeId: localStorage.getItem('escrowUserId'),
      milestones: milestones
    });
    
    return escrowOrder;
  } catch (error) {
    console.error('Ошибка при создании группового заказа в escrow:', error);
    throw error;
  }
}
```

### 4.2. Финансирование заказа

```javascript
// js/orders/funding-service.js
import { escrowApi } from '../api/escrow-api.js';

async function fundEscrowOrder(orderId, amount) {
  try {
    const fundResult = await escrowApi.fundOrder(orderId, {
      customerId: localStorage.getItem('escrowUserId'),
      amount: amount.toString()
    });
    
    return fundResult;
  } catch (error) {
    console.error('Ошибка при финансировании заказа в escrow:', error);
    throw error;
  }
}
```

### 4.3. Назначение исполнителя

```javascript
// js/orders/contractor-service.js
import { escrowApi } from '../api/escrow-api.js';

async function assignContractorToOrder(orderId, contractorId) {
  try {
    const assignResult = await escrowApi.assignContractor(orderId, {
      contractorId: contractorId
    });
    
    return assignResult;
  } catch (error) {
    console.error('Ошибка при назначении исполнителя в escrow:', error);
    throw error;
  }
}
```

## 5. Работа с вехами и актами

### 5.1. Завершение вехи исполнителем

```javascript
// js/milestones/milestone-service.js
import { escrowApi } from '../api/escrow-api.js';

async function completeMilestone(orderId, milestoneId, deliverableUrl) {
  try {
    const completionResult = await escrowApi.completeMilestone(orderId, milestoneId, {
      contractorId: localStorage.getItem('escrowUserId'),
      deliverableUrl: deliverableUrl
    });
    
    return completionResult;
  } catch (error) {
    console.error('Ошибка при завершении вехи в escrow:', error);
    throw error;
  }
}
```

### 5.2. Подписание и отклонение актов

```javascript
// js/acts/act-service.js
import { escrowApi } from '../api/escrow-api.js';

async function signAct(actId) {
  try {
    const signResult = await escrowApi.signAct(actId, {
      userId: localStorage.getItem('escrowUserId')
    });
    
    return signResult;
  } catch (error) {
    console.error('Ошибка при подписании акта в escrow:', error);
    throw error;
  }
}

async function rejectAct(actId, reason) {
  try {
    const rejectResult = await escrowApi.rejectAct(actId, {
      userId: localStorage.getItem('escrowUserId'),
      reason: reason
    });
    
    return rejectResult;
  } catch (error) {
    console.error('Ошибка при отклонении акта в escrow:', error);
    throw error;
  }
}
```

## 6. Отображение данных

### 6.1. Компонент списка заказов

Модифицировать соответствующие функции отображения заказов:

```javascript
// js/ui/order-list.js
import { escrowApi } from '../api/escrow-api.js';

async function loadAndDisplayOrders() {
  try {
    const orders = await escrowApi.getOrders();
    
    // Отрисовка списка заказов
    const orderListElement = document.getElementById('order-list');
    orderListElement.innerHTML = '';
    
    orders.forEach(order => {
      const orderElement = createOrderElement(order);
      orderListElement.appendChild(orderElement);
    });
  } catch (error) {
    console.error('Ошибка при загрузке заказов из escrow:', error);
    showErrorMessage('Не удалось загрузить список заказов');
  }
}

function createOrderElement(order) {
  // Создание HTML элемента для заказа
  const orderElement = document.createElement('div');
  orderElement.className = 'order-item';
  orderElement.innerHTML = `
    <h3>${order.title}</h3>
    <p>${order.description}</p>
    <p>Статус: ${translateOrderStatus(order.status)}</p>
    <p>Сумма: ${order.totalAmount}</p>
    <p>Профинансировано: ${order.fundedAmount}</p>
    <button class="view-details" data-order-id="${order.id}">Подробнее</button>
  `;
  
  orderElement.querySelector('.view-details').addEventListener('click', () => {
    window.location.href = `/order-details.html?id=${order.id}`;
  });
  
  return orderElement;
}

function translateOrderStatus(status) {
  const statusMap = {
    'CREATED': 'Создан',
    'FUNDED': 'Профинансирован',
    'IN_PROGRESS': 'В работе',
    'COMPLETED': 'Завершен',
    'CANCELLED': 'Отменен'
  };
  
  return statusMap[status] || status;
}
```

### 6.2. Детали заказа

```javascript
// js/ui/order-details.js
import { escrowApi } from '../api/escrow-api.js';

async function loadAndDisplayOrderDetails(orderId) {
  try {
    const order = await escrowApi.getOrderById(orderId);
    
    // Отрисовка деталей заказа
    document.getElementById('order-title').textContent = order.title;
    document.getElementById('order-description').textContent = order.description;
    document.getElementById('order-status').textContent = translateOrderStatus(order.status);
    document.getElementById('order-total').textContent = order.totalAmount;
    document.getElementById('order-funded').textContent = order.fundedAmount;
    
    // Отрисовка вех
    const milestonesElement = document.getElementById('milestones-list');
    milestonesElement.innerHTML = '';
    
    order.milestones.forEach(milestone => {
      const milestoneElement = createMilestoneElement(milestone, order.id);
      milestonesElement.appendChild(milestoneElement);
    });
    
    // Показ/скрытие кнопок в зависимости от статуса заказа и роли пользователя
    updateActionButtons(order);
  } catch (error) {
    console.error('Ошибка при загрузке деталей заказа из escrow:', error);
    showErrorMessage('Не удалось загрузить детали заказа');
  }
}

function createMilestoneElement(milestone, orderId) {
  // Создание HTML элемента для вехи
  const milestoneElement = document.createElement('div');
  milestoneElement.className = 'milestone-item';
  milestoneElement.innerHTML = `
    <h4>${milestone.description}</h4>
    <p>Сумма: ${milestone.amount}</p>
    <p>Срок: ${new Date(milestone.deadline).toLocaleDateString()}</p>
    <p>Статус: ${translateMilestoneStatus(milestone.status)}</p>
  `;
  
  // Добавление кнопок в зависимости от статуса вехи и роли пользователя
  if (milestone.status === 'IN_PROGRESS' && getCurrentUserRole() === 'CONTRACTOR') {
    const completeButton = document.createElement('button');
    completeButton.textContent = 'Завершить веху';
    completeButton.addEventListener('click', () => showCompleteMilestoneDialog(orderId, milestone.id));
    milestoneElement.appendChild(completeButton);
  }
  
  if (milestone.status === 'COMPLETED' && milestone.actId && getCurrentUserRole() !== 'CONTRACTOR') {
    const signButton = document.createElement('button');
    signButton.textContent = 'Подписать акт';
    signButton.addEventListener('click', () => signAct(milestone.actId));
    milestoneElement.appendChild(signButton);
    
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Отклонить акт';
    rejectButton.addEventListener('click', () => showRejectActDialog(milestone.actId));
    milestoneElement.appendChild(rejectButton);
  }
  
  return milestoneElement;
}

function translateMilestoneStatus(status) {
  const statusMap = {
    'CREATED': 'Создана',
    'IN_PROGRESS': 'В работе',
    'COMPLETED': 'Завершена',
    'PAID': 'Оплачена'
  };
  
  return statusMap[status] || status;
}

function getCurrentUserRole() {
  // Получение роли текущего пользователя из локального хранилища
  return localStorage.getItem('userRole');
}
```

## 7. Обработка ошибок и уведомления

```javascript
// js/utils/error-handler.js
export function showErrorMessage(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  document.body.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// js/utils/notification.js
export function showNotification(message, type = 'info') {
  const notificationElement = document.createElement('div');
  notificationElement.className = `notification ${type}`;
  notificationElement.textContent = message;
  
  document.body.appendChild(notificationElement);
  
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}
```

## 8. Доработка существующих форм

1. Модификация форм создания заказа:
   - Обновить структуру данных для соответствия API
   - Добавить валидацию полей согласно требованиям API
   - Обеспечить корректную обработку ошибок от API

2. Модификация форм финансирования:
   - Адаптировать существующие формы под формат запросов к API
   - Добавить отображение статуса финансирования
   - Реализовать индикаторы прогресса финансирования

3. Модификация форм работы с вехами:
   - Адаптировать форму создания и редактирования вех
   - Реализовать интерфейс для работы с актами
   - Добавить возможность загрузки и проверки результатов

## 9. Тестирование интеграции

1. Создать тестовую страницу для проверки основных функций API:
   - Создание пользователя
   - Создание заказа
   - Финансирование заказа
   - Назначение исполнителя
   - Завершение вехи
   - Подписание акта

2. Использовать следующие тестовые сценарии:
   - Полный цикл создания и завершения заказа
   - Обработка ошибок API
   - Проверка синхронизации статусов между фронтендом и бэкендом
   - Тестирование с имитацией сетевых задержек и ошибок

3. Тестирование на развернутом фронтенде:
   - Тестирование на https://co-intent-platform.windsurf.build
   - Проверка работы с API из продакшн-окружения
   - Проверка CORS

## 10. Настройка для развернутого окружения

1. Настройка CORS:
   - Убедиться, что API поддерживает запросы с домена https://co-intent-platform.windsurf.build
   - Добавить заголовки CORS на сервере API, если необходимо

2. Управление переменными окружения:
   - Создать конфигурационный файл для различных окружений (dev, staging, prod)
   - Настроить переменные окружения в Netlify/Windsurf для хранения API_BASE_URL и API_KEY
   - Реализовать загрузку конфигурации в зависимости от окружения

```javascript
// js/config/environment.js
export function getApiConfig() {
  // Проверка, работаем ли мы в продакшн-окружении
  const isProd = window.location.hostname === 'co-intent-platform.windsurf.build';
  
  return {
    apiBaseUrl: isProd 
      ? 'https://escrow-ocezgvm46-avas-projects-1e47760b.vercel.app/api'
      : 'http://localhost:3000/api', // для локальной разработки
    apiKey: isProd 
      ? process.env.ESCROW_API_KEY || 'Escrow-secret-test-1'
      : 'Escrow-secret-test-1'
  };
}
```

## 11. Развертывание

1. Добавить все новые JavaScript модули в соответствующие HTML файлы
2. Обновить существующие обработчики событий для использования нового API-клиента
3. Настройка CI/CD на Netlify/Windsurf:
   - Обновление переменных окружения для API-ключа
   - Настройка автоматического деплоя при изменениях в репозитории
4. Провести тестирование на тестовой среде
5. Развернуть в продакшн

## 12. Дальнейшее развитие

1. Реализовать кэширование данных от API для улучшения производительности
2. Добавить offline-режим с синхронизацией при восстановлении соединения
3. Реализовать механизм обновления в реальном времени через WebSocket или Server-Sent Events
4. Улучшение UX при работе с API:
   - Добавление индикаторов загрузки
   - Оптимистичные обновления UI
   - Retry-механизмы при временных сетевых проблемах
