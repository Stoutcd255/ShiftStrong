const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
require('dotenv').config();

function isPackaged() {
  return app.isPackaged;
}

function getHtmlPath() {
  const htmlPath = isPackaged()
    ? path.join(__dirname, 'index.html')
    : path.join(__dirname, 'dist', 'index.html');
  return htmlPath;
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 950,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'all_badge.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
    }
  });

  win.loadFile(getHtmlPath());
  // Uncomment next line to always open devtools for debugging
  // win.webContents.openDevTools();
}

const AI_SYSTEM_PROMPT = [
  'You are ShiftStrong AI Coach for first responders.',
  'Use concise, practical coaching language.',
  'Prioritize safety, progressive overload, and recovery.',
  'Do not provide medical diagnosis.',
].join(' ');

const sanitizeText = (value, max = 1200) => String(value || '').trim().slice(0, max);

ipcMain.handle('assistant:ask', async (_event, payload) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'Missing OPENAI_API_KEY. Add it to your environment or .env file.' };
  }

  const userMessage = sanitizeText(payload?.message, 2000);
  if (!userMessage) {
    return { ok: false, error: 'Message is empty.' };
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const context = sanitizeText(JSON.stringify(payload?.context || {}), 6000);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          { role: 'user', content: `User context: ${context}` },
          { role: 'user', content: userMessage },
        ],
        max_output_tokens: 500,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `AI request failed (${response.status}): ${text.slice(0, 300)}` };
    }

    const data = await response.json();
    const answer = sanitizeText(data?.output_text || '', 8000);
    return { ok: true, answer: answer || 'No response text returned by model.' };
  } catch (error) {
    return { ok: false, error: `AI request error: ${error.message}` };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
