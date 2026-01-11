console.log("Preload loaded");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("windowAPI", {
  minimize: () => ipcRenderer.send("win-minimize"),
  close: () => ipcRenderer.send("win-close"),
  toggleMaximize: () => ipcRenderer.send("win-toggle-maximize"),

  getWindowTitle: () => ipcRenderer.invoke("get-window-title"),

  getWindowIcon: () => ipcRenderer.invoke("get-window-icon"),
});
