/**
 * Join Project Interactions - Упрощенная версия
 * 
 * Базовые взаимодействия для блока "Присоединиться к проекту"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const packageCards = document.querySelectorAll('.package-card');
    const joinButton = document.querySelector('.join-button');
    const counterElement = document.querySelector('.counter-number');
    
    // Функция выбора пакета
    function selectPackage(card) {
        // Удаляем класс selected у всех карточек
        packageCards.forEach(c => c.classList.remove('selected'));
        // Добавляем класс selected выбранной карточке
        card.classList.add('selected');
    }
    
    // Добавляем обработчики событий для карточек пакетов
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            selectPackage(this);
        });
    });
    
    // Выбираем стандартный пакет по умолчанию
    const defaultPackage = document.querySelector('.package-card:nth-child(2)');
    if (defaultPackage) {
        selectPackage(defaultPackage);
    }
    
    // Устанавливаем начальное значение счетчика
    if (counterElement) {
        counterElement.textContent = '247';
    }
    
    // Обработчик для кнопки инвестирования
    if (joinButton) {
        joinButton.addEventListener('click', function() {
            alert('Спасибо за интерес к проекту! Функция инвестирования будет доступна в ближайшее время.');
        });
    }
});
