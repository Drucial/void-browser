import type { AppApi, ThemeState } from "@shared/ipc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/layout/theme-provider";

describe("ThemeProvider", () => {
  it("follows the theme main reports, including later changes", async () => {
    let state: ThemeState = { preference: "system", isDark: true };
    let notifyChanged = () => {};
    const api: Pick<AppApi, "getTheme" | "onThemeChanged"> = {
      getTheme: () => Promise.resolve(state),
      onThemeChanged: (listener) => {
        notifyChanged = listener;

        return () => {};
      },
    };
    window.api = { ...window.api, ...api };

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider>{null}</ThemeProvider>
      </QueryClientProvider>
    );
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));

    state = { preference: "light", isDark: false };
    act(() => notifyChanged());

    await waitFor(() =>
      expect(document.documentElement).not.toHaveClass("dark")
    );
  });
});
