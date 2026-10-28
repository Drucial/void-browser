import { join } from "node:path";

import Database from "better-sqlite3";
import type { WebContents } from "electron";
import { app, BrowserWindow, nativeTheme, session } from "electron";

import { openMigratedDatabase } from "./db/database";
import { registerIpcHandlers } from "./ipc/register-ipc-handlers";
import type { OverlayManager } from "./overlay/overlay-manager";
import { createOverlayManager } from "./overlay/overlay-manager";
import { cleanUserAgent } from "./tabs/clean-user-agent";
import { withColorSchemeHint } from "./tabs/color-scheme-hint";
import type { TabManager } from "./tabs/tab-manager";
import { createTabManager } from "./tabs/tab-manager";
import { getBackgroundColor } from "./theme/background-color";
import type { ThemeController } from "./theme/theme-controller";
import { createThemeController } from "./theme/theme-controller";

function loadRendererEntry(contents: WebContents, entry: string) {
  const rendererUrl = process.env["ELECTRON_RENDERER_URL"];

  if (rendererUrl) {
    contents.loadURL(`${rendererUrl}/${entry}`);
  } else {
    contents.loadFile(join(__dirname, "../renderer", entry));
  }
}

function createWindow(
  tabs: TabManager,
  theme: ThemeController,
  overlay: OverlayManager
) {
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
    overlay.notifyThemeChanged();
  });
  const stopRaisingOverlay = tabs.onStackChanged(overlay.raise);
  window.on("closed", () => {
    stopFollowingTheme();
    stopRaisingOverlay();
    overlay.dispose();
    tabs.dispose();
  });
  overlay.attach(window);
  tabs.restore(window);
  loadRendererEntry(window.webContents, "index.html");
}

function cleanSessionUserAgent() {
  const { defaultSession } = session;
  defaultSession.setUserAgent(
    cleanUserAgent(defaultSession.getUserAgent(), app.getName())
  );
}

function sendColorSchemeHint() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ["http://*/*", "https://*/*"] },
    (details, callback) => {
      callback({
        requestHeaders:
          details.resourceType === "mainFrame"
            ? withColorSchemeHint(
                details.requestHeaders,
                nativeTheme.shouldUseDarkColors
              )
            : details.requestHeaders,
      });
    }
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
  sendColorSchemeHint();
  const db = openDatabase();
  const theme = createThemeController(db);
  const tabs = createTabManager(db, theme);
  const overlay = createOverlayManager({
    loadPage: (contents) => loadRendererEntry(contents, "overlay.html"),
    focusActiveTab: tabs.focusActive,
  });
  registerIpcHandlers(tabs, theme, overlay);
  createWindow(tabs, theme, overlay);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow(tabs, theme, overlay);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
