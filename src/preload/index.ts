import { contextBridge, ipcRenderer } from "electron";

import type { AppApi, InvokeContract, SendContract } from "../shared/ipc";

function invoke<Channel extends keyof InvokeContract>(
  channel: Channel,
  input?: InvokeContract[Channel]["input"]
): Promise<InvokeContract[Channel]["output"]> {
  return ipcRenderer.invoke(channel, input);
}

function send<Channel extends keyof SendContract>(
  channel: Channel,
  payload: SendContract[Channel]
) {
  ipcRenderer.send(channel, payload);
}

const api: AppApi = {
  listTabs: () => invoke("tabs:list"),
  createTab: (url) => invoke("tabs:create", url),
  closeTab: (id) => invoke("tabs:close", id),
  activateTab: (id) => invoke("tabs:activate", id),
  navigateActiveTab: (url) => invoke("tabs:navigate", url),
  setViewBounds: (bounds) => send("view:set-bounds", bounds),
  onTabsChanged: (listener) => {
    const handle = () => listener();
    ipcRenderer.on("tabs:changed", handle);

    return () => ipcRenderer.removeListener("tabs:changed", handle);
  },
};

contextBridge.exposeInMainWorld("api", api);
