import { join } from "node:path";

import Database from "better-sqlite3";
import { app, BrowserWindow, nativeTheme } from "electron";

import { openMigratedDatabase } from "./db/database";
import { registerIpcHandlers } from "./ipc/register-ipc-handlers";
import type { TabManager } from "./tabs/tab-manager";
import { createTabManager } from "./tabs/tab-manager";

const LIGHT_BACKGROUND = "#ffffff"; // must mirror --background in globals.css (oklch(1 0 0))
const DARK_BACKGROUND = "#0a0a0a"; // must mirror .dark --background in globals.css (oklch(0.145 0 0))

function createWindow(tabs: TabManager) {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors
      ? DARK_BACKGROUND
      : LIGHT_BACKGROUND,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  window.on("ready-to-show", () => window.show());
  window.on("closed", () => tabs.dispose());
  tabs.restore(window);

  const rendererUrl = process.env["ELECTRON_RENDERER_URL"];

  if (rendererUrl) {
    window.loadURL(rendererUrl);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function openDatabase() {
  return openMigratedDatabase(
    new Database(join(app.getPath("userData"), "void.db")),
    join(app.getAppPath(), "drizzle")
  );
}

app.whenReady().then(() => {
  const tabs = createTabManager(openDatabase());
  registerIpcHandlers(tabs);
  createWindow(tabs);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(tabs);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
