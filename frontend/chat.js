let stompClient = null;
let currentToken = null;
let currentUser = null;
let chatWith = null;
let typingTimeout = null;

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function startChat() {
    let token = document.getElementById('jwt-token').value.trim();
    chatWith = document.getElementById('chat-with-user').value.trim();

    if (token.startsWith('Bearer ')) token = token.substring(7);

    if (!token || !chatWith) {
        alert("Please provide both token and receiver identity.");
        return;
    }

    const payload = parseJwt(token);
    if (!payload || !payload.sub) {
        alert("Invalid JWT token.");
        return;
    }

    currentToken = token;
    currentUser = payload.sub; // typically 'sub' holds the username/email

    document.getElementById('chat-title').innerText = chatWith;
    document.getElementById('login-overlay').style.display = 'none';

    connect();
    fetchHistory();
    fetchOnlineStatus();
    
    // Poll online status periodically
    setInterval(fetchOnlineStatus, 10000);
}

function connect() {
    const socket = new SockJS('http://localhost:8080/chat');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Disable debug logs

    // Connect with JWT in headers
    stompClient.connect({ 'Authorization': 'Bearer ' + currentToken }, function (frame) {
        
        // Subscribe to private messages
        stompClient.subscribe('/user/queue/messages', function (msg) {
            const message = JSON.parse(msg.body);
            showChatMessage(message);
            
            // If we receive a message from the person we are chatting with, send read receipt
            if (message.senderId === chatWith && !message.seen) {
                sendReadReceipt(message.senderId);
            }
        });

        // Subscribe to typing indicators
        stompClient.subscribe('/user/queue/typing', function (msg) {
            const indicator = JSON.parse(msg.body);
            if (indicator.senderId === chatWith) {
                const typingEl = document.getElementById('typing-indicator');
                typingEl.style.display = indicator.typing ? 'block' : 'none';
            }
        });

        // Subscribe to read receipts
        stompClient.subscribe('/user/queue/readReceipt', function (msg) {
            const receipt = JSON.parse(msg.body);
            if (receipt.receiverId === chatWith) {
                // Update all ticks to blue for this chat
                document.querySelectorAll('.ticks.unseen').forEach(el => {
                    el.classList.remove('unseen');
                    el.innerHTML = '&#10004;&#10004;';
                });
            }
        });

        // Subscribe to public topic for online/offline events
        stompClient.subscribe('/topic/public', function (msg) {
            const status = JSON.parse(msg.body);
            if (status.userId === chatWith) {
                updateOnlineStatusUI(status.online);
            }
        });

    }, function (error) {
        alert("WebSocket Connection Error: " + error);
        logout();
    });
}

function fetchHistory() {
    fetch(`http://localhost:8080/api/chat/history?user1=${currentUser}&user2=${chatWith}`, {
        headers: { 'Authorization': 'Bearer ' + currentToken }
    })
    .then(response => response.json())
    .then(messages => {
        document.getElementById('message-area').innerHTML = ''; // clear
        messages.forEach(msg => {
            showChatMessage(msg);
            if (msg.senderId === chatWith && !msg.seen) {
                sendReadReceipt(msg.senderId);
            }
        });
    });
}

function fetchOnlineStatus() {
    fetch(`http://localhost:8080/api/chat/onlineUsers`, {
        headers: { 'Authorization': 'Bearer ' + currentToken }
    })
    .then(response => response.json())
    .then(users => {
        updateOnlineStatusUI(users.includes(chatWith));
    });
}

function updateOnlineStatusUI(isOnline) {
    const el = document.getElementById('user-status');
    el.innerText = isOnline ? 'Online' : 'Offline';
    el.style.color = isOnline ? '#d9fdd3' : '#a0b1b8';
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (content && stompClient) {
        const chatMessage = {
            senderId: currentUser,
            receiverId: chatWith,
            content: content
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        input.value = '';
        
        // Stop typing indicator immediately
        sendTypingStatus(false);
    }
}

function showChatMessage(message) {
    const messageArea = document.getElementById('message-area');
    
    // Check if message already exists (sometimes sending back to sender queue can cause dupes if history loads concurrently)
    if (document.getElementById('msg-' + message.id)) return;
    
    const messageElement = document.createElement('div');
    messageElement.id = 'msg-' + message.id;
    messageElement.classList.add('message');
    
    const isSent = message.senderId === currentUser;
    messageElement.classList.add(isSent ? 'sent' : 'received');

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let ticksHtml = '';
    if (isSent) {
        const tickColorClass = message.seen ? '' : 'unseen';
        ticksHtml = `<span class="ticks ${tickColorClass}">&#10004;&#10004;</span>`;
    }

    messageElement.innerHTML = `
        <span>${message.content}</span>
        <div class="msg-info">
            <span class="timestamp">${time}</span>
            ${ticksHtml}
        </div>
    `;
    
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function sendTypingStatus(isTyping) {
    if (!stompClient) return;
    stompClient.send("/app/chat.typing", {}, JSON.stringify({
        senderId: currentUser,
        receiverId: chatWith,
        typing: isTyping
    }));
}

function sendReadReceipt(senderId) {
    if (!stompClient) return;
    stompClient.send("/app/chat.readReceipt", {}, JSON.stringify({
        senderId: senderId,
        receiverId: currentUser
    }));
}

document.getElementById('send-btn').addEventListener('click', sendMessage);

const messageInput = document.getElementById('message-input');
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        // Send typing true
        sendTypingStatus(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => sendTypingStatus(false), 2000);
    }
});

function logout() {
    if (stompClient) stompClient.disconnect();
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('message-area').innerHTML = '';
    currentToken = null;
    currentUser = null;
}
