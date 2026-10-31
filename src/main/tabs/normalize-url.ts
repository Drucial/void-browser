import { normalizeUrl } from "../../shared/address-input";

/** True when `url` is an http(s) URL that may be loaded or persisted. */
export function isAllowedUrl(url: string): boolean {
  return normalizeUrl(url) !== null;
}
