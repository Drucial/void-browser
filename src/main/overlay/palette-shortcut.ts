import type { WebContents } from "electron";

import type { PaletteIntent } from "../../shared/ipc";
import type { KeyInput } from "../shortcuts/command-chord";
import { getCommandChordKey } from "../shortcuts/command-chord";

/** Maps a key event to the palette intent it asks for: Ctrl/Cmd+T opens empty, Ctrl/Cmd+L opens on `currentUrl`. */
export function getPaletteIntent(
  input: KeyInput,
  currentUrl: string,
  platform: NodeJS.Platform
): PaletteIntent | null {
  const key = getCommandChordKey(input, platform);
  if (key === "t") return { query: "" };
  if (key === "l") return { query: currentUrl };

  return null;
}

/** Opens the palette when `contents` receives a palette shortcut, before the page sees it; passes every key through while `isEnabled` returns false. */
export function watchPaletteShortcut(
  contents: WebContents,
  getCurrentUrl: () => string,
  openPalette: (query: string) => void,
  isEnabled: () => boolean = () => true
) {
  contents.on("before-input-event", (event, input) => {
    if (!isEnabled()) return;

    const intent = getPaletteIntent(input, getCurrentUrl(), process.platform);
    if (!intent) return;

    event.preventDefault();
    openPalette(intent.query);
  });
}
