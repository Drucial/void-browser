const COMMAND_KEY = navigator.userAgent.includes("Macintosh") ? "⌘" : "Ctrl";

export const PALETTE_KEY_HINTS = [
  { label: "Open", keys: ["↵"] },
  { label: "New tab", keys: [COMMAND_KEY, "↵"] },
  { label: "Close", keys: ["Esc"] },
];
