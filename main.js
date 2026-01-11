const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 500,
    minHeight: 400,

    icon: path.join(__dirname, "icon.png"),
    backgroundColor: "#121212",

    frame: false,
    titleBarStyle: "hidden",

    resizable: true,
    maximizable: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.on("closed", () => {
    win = null;
  });
}

ipcMain.on("win-minimize", () => {
  if (win) win.minimize();
});

ipcMain.on("win-close", () => {
  if (win) win.close();
});

ipcMain.on("win-toggle-maximize", () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.handle("get-window-title", (event) => {
  return win.getTitle();
});

ipcMain.handle("get-window-icon", (event) => {
  return path.join(__dirname, "icon.png");
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
