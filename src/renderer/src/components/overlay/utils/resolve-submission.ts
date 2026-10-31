import type { HistoryEntry, NavigateRequest } from "@shared/ipc";

type Submission = {
  query: string;
  results: HistoryEntry[];
  highlightedUrl: string;
  hasMovedHighlight: boolean;
  isNewTab: boolean;
};

/** Picks what Enter navigates to: the history result the user arrowed to, else the first result on a blank query, else the typed text for main to resolve; null when there is neither. */
export function resolveSubmission({
  query,
  results,
  highlightedUrl,
  hasMovedHighlight,
  isNewTab,
}: Submission): NavigateRequest | null {
  const text = query.trim();
  const chosen = hasMovedHighlight
    ? results.find((entry) => entry.url === highlightedUrl)
    : text
      ? undefined
      : results[0];
  const url = chosen?.url ?? text;

  return url ? { url, newTab: isNewTab } : null;
}
