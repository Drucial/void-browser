const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;
const ALLOWED_PROTOCOLS = ["http:", "https:"];

/** Returns an http(s) URL for address-bar input, defaulting a missing scheme to https; null if it is not one. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const withScheme = EXPLICIT_SCHEME.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);

    return ALLOWED_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
