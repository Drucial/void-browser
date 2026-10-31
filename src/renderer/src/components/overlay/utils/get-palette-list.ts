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
  hasNoMatches: boolean;
};

/** Hides the list while a prefilled query is untouched; reports no matches only after the user edits and the search settles empty. */
export function getPaletteList({
  query,
  initialQuery,
  results,
  isSettled,
}: PaletteListInput): PaletteList {
  const isPrefilledUntouched = initialQuery !== "" && query === initialQuery;
  const hasEdited = query !== initialQuery;

  if (isPrefilledUntouched) {
    return { results: [], isShown: false, hasNoMatches: false };
  }

  return {
    results,
    isShown: true,
    hasNoMatches: hasEdited && isSettled && results.length === 0,
  };
}
