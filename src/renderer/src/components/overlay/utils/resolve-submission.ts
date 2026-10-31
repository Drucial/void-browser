import type { HistoryEntry, NavigateRequest } from "@shared/ipc";

type Submission = {
  query: string;
  results: HistoryEntry[];
  highlightedUrl: string;
  isNewTab: boolean;
};

/** Picks what Enter navigates to: the highlighted result if listed, else the first result, else the typed text; null when there is neither. */
export function resolveSubmission({
  query,
  results,
  highlightedUrl,
  isNewTab,
}: Submission): NavigateRequest | null {
  const highlighted =
    results.find((entry) => entry.url === highlightedUrl) ?? results[0];
  const url = highlighted?.url ?? query.trim();

  return url ? { url, newTab: isNewTab } : null;
}
