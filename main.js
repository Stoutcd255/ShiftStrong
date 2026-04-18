const { app, BrowserWindow } = require('electron');
const path = require('path');

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
      nodeIntegration: false
    }
  });

  win.loadFile(getHtmlPath());
  // Uncomment next line to always open devtools for debugging
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
