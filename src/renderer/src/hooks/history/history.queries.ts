import { queryOptions } from "@tanstack/react-query";

export const HISTORY_QUERY_KEY = ["history"] as const;

const HISTORY_SEARCH_MAX_LENGTH = 500; // main rejects longer queries

export const historyQueries = {
  search: (query: string) => {
    const trimmed = query.trim();

    return queryOptions({
      queryKey: [...HISTORY_QUERY_KEY, "search", trimmed],
      queryFn: () => window.api.searchHistory(trimmed),
      enabled: trimmed.length <= HISTORY_SEARCH_MAX_LENGTH,
      staleTime: 30_000,
    });
  },
};
