const CONFIG = {
    WS_URL: 'ws://localhost:8181',
    RECONNECT_DELAY: 5000,
    CONNECTION_STATES: {
        CONNECTED: 'connected',
        DISCONNECTED: 'disconnected'
    },
    LOG_LEVELS: ['error', 'warn', 'info', 'debug']
};

const LogManager = (function () {
    let ws = null;
    let logContainer = null;
    let statusElement = null;
    let isAutoReconnect = true;
    let reconnectTimeout = null;
    let elements = {};
    let activeFilters = new Set(CONFIG.LOG_LEVELS);
    let isViewLogFile = false;

    function renderLogContent() {
        document.querySelector(".content").innerHTML = `
    <div class="container-fluid p-3">
        <div class="card shadow-sm">
            <div class="card-header bg-light py-2">
                <div class="row align-items-center g-2">
                    <div class="col-auto">
                        <span id="status" class="badge rounded-pill bg-danger">Disconnected</span>
                    </div>
                    <div class="col">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" 
                                id="search" 
                                class="form-control" 
                                placeholder="Search logs...">
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="btn-group btn-group-sm" role="group">
                            <button id="realTimeLogs" class="btn btn-outline-info btn-sm">
                                <i class="bi bi-stopwatch"></i> Real Time Logs
                            </button>
                            <button id="clearLogs" class="btn btn-outline-secondary btn-sm">
                                <i class="bi bi-trash"></i> Clear
                            </button>
                            <button id="reconnect" class="btn btn-outline-primary btn-sm">
                                <i class="bi bi-arrow-repeat"></i> Reconnect
                            </button>
                            <button id="toggleAutoReconnect" class="btn btn-outline-success btn-sm">
                                <i class="bi bi-clock-history"></i> Auto: ON
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col">
                        <div class="btn-group btn-group-sm" role="group" id="levelFilters">
                            ${CONFIG.LOG_LEVELS.map(level => `
                                <input type="checkbox" class="btn-check" id="btn${level}" checked>
                                <label class="btn btn-outline-${getLevelBadgeClass(level)}" for="btn${level}">
                                    ${level.toUpperCase()}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col">
                        <label for="logDate" class="form-label">Select Log Date</label>
                        <input type="date" id="logDate" class="form-control">
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                <div id="logs" class="logs-container" style="height: 70vh; overflow-y: auto; font-family: monospace;"></div>
            </div>
        </div>
    </div>
    `;

        const style = document.createElement('style');
        document.head.appendChild(style);

        document.getElementById('logDate').addEventListener('change', async function (event) {
            const selectedDate = event.target.value;
            if (selectedDate) {
                await appendLogsByDate(selectedDate);
            }
        });
    }

    function initializeElements() {
        logContainer = document.getElementById('logs');
        statusElement = document.getElementById('status');
        elements = {
            realTimeLogsBtn: document.getElementById('realTimeLogs'),
            clearBtn: document.getElementById('clearLogs'),
            reconnectBtn: document.getElementById('reconnect'),
            autoReconnectBtn: document.getElementById('toggleAutoReconnect'),
            searchInput: document.getElementById('search'),
            levelFilters: document.getElementById('levelFilters')
        };
    }

    async function appendLogsByDate(date) {
        isViewLogFile = true;
        clearLogs();
        logContainer.innerHTML = '<div class="log-item">Loading log...</div>';

        const data = await fetchLogFile(date);
        clearLogs();
        if (data && data.length > 0) {
            data.forEach(log => {
                const logParts = log.match(/\[(.*?)\] \[(.*?)\] (.*)/);

                if (logParts && logParts.length === 4) {
                    const timestamp = logParts[1];
                    const level = logParts[2];
                    const message = logParts[3];

                    const logElement = document.createElement('div');
                    logElement.className = `log ${level}`;
                    logElement.setAttribute('data-level', level);
                    logElement.innerHTML = `
                        <span class="level badge bg-${getLevelBadgeClass(level)}">${level.toUpperCase()}</span>
                        <span class="timestamp">${timestamp}</span>
                        <span class="message">${escapeHtml(message)}</span>
                    `;

                    logContainer.appendChild(logElement);
                    applyFilters();
                }
            });
        } else {
            logContainer.innerHTML = '<div class="log-item">No logs available for this date.</div>';
        }
    }

    function attachEventListeners() {
        elements.realTimeLogsBtn.addEventListener('click', activeRealTimeLogs)
        elements.clearBtn.addEventListener('click', clearLogs);
        elements.reconnectBtn.addEventListener('click', reconnect);
        elements.autoReconnectBtn.addEventListener('click', toggleAutoReconnect);
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Add level filter handlers
        CONFIG.LOG_LEVELS.forEach(level => {
            const checkbox = document.getElementById(`btn${level}`);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    activeFilters.add(level);
                } else {
                    activeFilters.delete(level);
                }
                applyFilters();
            });
        });
    }

    function activeRealTimeLogs() {
        isViewLogFile = false;
        clearLogs();
    }

    function connectWebSocket() {
        if (ws) {
            ws.close();
        }

        ws = new WebSocket(CONFIG.WS_URL);
        ws.onopen = handleWebSocketOpen;
        ws.onmessage = handleWebSocketMessage;
        ws.onclose = handleWebSocketClose;
        ws.onerror = handleWebSocketError;
    }

    function handleWebSocketOpen() {
        console.log('WebSocket connection established');
        updateConnectionStatus(CONFIG.CONNECTION_STATES.CONNECTED);
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    }

    function handleWebSocketMessage(event) {
        try {
            const log = JSON.parse(event.data);
            appendLog(log);
        } catch (error) {
            console.error('Failed to parse log message:', error);
            appendErrorLog('Failed to parse incoming log message');
        }
    }

    function handleWebSocketClose() {
        updateConnectionStatus(CONFIG.CONNECTION_STATES.DISCONNECTED);

        if (isAutoReconnect) {
            reconnectTimeout = setTimeout(() => {
                connectWebSocket();
            }, CONFIG.RECONNECT_DELAY);
        }
    }

    function handleWebSocketError(error) {
        appendErrorLog(`WebSocket Error: ${error.message || 'Unknown error'}`);
    }

    function updateConnectionStatus(status) {
        statusElement.textContent = status === CONFIG.CONNECTION_STATES.CONNECTED ?
            'Connected' : 'Disconnected';
        statusElement.className = `badge rounded-pill ${status === CONFIG.CONNECTION_STATES.CONNECTED ? 'bg-success' : 'bg-danger'}`;
    }

    function applyFilters() {
        const searchTerm = elements.searchInput.value.toLowerCase();
        const logs = logContainer.querySelectorAll('.log');

        logs.forEach(log => {
            const text = log.textContent.toLowerCase();
            const level = log.getAttribute('data-level');
            const matchesSearch = text.includes(searchTerm);
            const matchesLevel = activeFilters.has(level);
            log.style.display = (matchesSearch && matchesLevel) ? 'flex' : 'none';
        });
    }

    function appendLog(log) {
        if (isViewLogFile) return;

        const logElement = document.createElement('div');
        logElement.className = `log ${log.level}`;
        logElement.setAttribute('data-level', log.level);
        logElement.innerHTML = `
            <span class="level badge bg-${getLevelBadgeClass(log.level)}">${log.level.toUpperCase()}</span>
            <span class="timestamp">${log.timestamp}</span>
            <span class="message">${escapeHtml(log.message)}</span>
        `;

        logContainer.appendChild(logElement);
        applyFilters();
        scrollToBottom();
    }

    function appendErrorLog(message) {
        if (isViewLogFile) return;

        appendLog({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: message
        });
    }

    function handleSearch(e) {
        applyFilters();
    }

    function handleVisibilityChange() {
        if (document.visibilityState === 'visible' &&
            ws?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
    }

    function clearLogs() {
        logContainer.innerHTML = '';
    }

    function reconnect() {
        connectWebSocket();
    }

    function toggleAutoReconnect() {
        isAutoReconnect = !isAutoReconnect;
        const btn = elements.autoReconnectBtn;
        btn.innerHTML = `
            <i class="bi bi-clock-history"></i> 
            Auto: ${isAutoReconnect ? 'ON' : 'OFF'}
        `;
        btn.className = `btn btn-outline-${isAutoReconnect ? 'success' : 'secondary'} btn-sm`;
    }

    function scrollToBottom() {
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getLevelBadgeClass(level) {
        const classes = {
            error: 'danger',
            warn: 'warning',
            info: 'info',
            debug: 'secondary'
        };
        return classes[level] || 'secondary';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const initialize = async function () {
        if (!document.querySelector('link[href*="bootstrap"]')) {
            const bootstrapCSS = document.createElement('link');
            bootstrapCSS.rel = 'stylesheet';
            bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
            document.head.appendChild(bootstrapCSS);
        }

        if (!document.querySelector('link[href*="bootstrap-icons"]')) {
            const bootstrapIcons = document.createElement('link');
            bootstrapIcons.rel = 'stylesheet';
            bootstrapIcons.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css';
            document.head.appendChild(bootstrapIcons);
        }

        await updateNavActive("showLogManager()");
        await renderLogContent();
        initializeElements();
        attachEventListeners();
        connectWebSocket();
    };

    return {
        initialize: initialize
    };
})();

async function showLogManager() {
    await LogManager.initialize();
}

async function fetchLogFile(date) {
    const token = getToken();
    const api = `${ref}/log/${date}`
    const response = await getResponse(api, "GET", token, null);

    if (!response.ok) {
        const errorData = await response.json();
        document.getElementById('logs').innerHTML = '<div class="log-item">Failed to load logs.</div>';
        throw new Error(errorData)
    }

    return response.json();
}