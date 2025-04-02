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
``` 