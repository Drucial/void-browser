// Pure address-bar parsing shared by main and renderer; keep it free of Node and Electron imports.

export type AddressAction = { kind: "url" | "search"; url: string };

const SEARCH_URL = "https://duckduckgo.com/?q=";

export const SEARCH_ENGINE_NAME = "DuckDuckGo"; // names the engine behind SEARCH_URL

const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;
const ALLOWED_PROTOCOLS = ["http:", "https:"];
const SCHEME_WITHOUT_SLASHES = /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i;
const IPV4_AUTHORITY = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
const WORD_TLD = /^(?:[a-z]{2,}|xn--[a-z\d-]+)$/;

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

function isBareAddress(text: string): boolean {
  if (/\s/.test(text)) return false;

  try {
    const { hostname } = new URL(`https://${text}`);
    const authority = text.split(/[/?#]/)[0] ?? "";
    const tld = hostname.split(".").at(-1) ?? "";

    return (
      hostname === "localhost" ||
      hostname.startsWith("[") ||
      IPV4_AUTHORITY.test(authority) ||
      (hostname.includes(".") && WORD_TLD.test(tld))
    );
  } catch {
    return false;
  }
}

/** Classifies typed address-bar text as a URL to load or a web search, with the http(s) URL to load; null for blank text or a non-http(s) scheme. */
export function resolveAddressInput(input: string): AddressAction | null {
  const text = input.trim();
  if (!text) return null;

  if (EXPLICIT_SCHEME.test(text)) {
    const url = normalizeUrl(text);

    return url ? { kind: "url", url } : null;
  }
  if (SCHEME_WITHOUT_SLASHES.test(text)) return null;

  if (isBareAddress(text)) {
    const url = normalizeUrl(text);

    return url ? { kind: "url", url } : null;
  }

  return { kind: "search", url: `${SEARCH_URL}${encodeURIComponent(text)}` };
}
