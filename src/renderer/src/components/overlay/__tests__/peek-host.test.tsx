import type { OverlayApi } from "@shared/ipc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PeekHost } from "@/components/overlay/peek-host";

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

function installApis() {
  const peekListeners = new Set<(isOpen: boolean) => void>();
  const confirmPeekExit = vi.fn<OverlayApi["confirmPeekExit"]>();
  const dismissPeek = vi.fn<OverlayApi["dismissPeek"]>();

  window.api = {
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
  window.overlayApi = {
    reportContentHeight: () => {},
    navigate: () => Promise.resolve(),
    close: () => {},
    onOpen: () => () => {},
    onToast: () => () => {},
    onPeek: (listener) => {
      peekListeners.add(listener);

      return () => peekListeners.delete(listener);
    },
    reportPanelHover: () => {},
    confirmPeekExit,
    dismissPeek,
    toggleSidebar: () => {},
  };

  return {
    confirmPeekExit,
    dismissPeek,
    setPeek: (isOpen: boolean) =>
      act(() => peekListeners.forEach((listener) => listener(isOpen))),
  };
}

describe("PeekHost", () => {
  beforeAll(() => {
    window.matchMedia = createMediaQueryList;
  });

  it("confirms the exit only once the slide-out transition ends", () => {
    const { setPeek, confirmPeekExit } = installApis();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PeekHost />
      </QueryClientProvider>
    );
    const panel = screen.getByRole("navigation", { hidden: true });

    setPeek(true);
    fireEvent.transitionEnd(panel);

    expect(confirmPeekExit).not.toHaveBeenCalled();

    setPeek(false);

    expect(confirmPeekExit).not.toHaveBeenCalled();

    fireEvent.transitionEnd(panel);

    expect(confirmPeekExit).toHaveBeenCalledOnce();
  });

  it("asks main to dismiss on Escape only while open", () => {
    const { setPeek, dismissPeek } = installApis();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PeekHost />
      </QueryClientProvider>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(dismissPeek).not.toHaveBeenCalled();

    setPeek(true);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(dismissPeek).toHaveBeenCalledOnce();
  });
});
