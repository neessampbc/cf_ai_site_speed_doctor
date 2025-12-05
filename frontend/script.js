/**
 * script.js - frontend javascript for ai site speed doctor
 * 
 * handles all ui interactions and api communication:
 * - site analysis form submission
 * - chat interface with ai
 * - analysis history display
 * - result visualization
 * 
 * communicates with cloudflare worker api endpoints
 * 
 * @module frontend/script
 */

const API_BASE = '/api'; // TODO: update to actual worker url when deployed

let currentSiteId = null;

// ============================================================================
// event listeners
// ============================================================================

/**
 * handle analyze form submission
 * 
 * triggers when user submits the analyze form with a website url.
 */
document.getElementById('analyze-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('site-url').value;
  await analyzeSite(url);
});

/**
 * handle chat form submission
 * 
 * triggers when user submits a chat message.
 */
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = document.getElementById('chat-input').value;
  document.getElementById('chat-input').value = '';
  await sendChatMessage(message);
});

// ============================================================================
// api communication functions
// ============================================================================

/**
 * analyzes a website
 * 
 * sends analysis request to api and handles response.
 * updates ui with results and enables chat interface.
 * 
 * @param {string} url - website url to analyze
 */
async function analyzeSite(url) {
  const statusEl = document.getElementById('analyze-status');
  statusEl.className = 'status loading';
  statusEl.textContent = 'Analyzing site...';

  try {
    // send analysis request to worker api
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ siteUrl: url })
    });

    const data = await response.json();

    // check for api errors
    if (!response.ok) {
      throw new Error(data.error || 'analysis failed');
    }

    currentSiteId = data.siteId;
    statusEl.className = 'status success';
    statusEl.textContent = 'Analysis complete!';

    // TODO: display results properly
    displayResults(data);
    
    document.getElementById('chat-section').style.display = 'block';
    
    // load history
    await loadHistory();

  } catch (error) {
    statusEl.className = 'status error';
    statusEl.textContent = `Error: ${error.message}`;
  }
}

/**
 * sends a chat message to the ai
 * 
 * sends user message to api and displays ai response.
 * maintains conversation flow in the chat interface.
 * 
 * @param {string} message - user's chat message
 */
async function sendChatMessage(message) {
  // require site analysis before chat
  if (!currentSiteId) {
    alert('Please analyze a site first');
    return;
  }

  // add user message to chat
  addChatMessage('user', message);

  const chatMessages = document.getElementById('chat-messages');
  const loadingEl = document.createElement('div');
  loadingEl.className = 'message ai';
  
  // create loading message safely using textContent
  const loadingRole = document.createElement('div');
  loadingRole.className = 'role';
  loadingRole.textContent = 'ai';
  
  const loadingContent = document.createElement('div');
  loadingContent.textContent = 'Thinking...';
  
  loadingEl.appendChild(loadingRole);
  loadingEl.appendChild(loadingContent);
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
    addChatMessage('ai', data.response || 'No response');

  } catch (error) {
    loadingEl.remove();
    addChatMessage('ai', `Error: ${error.message}`);
  }
}

/**
 * loads analysis history for current site
 * 
 * fetches and displays past analyses for the current site.
 */
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

// ============================================================================
// ui update functions
// ============================================================================

/**
 * displays analysis results in the ui
 * 
 * formats and renders analysis data for user viewing.
 * 
 * @param {Object} data - analysis response data
 */
function displayResults(data) {
  const resultsSection = document.getElementById('results-section');
  const resultsContent = document.getElementById('results-content');
  
  resultsSection.style.display = 'block';
  
  // clear previous results
  resultsContent.textContent = '';
  
  // TODO: format and display results nicely
  // TODO: add charts/graphs for metrics
  // TODO: highlight key recommendations
  
  // create results grid safely using dom methods
  const grid = document.createElement('div');
  grid.className = 'results-grid';
  
  // site url card
  const urlCard = document.createElement('div');
  urlCard.className = 'result-card';
  const urlTitle = document.createElement('h3');
  urlTitle.textContent = 'Site URL';
  const urlValue = document.createElement('div');
  urlValue.className = 'value';
  urlValue.textContent = data.url || 'Unknown';
  urlCard.appendChild(urlTitle);
  urlCard.appendChild(urlValue);
  
  // status card
  const statusCard = document.createElement('div');
  statusCard.className = 'result-card';
  const statusTitle = document.createElement('h3');
  statusTitle.textContent = 'Status';
  const statusValue = document.createElement('div');
  statusValue.className = 'value';
  statusValue.textContent = data.status || 'Complete';
  statusCard.appendChild(statusTitle);
  statusCard.appendChild(statusValue);
  
  grid.appendChild(urlCard);
  grid.appendChild(statusCard);
  
  // json preview - use textContent for safety
  const pre = document.createElement('pre');
  pre.style.marginTop = '20px';
  pre.style.padding = '15px';
  pre.style.background = 'white';
  pre.style.borderRadius = '6px';
  pre.style.overflowX = 'auto';
  pre.textContent = JSON.stringify(data, null, 2);
  
  resultsContent.appendChild(grid);
  resultsContent.appendChild(pre);
}

/**
 * adds a message to the chat interface
 * 
 * creates and appends a chat message element to the chat container.
 * uses textContent to prevent xss attacks from malicious content.
 * 
 * @param {string} role - message role ('user' or 'ai')
 * @param {string} content - message content
 */
function addChatMessage(role, content) {
  const chatMessages = document.getElementById('chat-messages');
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  
  // create role element
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = role;
  
  // create content element - use textContent to prevent xss
  const contentEl = document.createElement('div');
  contentEl.textContent = content;
  
  messageEl.appendChild(roleEl);
  messageEl.appendChild(contentEl);
  chatMessages.appendChild(messageEl);
  
  // scroll to bottom to show latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * displays analysis history in the ui
 * 
 * renders list of past analyses for the current site.
 * 
 * @param {Array} history - array of analysis history items
 */
function displayHistory(history) {
  const historyContent = document.getElementById('history-content');
  
  if (history.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No history yet';
    historyContent.appendChild(emptyMsg);
    return;
  }

  // create history items safely using textContent
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = item.timestamp || 'Unknown time';
    
    const url = document.createElement('div');
    url.textContent = item.url || 'Unknown URL';
    
    historyItem.appendChild(timestamp);
    historyItem.appendChild(url);
    historyContent.appendChild(historyItem);
  });
}

// ============================================================================
// future enhancements
// ============================================================================

// TODO: add real-time updates using websockets or polling
// TODO: add better error handling with retry logic
// TODO: add loading states for better ux
// TODO: add result visualization (charts, graphs)
// TODO: add export functionality for analysis results
// TODO: add keyboard shortcuts for common actions
