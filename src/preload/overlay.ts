import { contextBridge, ipcRenderer } from "electron";

import type { OverlayApi, ThemeApi, ToastRequest } from "../shared/ipc";

const api: ThemeApi = {
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
  onToast: (listener) => {
    const handle = (_event: unknown, toast: ToastRequest) => listener(toast);
    ipcRenderer.on("overlay:toast", handle);

    return () => ipcRenderer.removeListener("overlay:toast", handle);
  },
};

contextBridge.exposeInMainWorld("api", api);
contextBridge.exposeInMainWorld("overlayApi", overlayApi);
