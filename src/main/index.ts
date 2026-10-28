import { join } from "node:path";

import { app, BrowserWindow } from "electron";

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  window.on("ready-to-show", () => window.show());

  const rendererUrl = process.env["ELECTRON_RENDERER_URL"];

  if (rendererUrl) {
    window.loadURL(rendererUrl);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
