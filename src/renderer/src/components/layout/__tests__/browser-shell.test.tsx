import type { AppApi, Tab } from "@shared/ipc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  const openPalette = vi.fn<AppApi["openPalette"]>();
  const toggleListeners = new Set<() => void>();

  const api: AppApi = {
    listTabs: () => Promise.resolve({ tabs: TABS, activeId }),
    createTab: () => Promise.resolve(),
    closeTab: () => Promise.resolve(),
    activateTab: (id) => {
      activeId = id;
      listeners.forEach((listener) => listener());

      return Promise.resolve();
    },
    searchHistory: () => Promise.resolve({ entries: [] }),
    getTheme: () => Promise.resolve({ preference: "system", isDark: false }),
    setTheme: () => Promise.resolve(),
    setViewBounds: () => {},
    showToast: () => {},
    openPalette,
    reportSidebarOpen: () => {},
    reportGutterHover: () => {},
    onTabsChanged: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    onThemeChanged: () => () => {},
    onToggleSidebar: (listener) => {
      toggleListeners.add(listener);

      return () => toggleListeners.delete(listener);
    },
  };

  window.api = api;

  return {
    openPalette,
    relaySidebarToggle: () => toggleListeners.forEach((listener) => listener()),
  };
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
  let openPalette: ReturnType<typeof installApi>["openPalette"];
  let relaySidebarToggle: ReturnType<typeof installApi>["relaySidebarToggle"];

  beforeEach(() => {
    ({ openPalette, relaySidebarToggle } = installApi());
  });

  it("shows the active tab and its site in the address bar", async () => {
    renderShell();

    const activeButton = await screen.findByRole("button", {
      name: "Electron",
    });

    expect(activeButton).toHaveAttribute("data-active", "true");
    expect(
      screen.getByRole("button", { name: "Address bar" })
    ).toHaveTextContent("www.electronjs.org");
  });

  it("follows main's active tab when a tab is selected", async () => {
    renderShell();

    fireEvent.click(await screen.findByRole("button", { name: "shadcn/ui" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Address bar" })
      ).toHaveTextContent("ui.shadcn.com")
    );
    expect(screen.getByRole("button", { name: "shadcn/ui" })).toHaveAttribute(
      "data-active",
      "true"
    );
  });

  it("opens the palette from the address bar", async () => {
    renderShell();

    fireEvent.click(await screen.findByRole("button", { name: "Address bar" }));

    expect(openPalette).toHaveBeenCalledOnce();
  });

  it("collapses and expands the sidebar from its header toggle", async () => {
    renderShell();

    const sidebar = (
      await screen.findByRole("button", { name: "Electron" })
    ).closest("[data-slot='sidebar']");
    const toggle = screen.getByRole("button", { name: "Toggle Sidebar" });

    expect(sidebar).toHaveAttribute("data-state", "expanded");

    fireEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "collapsed");

    fireEvent.click(toggle);
    expect(sidebar).toHaveAttribute("data-state", "expanded");
  });

  it("toggles the sidebar when main relays the shortcut", async () => {
    renderShell();

    const sidebar = (
      await screen.findByRole("button", { name: "Electron" })
    ).closest("[data-slot='sidebar']");

    act(() => relaySidebarToggle());
    expect(sidebar).toHaveAttribute("data-state", "collapsed");

    act(() => relaySidebarToggle());
    expect(sidebar).toHaveAttribute("data-state", "expanded");
  });
});
