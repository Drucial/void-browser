import { getBackgroundColor } from "./background-color";

const CLEAR_BACKGROUND = "#00000000";

/** Only Linux is verified to blur the desktop behind a transparent window; other platforms keep an opaque window. */
export function getWindowBackground(isDark: boolean, platform: string) {
  const isTransparent = platform === "linux";

  return {
    transparent: isTransparent,
    backgroundColor: isTransparent
      ? CLEAR_BACKGROUND
      : getBackgroundColor(isDark),
  };
}
