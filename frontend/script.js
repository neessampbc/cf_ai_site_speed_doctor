// frontend javascript - handles ui interactions and api calls

const API_BASE = '/api'; // TODO: update to actual worker url when deployed

let currentSiteId = null;

// handle analyze form submission
document.getElementById('analyze-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('site-url').value;
  await analyzeSite(url);
});

// handle chat form submission
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('chat-input').value;
  document.getElementById('chat-input').value = '';
  await sendChatMessage(message);
});

// analyze a website
async function analyzeSite(url) {
  const statusEl = document.getElementById('analyze-status');
  statusEl.className = 'status loading';
  statusEl.textContent = 'analyzing site...';

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ siteUrl: url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'analysis failed');
    }

    currentSiteId = data.siteId;
    statusEl.className = 'status success';
    statusEl.textContent = 'analysis complete!';

    // TODO: display results properly
    displayResults(data);
    
    // show chat section
    document.getElementById('chat-section').style.display = 'block';
    
    // load history
    await loadHistory();

  } catch (error) {
    statusEl.className = 'status error';
    statusEl.textContent = `error: ${error.message}`;
  }
}

// display analysis results
function displayResults(data) {
  const resultsSection = document.getElementById('results-section');
  const resultsContent = document.getElementById('results-content');
  
  resultsSection.style.display = 'block';
  
  // TODO: format and display results nicely
  resultsContent.innerHTML = `
    <div class="results-grid">
      <div class="result-card">
        <h3>site url</h3>
        <div class="value">${data.url || 'unknown'}</div>
      </div>
      <div class="result-card">
        <h3>status</h3>
        <div class="value">${data.status || 'complete'}</div>
      </div>
    </div>
    <pre style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
  `;
}

// send chat message
async function sendChatMessage(message) {
  if (!currentSiteId) {
    alert('please analyze a site first');
    return;
  }

  // add user message to chat
  addChatMessage('user', message);

  const chatMessages = document.getElementById('chat-messages');
  const loadingEl = document.createElement('div');
  loadingEl.className = 'message ai';
  loadingEl.innerHTML = '<div class="role">ai</div>thinking...';
  chatMessages.appendChild(loadingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        siteId: currentSiteId,
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'chat failed');
    }

    // remove loading message
    loadingEl.remove();

    // add ai response
    addChatMessage('ai', data.response || 'no response');

  } catch (error) {
    loadingEl.remove();
    addChatMessage('ai', `error: ${error.message}`);
  }
}

// add message to chat
function addChatMessage(role, content) {
  const chatMessages = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  messageEl.innerHTML = `
    <div class="role">${role}</div>
    <div>${content}</div>
  `;
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// load analysis history
async function loadHistory() {
  if (!currentSiteId) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/history/${currentSiteId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'failed to load history');
    }

    displayHistory(data.history || []);

  } catch (error) {
    console.error('failed to load history:', error);
  }
}

// display history
function displayHistory(history) {
  const historyContent = document.getElementById('history-content');
  
  if (history.length === 0) {
    historyContent.innerHTML = '<p>no history yet</p>';
    return;
  }

  historyContent.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="timestamp">${item.timestamp || 'unknown time'}</div>
      <div>${item.url || 'unknown url'}</div>
    </div>
  `).join('');
}

// TODO: add real-time updates using websockets or polling
// TODO: add better error handling
// TODO: add loading states
// TODO: add result visualization (charts, graphs)

