import type { Input, WebContents } from "electron";

import type { PaletteIntent } from "../../shared/ipc";

type KeyInput = Pick<
  Input,
  "type" | "key" | "control" | "meta" | "alt" | "shift"
>;

/** Maps a key event to the palette intent it asks for: Ctrl/Cmd+T opens empty, Ctrl/Cmd+L opens on `currentUrl`. */
export function getPaletteIntent(
  input: KeyInput,
  currentUrl: string,
  platform: NodeJS.Platform
): PaletteIntent | null {
  const hasCommandModifier = platform === "darwin" ? input.meta : input.control;
  if (input.type !== "keyDown" || !hasCommandModifier) return null;
  if (input.alt || input.shift) return null;

  const key = input.key.toLowerCase();
  if (key === "t") return { query: "" };
  if (key === "l") return { query: currentUrl };

  return null;
}

/** Opens the palette when `contents` receives a palette shortcut, before the page sees it. */
export function watchPaletteShortcut(
  contents: WebContents,
  getCurrentUrl: () => string,
  openPalette: (query: string) => void
) {
  contents.on("before-input-event", (event, input) => {
    const intent = getPaletteIntent(input, getCurrentUrl(), process.platform);
    if (!intent) return;

    event.preventDefault();
    openPalette(intent.query);
  });
}
