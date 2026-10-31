import { queryOptions } from "@tanstack/react-query";

export const HISTORY_QUERY_KEY = ["history"] as const;

const HISTORY_SEARCH_MAX_LENGTH = 500; // main rejects longer queries

export const historyQueries = {
  search: (query: string) => {
    const normalized = query.trim().toLowerCase();

    return queryOptions({
      queryKey: [...HISTORY_QUERY_KEY, "search", normalized],
      queryFn: () => window.api.searchHistory(normalized),
      enabled: normalized.length <= HISTORY_SEARCH_MAX_LENGTH,
      staleTime: 30_000,
    });
  },
};
