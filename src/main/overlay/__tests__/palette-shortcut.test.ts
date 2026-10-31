import { describe, expect, it } from "vitest";

import { getPaletteIntent } from "../palette-shortcut";

const URL = "https://example.com/";

function keyDown(
  key: string,
  modifiers: Partial<Parameters<typeof getPaletteIntent>[0]> = {}
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

describe("getPaletteIntent", () => {
  it("opens empty on Ctrl+T and on the current url on Ctrl+L", () => {
    expect(
      getPaletteIntent(keyDown("t", { control: true }), URL, "linux")
    ).toEqual({ query: "" });
    expect(
      getPaletteIntent(keyDown("L", { control: true }), URL, "linux")
    ).toEqual({ query: URL });
  });

  it("listens for Cmd on macOS and Ctrl elsewhere", () => {
    expect(
      getPaletteIntent(keyDown("t", { meta: true }), URL, "darwin")
    ).not.toBeNull();
    expect(
      getPaletteIntent(keyDown("t", { control: true }), URL, "darwin")
    ).toBeNull();
    expect(
      getPaletteIntent(keyDown("t", { meta: true }), URL, "linux")
    ).toBeNull();
  });

  it("ignores key releases and chords with Shift or Alt", () => {
    expect(
      getPaletteIntent(
        keyDown("t", { control: true, type: "keyUp" }),
        URL,
        "linux"
      )
    ).toBeNull();
    expect(
      getPaletteIntent(
        keyDown("t", { control: true, shift: true }),
        URL,
        "linux"
      )
    ).toBeNull();
  });
});
