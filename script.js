class GodfielderTool {
    constructor() {
        this.isRunning = false;
        this.bots = [];
        this.intervalIds = [];
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.nameInput = document.getElementById('name');
        this.roomInput = document.getElementById('room');
        this.messageInput = document.getElementById('message');
        this.botCountInput = document.getElementById('botCount');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.logBox = document.getElementById('logBox');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
    }

    log(message, type = 'info', icon = 'info') {
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const iconMap = {
            info: 'info',
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            bot: 'smart_toy',
            message: 'message',
            room: 'meeting_room'
        };

        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="material-icons log-icon">${iconMap[icon] || icon}</span>
            <span class="log-message">${message}</span>
        `;

        this.logBox.appendChild(entry);
        this.logBox.scrollTop = this.logBox.scrollHeight;
    }

    async processText(text, botId) {
        let processedText = text;
        
        const reMatch = text.match(/\/re(\d*)\//g);
        if (reMatch) {
            for (const match of reMatch) {
                const lengthMatch = match.match(/\/re(\d+)\//);
                const length = lengthMatch ? lengthMatch[1] : '';
                const url = length ? 
                    `https://1tasu1ha2.vercel.app/api/random-emoji?length=${length}` :
                    'https://1tasu1ha2.vercel.app/api/random-emoji';
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    processedText = processedText.replace(match, data.result || '');
                } catch (error) {
                    this.log(`Bot ${botId}: Failed to get random emoji - ${error.message}`, 'error', 'error');
                }
            }
        }

        const rsMatch = text.match(/\/rs(\d*)\//g);
        if (rsMatch) {
            for (const match of rsMatch) {
                const lengthMatch = match.match(/\/rs(\d+)\//);
                const length = lengthMatch ? lengthMatch[1] : '';
                const url = length ? 
                    `https://1tasu1ha2.vercel.app/api/random-string?length=${length}` :
                    'https://1tasu1ha2.vercel.app/api/random-string';
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    processedText = processedText.replace(match, data.result || '');
                } catch (error) {
                    this.log(`Bot ${botId}: Failed to get random string - ${error.message}`, 'error', 'error');
                }
            }
        }

        return processedText;
    }

    async createBot(botId, name, room, message) {
        try {
            this.log(`Bot ${botId}: Starting authentication...`, 'info', 'bot');
            
            // Get token
            const tokenRes = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCBvMvZkHymK04BfEaERtbmELhyL8-mtAg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnSecureToken: true })
            });

            if (!tokenRes.ok) {
                throw new Error(`Authentication failed: ${tokenRes.status}`);
            }

            const tokenData = await tokenRes.json();
            const token = tokenData.idToken;
            
            this.log(`Bot ${botId}: Authentication successful`, 'success', 'check_circle');

            // Process name for this bot instance
            const processedName = await this.processText(name, botId);
            
            // Create room
            this.log(`Bot ${botId}: Creating room...`, 'info', 'room');
            const roomRes = await fetch('https://asia-northeast1-godfield.cloudfunctions.net/createRoom', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'hidden',
                    password: room,
                    userName: processedName
                })
            });

            if (!roomRes.ok) {
                throw new Error(`Room creation failed: ${roomRes.status}`);
            }

            const roomData = await roomRes.json();
            const roomId = roomData.roomId;
            
            this.log(`Bot ${botId}: Room created (ID: ${roomId})`, 'success', 'check_circle');

            // Join room
            this.log(`Bot ${botId}: Joining room...`, 'info', 'room');
            const joinRes = await fetch('https://asia-northeast1-godfield.cloudfunctions.net/addRoomUser', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'hidden',
                    roomId: roomId,
                    userName: processedName
                })
            });

            if (!joinRes.ok) {
                throw new Error(`Room join failed: ${joinRes.status}`);
            }

            this.log(`Bot ${botId}: Successfully joined room`, 'success', 'check_circle');

            return { token, roomId, processedName };

        } catch (error) {
            this.log(`Bot ${botId}: Setup failed - ${error.message}`, 'error', 'error');
            return null;
        }
    }

    async sendMessage(botId, token, roomId, message) {
        try {
            const processedMessage = await this.processText(message, botId);
            
            const response = await fetch('https://asia-northeast1-godfield.cloudfunctions.net/setComment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: 'hidden',
                    roomId: roomId,
                    text: processedMessage
                })
            });

            if (!response.ok) {
                throw new Error(`Message send failed: ${response.status}`);
            }

            this.log(`Bot ${botId}: Message sent - "${processedMessage}"`, 'success', 'message');
            return true;

        } catch (error) {
            this.log(`Bot ${botId}: Message send failed - ${error.message}`, 'error', 'error');
            return false;
        }
    }

    async start() {
        if (this.isRunning) return;

        const name = this.nameInput.value.trim();
        const room = this.roomInput.value.trim();
        const message = this.messageInput.value.trim();
        const botCount = parseInt(this.botCountInput.value);

        if (!name || !room || !message) {
            this.log('Please fill in all fields', 'error', 'error');
            return;
        }

        if (botCount < 1 || botCount > 12) {
            this.log('Bot count must be between 1 and 12', 'error', 'error');
            return;
        }

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.bots = [];
        this.intervalIds = [];

        this.log(`Starting Godfielder with ${botCount} bots...`, 'info', 'bot');

        // Create and setup bots
        for (let i = 1; i <= botCount; i++) {
            if (!this.isRunning) break;
            
            const botData = await this.createBot(i, name, room, message);
            if (botData) {
                this.bots.push({ id: i, ...botData });
                
                // Start message sending for this bot
                const intervalId = setInterval(async () => {
                    if (!this.isRunning) return;
                    await this.sendMessage(i, botData.token, botData.roomId, message);
                }, 2000 + (i * 100)); // Stagger the messages slightly
                
                this.intervalIds.push(intervalId);
            }
            
            // Small delay between bot setups
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (this.bots.length === 0) {
            this.log('No bots were successfully created', 'error', 'error');
            this.stop();
        } else {
            this.log(`${this.bots.length} bots are now active and sending messages`, 'success', 'check_circle');
        }
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;

        // Clear all intervals
        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];
        this.bots = [];

        this.log('All bots stopped', 'warning', 'warning');
    }
}

// Initialize the tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GodfielderTool();
});
