import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { BrowserShell } from "@/components/layout/browser-shell";
import { SAMPLE_TABS } from "@/components/layout/constants/sample-tabs";

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
}

beforeAll(() => {
  window.matchMedia = createMediaQueryList;
});

function getSampleTabs() {
  const [first, second] = SAMPLE_TABS;
  if (!first || !second) throw new Error("Expected at least two sample tabs");

  return { first, second };
}

describe("BrowserShell", () => {
  it("shows the first tab as active with its url in the address bar", () => {
    render(<BrowserShell />);

    const { first } = getSampleTabs();
    const activeButton = screen.getByRole("button", { name: first.title });

    expect(activeButton).toHaveAttribute("data-active", "true");
    expect(screen.getByLabelText("Address bar")).toHaveValue(first.url);
  });

  it("activates a clicked tab and shows its url", () => {
    render(<BrowserShell />);

    const { second } = getSampleTabs();

    fireEvent.click(screen.getByRole("button", { name: second.title }));

    expect(screen.getByRole("button", { name: second.title })).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(screen.getByLabelText("Address bar")).toHaveValue(second.url);
  });
});
