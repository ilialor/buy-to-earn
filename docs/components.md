# Компоненты проекта Co-Intent

## Компоненты страницы профиля

### ProfileCard
Основной компонент для отображения профиля пользователя.

**HTML-структура:**
```html
<div class="profile-card">
    <div class="profile-header">
        <div class="profile-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="profile-info">
            <h2>Имя пользователя</h2>
            <p>user@example.com</p>
            <p>Member since: January 2023</p>
        </div>
    </div>
    <div class="profile-stats">
        <div class="stat-card">
            <div class="stat-value">10</div>
            <div class="stat-label">Инвестиции</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">5</div>
            <div class="stat-label">NFT</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">$1,250</div>
            <div class="stat-label">Доход</div>
        </div>
    </div>
</div>
```

### ProfileSection
Компонент для отображения разделов профиля.

**HTML-структура:**
```html
<div class="profile-section">
    <h3 class="profile-section-title">Заголовок раздела</h3>
    <!-- Содержимое раздела -->
</div>
```

## Компоненты страницы кошелька

### WalletCard
Основной компонент для отображения информации о кошельке.

**HTML-структура:**
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Мой кошелек</h3>
    </div>
    <div class="wallet-balance">1,250.75 <span class="wallet-currency">ETH</span></div>
    <div class="wallet-actions">
        <button class="btn btn-primary"><i class="fas fa-plus"></i> Пополнить</button>
        <button class="btn btn-outline"><i class="fas fa-arrow-right"></i> Вывести</button>
    </div>
</div>
```

### TransactionItem
Компонент для отображения отдельной транзакции.

**HTML-структура:**
```html
<div class="transaction-item transaction-incoming">
    <div class="transaction-info">
        <div class="transaction-title">Пополнение кошелька</div>
        <div class="transaction-date">12 мая 2023, 15:30</div>
    </div>
    <div class="transaction-amount positive">+0.5 ETH</div>
</div>

<div class="transaction-item transaction-outgoing">
    <div class="transaction-info">
        <div class="transaction-title">Инвестиция в проект</div>
        <div class="transaction-date">10 мая 2023, 12:45</div>
    </div>
    <div class="transaction-amount negative">-0.25 ETH</div>
</div>
```

## Компоненты страницы маркетплейса

### OrderCard
Компонент карточки заказа на странице маркетплейса.

**HTML-структура:**
```html
<div class="order-item" data-order-id="1">
    <div class="order-thumbnail"><i class="fas fa-book"></i></div>
    <div class="order-details">
        <h4 class="order-title">Название заказа</h4>
        <div class="order-meta">
            <span><i class="fas fa-tag"></i> Категория</span>
            <span><i class="fas fa-users"></i> Участников</span>
            <span><i class="fas fa-calendar"></i> Дней осталось</span>
        </div>
        <p class="order-description">Описание заказа...</p>
        <div class="order-participation">
            <div class="progress-container">...</div>
            <div class="order-actions">
                <button class="btn btn-primary btn-sm participate-btn" data-order-id="1">Participate</button>
                <button class="btn btn-outline btn-sm">Details</button>
            </div>
        </div>
    </div>
</div>
```

**JavaScript:**
```javascript
// js/ui.js
function renderOrder(order) {
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    // populate thumbnail, details, meta, description, actions
    return orderItem;
}

// js/escrow/ui.js
buttonHtml.push(
    `<button class="btn btn-secondary participate-btn" data-order-id="${order.order_id}">Participate</button>`
);
```

**Стили:**
- Основные стили карточки (`.order-item`) находятся в `styles/styles.css`.
- Специфические стили статуса заказа перенесены в `escrow.css` (классы `.order-status-*`).

### Изменения в стилях карточек заказов
- Для всех карточек заказов используется только класс `.order-item`.
- Стиль карточек приведён к единому виду с классом `.card` (фон, скругления, тени, отступы).
- Удалены дублирующие и конфликтующие классы (`.user-order-card` и др.).
- Все изменения отражены в файле `styles.css`.

## Общие компоненты

### Card
Универсальный компонент карточки для отображения блоков информации.

**HTML-структура:**
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Заголовок карточки</h3>
    </div>
    <!-- Содержимое карточки -->
</div>
```

### Button
Компонент кнопки с разными стилями.

**HTML-структура:**
```html
<button class="btn btn-primary">Основная кнопка</button>
<button class="btn btn-outline">Контурная кнопка</button>
<button class="btn btn-sm">Маленькая кнопка</button>
```

### Modal
Компонент модального окна.

**HTML-структура:**
```html
<div class="modal" id="modal-id">
    <div class="modal-content">
        <div class="modal-header">
            <h3 class="modal-title">Заголовок модального окна</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <!-- Содержимое модального окна -->
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline">Отмена</button>
            <button class="btn btn-primary">Подтвердить</button>
        </div>
    </div>
</div>