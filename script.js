const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// Load key from storage
if (localStorage.getItem('gemmaApiKey')) {
    apiKeyInput.value = localStorage.getItem('gemmaApiKey');
}

saveKeyBtn.addEventListener('click', () => {
    localStorage.setItem('gemmaApiKey', apiKeyInput.value);
    alert('Key saved!');
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = userInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    
    if (!text || !apiKey) return alert('Fill in the key and a message!');

    addMessage(text, 'user');
    userInput.value = '';
    
    const typingMsg = addMessage('Thinking...', 'bot');

    try {
        // Updated URL for Google AI Studio
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelSelect.value}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        // Google returns content in a specific nested object structure
        const botReply = data.candidates[0].content.parts[0].text;
        typingMsg.innerText = botReply;

    } catch (error) {
        typingMsg.innerText = 'Error: ' + error.message;
    }
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}
