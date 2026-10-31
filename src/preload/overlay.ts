import { contextBridge, ipcRenderer } from "electron";

import type {
  OverlayApi,
  OverlayDataApi,
  PaletteIntent,
  ToastRequest,
} from "../shared/ipc";

const api: OverlayDataApi = {
  listTabs: () => ipcRenderer.invoke("tabs:list"),
  createTab: (url) => ipcRenderer.invoke("tabs:create", url),
  closeTab: (id) => ipcRenderer.invoke("tabs:close", id),
  activateTab: (id) => ipcRenderer.invoke("tabs:activate", id),
  openPalette: () => ipcRenderer.send("overlay:open-palette"),
  showToast: (toast) => ipcRenderer.send("overlay:toast", toast),
  onTabsChanged: (listener) => {
    const handle = () => listener();
    ipcRenderer.on("tabs:changed", handle);

    return () => ipcRenderer.removeListener("tabs:changed", handle);
  },
  searchHistory: (query) => ipcRenderer.invoke("history:search", query),
  getTheme: () => ipcRenderer.invoke("theme:get"),
  onThemeChanged: (listener) => {
    const handle = () => listener();
    ipcRenderer.on("theme:changed", handle);

    return () => ipcRenderer.removeListener("theme:changed", handle);
  },
};

const overlayApi: OverlayApi = {
  reportContentHeight: (height) =>
    ipcRenderer.send("overlay:report-content-height", height),
  navigate: (request) => ipcRenderer.invoke("overlay:navigate", request),
  close: () => ipcRenderer.send("overlay:close"),
  onOpen: (listener) => {
    const handle = (_event: unknown, intent: PaletteIntent) => listener(intent);
    ipcRenderer.on("overlay:open", handle);

    return () => ipcRenderer.removeListener("overlay:open", handle);
  },
  onPeek: (listener) => {
    const handle = (_event: unknown, peek: { isOpen: boolean }) =>
      listener(peek.isOpen);
    ipcRenderer.on("overlay:peek", handle);

    return () => ipcRenderer.removeListener("overlay:peek", handle);
  },
  reportPanelHover: (isInside) =>
    ipcRenderer.send("peek:hover", { zone: "panel", isInside }),
  dismissPeek: () => ipcRenderer.send("overlay:peek-dismiss"),
  confirmPeekExit: () => ipcRenderer.send("overlay:peek-exited"),
  toggleSidebar: () => ipcRenderer.send("overlay:toggle-sidebar"),
  onToast: (listener) => {
    const handle = (_event: unknown, toast: ToastRequest) => listener(toast);
    ipcRenderer.on("overlay:toast", handle);

    return () => ipcRenderer.removeListener("overlay:toast", handle);
  },
};

contextBridge.exposeInMainWorld("api", api);
contextBridge.exposeInMainWorld("overlayApi", overlayApi);
