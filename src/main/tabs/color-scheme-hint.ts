const HEADER_NAME = "Sec-CH-Prefers-Color-Scheme";

/** Returns `headers` with the prefers-color-scheme client hint set for `isDark`. */
export function withColorSchemeHint(
  headers: Record<string, string>,
  isDark: boolean
) {
  return { ...headers, [HEADER_NAME]: isDark ? "dark" : "light" };
}
