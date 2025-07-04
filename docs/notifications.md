# Система уведомлений

## Обзор
Система уведомлений предоставляет пользовательский интерфейс для отображения сообщений об успехе, ошибках, предупреждениях и информационных оповещениях. Используется для информирования пользователей о результатах операций, особенно в контексте эскроу-функциональности.

## Компоненты
1. **HTML-контейнер**: `<div id="notification-container" class="notification-container"></div>`
2. **CSS-стили**: Определены в `styles/escrow.css`
3. **JavaScript-функция**: `showNotification()` в `index.html`

## Использование

### Функция showNotification
```javascript
/**
 * Показывает уведомление пользователю
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления ('success', 'error', 'warning', 'info')
 * @param {number} duration - Длительность отображения в мс (0 для постоянного)
 */
function showNotification(message, type = 'info', duration = 3000)
```

### Примеры использования

```javascript
// Успешная операция
showNotification('Операция выполнена успешно', 'success');

// Ошибка
showNotification('Произошла ошибка при выполнении операции', 'error');

// Предупреждение
showNotification('Внимание! Эта операция необратима', 'warning', 5000);

// Информация
showNotification('Ваша сессия истекает через 5 минут', 'info', 10000);
```

## Типы уведомлений
1. **success** - зеленый, для успешных операций
2. **error** - красный, для ошибок
3. **warning** - желтый, для предупреждений
4. **info** - синий, для информационных сообщений

## Стили
Каждое уведомление имеет анимацию появления справа, и автоматически исчезает через указанное время. Уведомления могут быть закрыты пользователем вручную.

## Интеграция с эскроу-функциональностью
Уведомления используются в следующих сценариях:
1. Создание группового заказа
2. Внесение средств на эскроу-счет
3. Участие в заказе
4. Голосование за представителя
5. Подтверждение завершения этапа работы 