import { join } from "node:path";

import Database from "better-sqlite3";
import { app, BrowserWindow, session } from "electron";

import { openMigratedDatabase } from "./db/database";
import { registerIpcHandlers } from "./ipc/register-ipc-handlers";
import { cleanUserAgent } from "./tabs/clean-user-agent";
import type { TabManager } from "./tabs/tab-manager";
import { createTabManager } from "./tabs/tab-manager";
import type { ThemeController } from "./theme/theme-controller";
import { createThemeController } from "./theme/theme-controller";

const LIGHT_BACKGROUND = "#ffffff"; // must mirror --background in globals.css (oklch(1 0 0))
const DARK_BACKGROUND = "#0a0a0a"; // must mirror .dark --background in globals.css (oklch(0.145 0 0))

function getBackgroundColor(isDark: boolean) {
  return isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
}

function createWindow(tabs: TabManager, theme: ThemeController) {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    backgroundColor: getBackgroundColor(theme.getState().isDark),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  window.on("ready-to-show", () => window.show());
  const stopFollowingTheme = theme.onChanged((state) => {
    window.setBackgroundColor(getBackgroundColor(state.isDark));
    window.webContents.send("theme:changed");
  });
  window.on("closed", () => {
    stopFollowingTheme();
    tabs.dispose();
  });
  tabs.restore(window);

  const rendererUrl = process.env["ELECTRON_RENDERER_URL"];

  if (rendererUrl) {
    window.loadURL(rendererUrl);
  } else {
    window.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

function cleanSessionUserAgent() {
  const { defaultSession } = session;
  defaultSession.setUserAgent(
    cleanUserAgent(defaultSession.getUserAgent(), app.getName())
  );
}

function openDatabase() {
  return openMigratedDatabase(
    new Database(join(app.getPath("userData"), "void.db")),
    join(app.getAppPath(), "drizzle")
  );
}

app.whenReady().then(() => {
  cleanSessionUserAgent();
  const db = openDatabase();
  const theme = createThemeController(db);
  const tabs = createTabManager(db);
  registerIpcHandlers(tabs, theme);
  createWindow(tabs, theme);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(tabs, theme);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
