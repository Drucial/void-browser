import type { AppApi, OverlayApi } from "@shared/ipc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CommandPalette } from "@/components/overlay/command-palette";

const ENTRIES = [{ id: 1, url: "https://example.com/", title: "Example" }];

class StubResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const IDLE_API: AppApi = {
  listTabs: () => Promise.resolve({ tabs: [], activeId: null }),
  createTab: () => Promise.resolve(),
  closeTab: () => Promise.resolve(),
  activateTab: () => Promise.resolve(),
  searchHistory: () => Promise.resolve({ entries: [] }),
  getTheme: () => Promise.resolve({ preference: "system", isDark: false }),
  setTheme: () => Promise.resolve(),
  setViewBounds: () => {},
  showToast: () => {},
  openPalette: () => {},
  reportSidebarOpen: () => {},
  reportGutterHover: () => {},
  onTabsChanged: () => () => {},
  onThemeChanged: () => () => {},
  onToggleSidebar: () => () => {},
};

const IDLE_OVERLAY_API: OverlayApi = {
  reportContentHeight: () => {},
  navigate: () => Promise.resolve(),
  close: () => {},
  onOpen: () => () => {},
  onToast: () => () => {},
  onPeek: () => () => {},
  reportPanelHover: () => {},
  dismissPeek: () => {},
  confirmPeekExit: () => {},
  toggleSidebar: () => {},
};

function renderPalette(initialQuery: string) {
  const searchHistory = vi.fn<AppApi["searchHistory"]>(() =>
    Promise.resolve({ entries: ENTRIES })
  );
  window.api = {
    ...IDLE_API,
    searchHistory,
  };
  window.overlayApi = IDLE_OVERLAY_API;

  render(
    <QueryClientProvider client={new QueryClient()}>
      <CommandPalette
        initialQuery={initialQuery}
        onDismiss={() => {}}
        onNavigated={() => {}}
      />
    </QueryClientProvider>
  );

  return {
    searchHistory,
    type: (text: string) =>
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: text },
      }),
  };
}

describe("CommandPalette action row", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", StubResizeObserver);
    Element.prototype.scrollIntoView = () => {};
  });

  it("is present on the first frame of every keystroke with the right kind", () => {
    const { type } = renderPalette("");

    type("e");
    expect(screen.getByText("Search DuckDuckGo for “e”")).toBeInTheDocument();
    type("example.co");
    expect(screen.getByText("Go to example.co")).toBeInTheDocument();
    type("example");
    expect(
      screen.getByText("Search DuckDuckGo for “example”")
    ).toBeInTheDocument();
    type("");
    expect(screen.queryByText(/DuckDuckGo|Go to/)).not.toBeInTheDocument();
  });

  it("shows no action row and no history search for an untouched prefill", () => {
    const { searchHistory, type } = renderPalette("https://old.dev/");

    expect(screen.queryByText(/Go to/)).not.toBeInTheDocument();
    expect(searchHistory).toHaveBeenCalledWith("");
    type("x");
    expect(screen.getByText("Search DuckDuckGo for “x”")).toBeInTheDocument();
    expect(searchHistory).not.toHaveBeenCalledWith("https://old.dev/");
    expect(searchHistory).not.toHaveBeenCalledWith("x");
  });
});
