// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    downloadVideo: (data) => ipcRenderer.invoke('download-video', data),
    onDownloadProgress: (callback) =>
        ipcRenderer.on('download-progress', (event, data) => callback(data))
});