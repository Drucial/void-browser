import type { HistoryEntry } from "@shared/ipc";

type PaletteListInput = {
  query: string;
  initialQuery: string;
  results: HistoryEntry[];
  isSettled: boolean;
};

type PaletteList = {
  results: HistoryEntry[];
  isShown: boolean;
  hasBody: boolean;
  hasNoMatches: boolean;
};

/** Hides the list while a prefilled query is untouched; reports no matches only after the user edits and the search settles empty; `hasBody` is whether the list area has anything to hold. */
export function getPaletteList({
  query,
  initialQuery,
  results,
  isSettled,
}: PaletteListInput): PaletteList {
  const isPrefilledUntouched = initialQuery !== "" && query === initialQuery;
  const hasEdited = query !== initialQuery;

  if (isPrefilledUntouched) {
    return { results: [], isShown: false, hasBody: false, hasNoMatches: false };
  }

  const hasNoMatches = hasEdited && isSettled && results.length === 0;
  const isLoading = hasEdited && !isSettled;

  return {
    results,
    isShown: true,
    hasBody: results.length > 0 || hasNoMatches || isLoading,
    hasNoMatches,
  };
}
