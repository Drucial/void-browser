/** Returns the host of `url` for display, or `url` itself when it does not parse. */
export function getSiteLabel(url: string): string {
  try {
    return new URL(url).host || url;
  } catch {
    return url;
  }
}
