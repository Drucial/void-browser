import type { Input } from "electron";

export type KeyInput = Pick<
  Input,
  "type" | "key" | "control" | "meta" | "alt" | "shift"
>;

/** Returns the lowercased key of a plain Ctrl+key (Cmd+key on macOS) press, or null for anything else. */
export function getCommandChordKey(
  input: KeyInput,
  platform: NodeJS.Platform
): string | null {
  const hasCommandModifier = platform === "darwin" ? input.meta : input.control;
  if (input.type !== "keyDown" || !hasCommandModifier) return null;
  if (input.alt || input.shift) return null;

  return input.key.toLowerCase();
}
