const LIGHT_BACKGROUND = "#ffffff"; // must mirror --background in globals.css (oklch(1 0 0))
const DARK_BACKGROUND = "#0a0a0a"; // must mirror .dark --background in globals.css (oklch(0.145 0 0))

export function getBackgroundColor(isDark: boolean) {
  return isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND;
}
