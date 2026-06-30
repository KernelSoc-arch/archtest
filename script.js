const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

let conversationHistory = [];

// Automatically load the key if you saved it previously
if (localStorage.getItem('gemmaApiKey')) {
    apiKeyInput.value = localStorage.getItem('gemmaApiKey');
}

// Save the key to your local browser storage (keeps it off GitHub)
saveKeyBtn.addEventListener('click', () => {
    localStorage.setItem('gemmaApiKey', apiKeyInput.value);
    alert('API Key saved locally!');
});

sendBtn.addEventListener('click', sendMessage);

// Allow pressing Enter to send (but Shift+Enter for new line)
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (!text) return;
    if (!apiKey) {
        alert('Please enter and save your API key first.');
        return;
    }

    addMessage(text, 'user');
    userInput.value = '';
    
    conversationHistory.push({ role: 'user', content: text });

    const typingMsg = addMessage('Thinking...', 'bot');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelSelect.value,
                messages: conversationHistory
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        const botReply = data.choices[0].message.content;
        typingMsg.innerText = botReply;
        conversationHistory.push({ role: 'assistant', content: botReply });

    } catch (error) {
        typingMsg.innerText = 'Error: ' + error.message;
    }
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    
    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}
