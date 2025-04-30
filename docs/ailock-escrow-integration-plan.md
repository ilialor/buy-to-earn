# План интеграции Ailock и Escrow API в buy-to-earn/home.html

## 1. Общая архитектура

- Ailock сервис доступен по адресу `ai.ateira.online`, проксируется на контейнер `ailock:8000` (хостовый порт 8001) через Nginx.
- Escrow API доступен по адресу `api.ateira.online/api`, проксируется на контейнер `escrow-api:3000` через Nginx.
- Frontend `buy-to-earn` обслуживается Nginx на основном домене (порт 80).

## 2. Конфигурация API-клиентов

### 2.1. AilockClient
Создать `js/api/ailock-client.js` на основе следующего шаблона:
```javascript
// js/api/ailock-client.js
// Defines AilockClient for interacting with AI service
export class AilockClient {
  constructor(baseUrl, token = '') {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async sendMessage(sessionId, message) {
    const url = `${this.baseUrl}/api/v1/assistant/query`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
    const body = JSON.stringify({ sessionId, message });
    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ailock request failed');
    }
    return await response.json(); // { sessionId, messages: [...] }
  }
}
```

### 2.2. EscrowClient
Проверить и обновить существующий `js/api/escrow-client.js`, установив:
```javascript
const API_BASE = window.location.origin + '/api';
const TOKEN = localStorage.getItem('escrowToken');
export const escrowApi = new EscrowClient(API_BASE, TOKEN);
```

## 3. Инициализация клиентов

В `js/config.js`:
```javascript
// js/config.js
// Configuration for API endpoints
export const AILOCK_API_URL = window.location.origin;
export const ESCROW_API_URL = window.location.origin + '/api';
export const AILOCK_TOKEN = localStorage.getItem('ailockToken') || '';
export const ESCROW_TOKEN = localStorage.getItem('escrowToken') || '';
```
В `js/api/index.js`:
```javascript
// js/api/index.js
// Initialize both API clients
import { AilockClient } from './ailock-client.js';
import { EscrowClient } from './escrow-client.js';
import { AILOCK_API_URL, ESCROW_API_URL, AILOCK_TOKEN, ESCROW_TOKEN } from '../config.js';

export const ailockApi   = new AilockClient(AILOCK_API_URL, AILOCK_TOKEN);
export const escrowApi   = new EscrowClient(ESCROW_API_URL, ESCROW_TOKEN);
```

## 4. Интеграция в home.html

1. В `js/home-chat.js` заменить статическую отправку сообщений на вызовы `ailockApi.sendMessage`:
```javascript
// js/home-chat.js
// Sends user input to Ailock and renders response
sendBtn.addEventListener('click', async () => {
  const msg = userInput.value;
  const session = localStorage.getItem('ailockSessionId') || '';
  const result = await ailockApi.sendMessage(session, msg);
  localStorage.setItem('ailockSessionId', result.sessionId);
  renderMessages(result.messages);
});
```
2. В `js/home-wallet.js` добавить обработчики кнопок для Escrow API:
```javascript
// js/home-wallet.js
// Handle wallet connect and balance fetch via EscrowClient
connectBtn.addEventListener('click', async () => {
  const user = await escrowApi.createUser({ name, email });
  localStorage.setItem('escrowUserId', user.id);
});
balanceDisplay.addEventListener('click', async () => {
  const id = localStorage.getItem('escrowUserId');
  const data = await escrowApi.getUserById(id);
  updateBalanceUI(data.balance);
});
```

## 5. Форматы данных и эндпойнты

| Сервис  | Метод | URL                                   | Body                                      | Ответ                                |
| ------: | :---- | :------------------------------------ | :---------------------------------------- | :----------------------------------- |
| Ailock  | POST  | `/api/v1/assistant/query`             | `{ sessionId, message }`                  | `{ sessionId, messages: [{role,content}] }` |
| Escrow  | POST  | `/api/users`                          | `{ name, email }`                         | `{ id, balance }`                    |
| Escrow  | GET   | `/api/users/{id}`                     | —                                         | `{ id, name, balance }`              |
| Escrow  | PATCH | `/api/users/{id}/balance`             | `{ amount }`                              | `{ id, balance }`                    |
| Escrow  | POST  | `/api/orders`, `/api/orders/{id}/fund` | `{ ... }`                                 | `{ orderId, status }`                |

## 6. Порты и прокси

- **Ailock**: контейнер `ailock:8000` -> хост `8001`, Nginx прокси без указания порта (80).
- **Escrow API**: контейнер `escrow-api:3000` -> хост `3000`, Nginx прокси на `/api`.
- **Frontend**: Nginx сервер на порту `80`.

## 7. CORS и безопасность

Проверить в конфигурации Nginx наличие заголовков:
```
add_header Access-Control-Allow-Origin "$http_origin";
add_header Access-Control-Allow-Credentials true;
```

## 8. Тестирование

- Написать юнит-тесты для `js/api/ailock-client.test.js` и `js/api/escrow-client.test.js`.
- Провести E2E тестирование сценариев чата и операций Escrow.
