import { describe, expect, it } from "vitest";

import { isSidebarToggle } from "../sidebar-shortcut";

function keyDown(
  key: string,
  modifiers: Partial<Parameters<typeof isSidebarToggle>[0]> = {}
) {
  return {
    type: "keyDown",
    key,
    control: false,
    meta: false,
    alt: false,
    shift: false,
    ...modifiers,
  };
}

describe("isSidebarToggle", () => {
  it("matches Ctrl+B on Linux and Cmd+B on macOS only", () => {
    expect(isSidebarToggle(keyDown("b", { control: true }), "linux")).toBe(
      true
    );
    expect(isSidebarToggle(keyDown("B", { meta: true }), "darwin")).toBe(true);
    expect(isSidebarToggle(keyDown("b", { control: true }), "darwin")).toBe(
      false
    );
  });

  it("ignores other keys, releases and chords with Shift or Alt", () => {
    expect(isSidebarToggle(keyDown("t", { control: true }), "linux")).toBe(
      false
    );
    expect(
      isSidebarToggle(keyDown("b", { control: true, type: "keyUp" }), "linux")
    ).toBe(false);
    expect(
      isSidebarToggle(keyDown("b", { control: true, alt: true }), "linux")
    ).toBe(false);
  });
});
