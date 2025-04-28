// js/home-chat.js
// Initialize chat interactions and UI for home page
// Assumes initializeUI is available from ui.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI (navigation, modals, language selector)
    if (typeof initializeUI === 'function') initializeUI();

    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const messagesContainer = document.querySelector('.chat-messages');
    const suggestions = document.querySelectorAll('.suggestion-btn');

    // Handle suggestion buttons
    suggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            if (userInput) userInput.value = text;
            if (sendBtn) sendBtn.click();
        });
    });

    // Handle send button
    if (sendBtn && userInput && messagesContainer) {
        sendBtn.addEventListener('click', () => {
            const text = userInput.value.trim();
            if (!text) return;

            // Append user message
            const msgElem = document.createElement('div');
            msgElem.className = 'message user';
            msgElem.innerHTML = `<p>${text}</p>`;
            messagesContainer.appendChild(msgElem);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            userInput.value = '';

            // Simulate AI response
            setTimeout(() => {
                const aiElem = document.createElement('div');
                aiElem.className = 'message ai';
                aiElem.innerHTML = `<p>Я работаю над ответом на: ${text}</p>`;
                messagesContainer.appendChild(aiElem);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 800);
        });
    }
});
