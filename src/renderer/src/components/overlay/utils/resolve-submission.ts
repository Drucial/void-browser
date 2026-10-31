import type { HistoryEntry, NavigateRequest } from "@shared/ipc";

type Submission = {
  query: string;
  results: HistoryEntry[];
  highlightedUrl: string;
  isNewTab: boolean;
  isKeepingPrefill: boolean;
};

/** Picks what Enter navigates to: the highlighted result if listed, else the first result, else the typed text; an untouched prefill always submits the typed text; null when there is neither. */
export function resolveSubmission({
  query,
  results,
  highlightedUrl,
  isNewTab,
  isKeepingPrefill,
}: Submission): NavigateRequest | null {
  const highlighted = isKeepingPrefill
    ? undefined
    : (results.find((entry) => entry.url === highlightedUrl) ?? results[0]);
  const url = highlighted?.url ?? query.trim();

  return url ? { url, newTab: isNewTab } : null;
}
