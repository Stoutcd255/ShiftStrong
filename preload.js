const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shiftStrong', {
  version: '1.0.0',
  askAssistant: (payload) => ipcRenderer.invoke('assistant:ask', payload),
});
