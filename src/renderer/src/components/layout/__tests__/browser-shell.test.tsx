import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { BrowserShell } from "@/components/layout/browser-shell";
import { SAMPLE_TABS } from "@/components/layout/constants/sample-tabs";

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
});

describe("BrowserShell", () => {
  it("shows the first tab as active with its url in the address bar", () => {
    render(<BrowserShell />);

    const [first] = SAMPLE_TABS;
    const activeButton = screen.getByRole("button", { name: first!.title });

    expect(activeButton).toHaveAttribute("data-active", "true");
    expect(screen.getByLabelText("Address bar")).toHaveValue(first!.url);
  });

  it("activates a clicked tab and shows its url", () => {
    render(<BrowserShell />);

    const second = SAMPLE_TABS[1]!;

    fireEvent.click(screen.getByRole("button", { name: second.title }));

    expect(screen.getByRole("button", { name: second.title })).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(screen.getByLabelText("Address bar")).toHaveValue(second.url);
  });
});
