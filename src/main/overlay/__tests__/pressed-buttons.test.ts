import { EventEmitter } from "node:events";

import type { WebContents } from "electron";
import { describe, expect, it, vi } from "vitest";

import { watchPressedButtons } from "../pressed-buttons";

function watch() {
  const contents = new EventEmitter();
  const onChange = vi.fn();
  watchPressedButtons(contents as unknown as WebContents, onChange);
  const send = (type: string, modifiers: string[] = []) =>
    contents.emit("before-mouse-event", {}, { type, modifiers });

  return { onChange, send };
}

describe("watch pressed buttons", () => {
  it("is pressed from mouse down until mouse up", () => {
    const { onChange, send } = watch();
    send("mouseDown");
    send("mouseUp");

    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  it("clears a missed release on a move with no button held", () => {
    const { onChange, send } = watch();
    send("mouseDown");
    send("mouseMove", ["leftbuttondown"]);

    expect(onChange).toHaveBeenLastCalledWith(true);

    send("mouseMove");

    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
