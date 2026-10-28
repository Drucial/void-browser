import type { AppApi, Tab } from "@shared/ipc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { BrowserShell } from "@/components/layout/browser-shell";

const TABS: Tab[] = [
  { id: 1, title: "Electron", url: "https://www.electronjs.org/", position: 0 },
  { id: 2, title: "shadcn/ui", url: "https://ui.shadcn.com/", position: 1 },
];

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

class StubResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installApi() {
  let activeId = 1;
  const listeners = new Set<() => void>();
  const navigateActiveTab = vi.fn<AppApi["navigateActiveTab"]>(() =>
    Promise.resolve()
  );

  const api: AppApi = {
    listTabs: () => Promise.resolve({ tabs: TABS, activeId }),
    createTab: () => Promise.resolve(),
    closeTab: () => Promise.resolve(),
    activateTab: (id) => {
      activeId = id;
      listeners.forEach((listener) => listener());

      return Promise.resolve();
    },
    navigateActiveTab,
    setViewBounds: () => {},
    onTabsChanged: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };

  window.api = api;

  return { navigateActiveTab };
}

function renderShell() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <BrowserShell />
    </QueryClientProvider>
  );
}

beforeAll(() => {
  window.matchMedia = createMediaQueryList;
  window.ResizeObserver = StubResizeObserver;
});

describe("BrowserShell", () => {
  let navigateActiveTab: ReturnType<typeof installApi>["navigateActiveTab"];

  beforeEach(() => {
    ({ navigateActiveTab } = installApi());
  });

  it("shows the active tab with its url in the address bar", async () => {
    renderShell();

    const activeButton = await screen.findByRole("button", {
      name: "Electron",
    });

    expect(activeButton).toHaveAttribute("data-active", "true");
    expect(screen.getByLabelText("Address bar")).toHaveValue(TABS[0]?.url);
  });

  it("follows main's active tab when a tab is selected", async () => {
    renderShell();

    fireEvent.click(await screen.findByRole("button", { name: "shadcn/ui" }));

    expect(
      await screen.findByDisplayValue("https://ui.shadcn.com/")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "shadcn/ui" })).toHaveAttribute(
      "data-active",
      "true"
    );
  });

  it("sends the typed address to navigate the active tab", async () => {
    renderShell();

    const input = await screen.findByLabelText("Address bar");
    fireEvent.change(input, { target: { value: "example.com" } });
    fireEvent.submit(input);

    await waitFor(() =>
      expect(navigateActiveTab).toHaveBeenCalledWith("example.com")
    );
  });
});
