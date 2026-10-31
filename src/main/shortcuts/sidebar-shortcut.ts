import type { WebContents } from "electron";

import type { KeyInput } from "./command-chord";
import { getCommandChordKey } from "./command-chord";

const SIDEBAR_TOGGLE_KEY = "b";

/** Returns whether a key event asks to toggle the sidebar: Ctrl+B, or Cmd+B on macOS. */
export function isSidebarToggle(input: KeyInput, platform: NodeJS.Platform) {
  return getCommandChordKey(input, platform) === SIDEBAR_TOGGLE_KEY;
}

/** Runs `toggleSidebar` when `contents` receives the sidebar shortcut, before the page sees it; passes every key through while `isEnabled` returns false. */
export function watchSidebarShortcut(
  contents: WebContents,
  toggleSidebar: () => void,
  isEnabled: () => boolean = () => true
) {
  contents.on("before-input-event", (event, input) => {
    if (!isEnabled() || !isSidebarToggle(input, process.platform)) return;

    event.preventDefault();
    toggleSidebar();
  });
}
