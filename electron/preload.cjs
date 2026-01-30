const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  app: {
    getName: () => 'Conversational AI Voice App',
    getVersion: () => '0.0.1',
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  setAutoLaunch: (enabled) => ipcRenderer.invoke('set-auto-launch', enabled),
  getAutoLaunchStatus: () => ipcRenderer.invoke('get-auto-launch-status'),
});
