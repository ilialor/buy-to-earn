/**
 * Ailock Integration - AI Assistant for Co-Intent
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create Ailock elements
    createAilockElements();
    
    // Initialize Ailock functionality
    initAilock();
});

/**
 * Creates all necessary Ailock elements and adds them to the DOM
 */
function createAilockElements() {
    // Create main container
    const ailockContainer = document.createElement('div');
    ailockContainer.className = 'ailock-container';
    
    // Create Ailock button
    const ailockButton = document.createElement('div');
    ailockButton.className = 'ailock-button';
    ailockButton.id = 'ailock-button';
    
    // Create pulse animation element
    const ailockPulse = document.createElement('div');
    ailockPulse.className = 'ailock-pulse';
    
    // Create Ailock icon
    const ailockIcon = document.createElement('img');
    ailockIcon.className = 'ailock-icon';
    ailockIcon.src = 'images/ailock-icon.svg';
    ailockIcon.alt = 'Ailock AI Assistant';
    
    // Create tooltip
    const ailockTooltip = document.createElement('div');
    ailockTooltip.className = 'ailock-tooltip';
    ailockTooltip.textContent = 'Ask Ailock';
    
    // Assemble button
    ailockButton.appendChild(ailockPulse);
    ailockButton.appendChild(ailockIcon);
    ailockButton.appendChild(ailockTooltip);
    
    // Create chat widget
    const ailockChat = document.createElement('div');
    ailockChat.className = 'ailock-chat';
    ailockChat.id = 'ailock-chat';
    
    // Create chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'ailock-chat-header';
    
    const chatTitle = document.createElement('div');
    chatTitle.className = 'ailock-chat-title';
    
    const chatTitleIcon = document.createElement('img');
    chatTitleIcon.src = 'images/ailock-icon.svg';
    chatTitleIcon.alt = 'Ailock';
    
    const chatTitleText = document.createElement('h3');
    chatTitleText.textContent = 'Ailock Assistant';
    
    chatTitle.appendChild(chatTitleIcon);
    chatTitle.appendChild(chatTitleText);
    
    const chatClose = document.createElement('button');
    chatClose.className = 'ailock-chat-close';
    chatClose.innerHTML = '&times;';
    chatClose.setAttribute('aria-label', 'Close chat');
    
    chatHeader.appendChild(chatTitle);
    chatHeader.appendChild(chatClose);
    
    // Create chat messages container
    const chatMessages = document.createElement('div');
    chatMessages.className = 'ailock-chat-messages';
    chatMessages.id = 'ailock-messages';
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'ailock-message ai';
    welcomeMessage.textContent = 'Hello! I\'m Ailock, your AI assistant. How can I help you with Co-Intent today?';
    chatMessages.appendChild(welcomeMessage);
    
    // Create chat input area
    const chatInput = document.createElement('div');
    chatInput.className = 'ailock-chat-input';
    
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Type your message...';
    inputField.id = 'ailock-input';
    
    const sendButton = document.createElement('button');
    sendButton.className = 'ailock-chat-send';
    sendButton.id = 'ailock-send';
    sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
    sendButton.setAttribute('aria-label', 'Send message');
    
    chatInput.appendChild(inputField);
    chatInput.appendChild(sendButton);
    
    // Assemble chat widget
    ailockChat.appendChild(chatHeader);
    ailockChat.appendChild(chatMessages);
    ailockChat.appendChild(chatInput);
    
    // Create first-time visitor hint
    const ailockHint = document.createElement('div');
    ailockHint.className = 'ailock-hint';
    ailockHint.id = 'ailock-hint';
    
    const hintText = document.createElement('p');
    hintText.innerHTML = '<strong>Need help?</strong> I\'m Ailock, your AI assistant. Click me to get instant answers about Co-Intent platform.';
    hintText.style.margin = '0 0 5px 0';
    
    const hintClose = document.createElement('button');
    hintClose.className = 'ailock-hint-close';
    hintClose.innerHTML = '&times;';
    hintClose.setAttribute('aria-label', 'Dismiss hint');
    
    ailockHint.appendChild(hintText);
    ailockHint.appendChild(hintClose);
    
    // Add all elements to the container
    ailockContainer.appendChild(ailockButton);
    
    // Add container to the body
    document.body.appendChild(ailockContainer);
    document.body.appendChild(ailockChat);
    document.body.appendChild(ailockHint);
    
    // Create a fallback for the Ailock icon if SVG is not available
    createFallbackIcon();
}

/**
 * Creates a fallback icon for Ailock if SVG is not available
 */
function createFallbackIcon() {
    // Check if the SVG loaded correctly
    const ailockIcon = document.querySelector('.ailock-icon');
    
    ailockIcon.onerror = function() {
        // Replace with a Font Awesome icon as fallback
        const ailockButton = document.getElementById('ailock-button');
        const iconFallback = document.createElement('i');
        iconFallback.className = 'fas fa-robot ailock-icon-fallback';
        iconFallback.style.fontSize = '28px';
        iconFallback.style.color = 'white';
        
        // Remove the failed image
        ailockButton.removeChild(ailockIcon);
        
        // Add the fallback icon
        ailockButton.insertBefore(iconFallback, ailockButton.firstChild.nextSibling);
    };
}

/**
 * Initializes Ailock functionality
 */
function initAilock() {
    const ailockButton = document.getElementById('ailock-button');
    const ailockChat = document.getElementById('ailock-chat');
    const closeButton = document.querySelector('.ailock-chat-close');
    const ailockHint = document.getElementById('ailock-hint');
    const hintCloseButton = document.querySelector('.ailock-hint-close');
    const sendButton = document.getElementById('ailock-send');
    const inputField = document.getElementById('ailock-input');
    
    // Show hint for first-time visitors
    if (!localStorage.getItem('ailockHintShown')) {
        setTimeout(() => {
            ailockHint.classList.add('show');
        }, 3000);
    }
    
    // Toggle chat when Ailock button is clicked
    ailockButton.addEventListener('click', () => {
        ailockChat.classList.toggle('active');
        ailockHint.classList.remove('show');
        
        // Focus input field when chat is opened
        if (ailockChat.classList.contains('active')) {
            inputField.focus();
        }
    });
    
    // Close chat when close button is clicked
    closeButton.addEventListener('click', () => {
        ailockChat.classList.remove('active');
    });
    
    // Close hint when close button is clicked
    hintCloseButton.addEventListener('click', () => {
        ailockHint.classList.remove('show');
        localStorage.setItem('ailockHintShown', 'true');
    });
    
    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

/**
 * Sends a message from the user to Ailock
 */
function sendMessage() {
    const inputField = document.getElementById('ailock-input');
    const messagesContainer = document.getElementById('ailock-messages');
    const userMessage = inputField.value.trim();
    
    if (userMessage === '') return;
    
    // Create and add user message
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'ailock-message user';
    userMessageElement.textContent = userMessage;
    messagesContainer.appendChild(userMessageElement);
    
    // Clear input field
    inputField.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate AI response (in a real implementation, this would call an AI API)
    setTimeout(() => {
        const aiResponse = getAiResponse(userMessage);
        
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'ailock-message ai';
        aiMessageElement.textContent = aiResponse;
        messagesContainer.appendChild(aiMessageElement);
        
        // Scroll to bottom again
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

/**
 * Gets a simulated AI response based on the user's message
 * In a real implementation, this would call an AI API
 * 
 * @param {string} userMessage - The message from the user
 * @returns {string} - The AI's response
 */
function getAiResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I help you with Co-Intent today?';
    } else if (lowerMessage.includes('what is') && (lowerMessage.includes('co-intent') || lowerMessage.includes('cointent'))) {
        return 'Co-Intent is a Buy-to-Earn platform that connects investors with promising projects. You can invest in projects and earn returns as they succeed.';
    } else if (lowerMessage.includes('how') && lowerMessage.includes('invest')) {
        return 'To invest in a project, browse the marketplace, select a project that interests you, and click the "Join Now" button. You\'ll be guided through the investment process.';
    } else if (lowerMessage.includes('roi') || lowerMessage.includes('return')) {
        return 'ROI varies by project. Each project card shows the expected ROI. Our platform has an average ROI of 15-20% across all successful projects.';
    } else if (lowerMessage.includes('thank')) {
        return 'You\'re welcome! Is there anything else I can help you with?';
    } else {
        return 'I\'m still learning about that topic. For specific questions about Co-Intent, please contact our support team or check the documentation section.';
    }
}
