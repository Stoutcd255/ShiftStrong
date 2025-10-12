const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function isPackaged() {
  // When packaged, process.resourcesPath points to resources/
  // App is unpacked in resources/app/
  // __dirname is .../resources/app/
  const mainModule = process.mainModule;
  const isAsar = Boolean(mainModule && typeof mainModule.filename === 'string' && mainModule.filename.includes('app.asar'));

  return Boolean(app.isPackaged || isAsar || __dirname.includes('app'));
}

function getHtmlPath() {
  if (isPackaged()) {
    // Packaged: index.html is at app root (resources/app/index.html)
    return path.join(__dirname, 'index.html');
  }

  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return distIndex;
  }

  return path.join(__dirname, 'index.html');
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
      contextIsolation: false,
      nodeIntegration: true
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
