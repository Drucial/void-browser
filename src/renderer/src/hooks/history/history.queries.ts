import { queryOptions } from "@tanstack/react-query";

export const HISTORY_QUERY_KEY = ["history"] as const;

export const historyQueries = {
  search: (query: string) => {
    const normalized = query.trim().toLowerCase();

    return queryOptions({
      queryKey: [...HISTORY_QUERY_KEY, "search", normalized],
      queryFn: () => window.api.searchHistory(normalized),
      staleTime: 30_000,
    });
  },
};
