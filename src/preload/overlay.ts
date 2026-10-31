import { contextBridge, ipcRenderer } from "electron";

import type {
  OverlayApi,
  OverlayDataApi,
  PaletteIntent,
  ToastRequest,
} from "../shared/ipc";

const api: OverlayDataApi = {
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
  onToast: (listener) => {
    const handle = (_event: unknown, toast: ToastRequest) => listener(toast);
    ipcRenderer.on("overlay:toast", handle);

    return () => ipcRenderer.removeListener("overlay:toast", handle);
  },
};

contextBridge.exposeInMainWorld("api", api);
contextBridge.exposeInMainWorld("overlayApi", overlayApi);
