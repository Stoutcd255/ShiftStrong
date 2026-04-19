const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('shiftStrong', {
  version: '1.0.0',
});
