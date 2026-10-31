import type { WebContents } from "electron";

const BUTTON_DOWN_MODIFIERS = new Set([
  "leftbuttondown",
  "middlebuttondown",
  "rightbuttondown",
]);

/** Reports whether any mouse button is held across `contents`' mouse events; a move that carries no button modifier clears a missed release. */
export function watchPressedButtons(
  contents: WebContents,
  onChange: (isPressed: boolean) => void
) {
  contents.on("before-mouse-event", (_event, mouse) => {
    if (mouse.type === "mouseDown") onChange(true);
    else if (mouse.type === "mouseUp") onChange(false);
    else if (
      mouse.type === "mouseMove" &&
      !mouse.modifiers?.some((modifier) => BUTTON_DOWN_MODIFIERS.has(modifier))
    )
      onChange(false);
  });
}
