// js/home-chat.js
// Initialize chat interactions and UI for home page
// Assumes initializeUI is available from ui.js

import { ailockApi } from './api/index.js';

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

    // Handle send button with Ailock API
    if (sendBtn && userInput && messagesContainer) {
        sendBtn.addEventListener('click', async () => {
            const text = userInput.value.trim();
            if (!text) return;

            // Append user message
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerHTML = `<p>${text}</p>`;
            messagesContainer.appendChild(userMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            userInput.value = '';

            // Send to Ailock
            const session = localStorage.getItem('ailockSessionId') || '';
            try {
                const result = await ailockApi.sendMessage(session, text);
                localStorage.setItem('ailockSessionId', result.sessionId);
                // Render all messages
                messagesContainer.innerHTML = '';
                result.messages.forEach(msg => {
                    const msgElem = document.createElement('div');
                    msgElem.className = `message ${msg.role}`;
                    msgElem.innerHTML = `<p>${msg.content}</p>`;
                    messagesContainer.appendChild(msgElem);
                });
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } catch (error) {
                console.error('Ailock API error:', error);
            }
        });
    }
});
