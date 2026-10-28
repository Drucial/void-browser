import { queryOptions } from "@tanstack/react-query";

export const tabQueries = {
  all: () =>
    queryOptions({
      queryKey: ["tabs"],
      queryFn: () => window.api.listTabs(),
      staleTime: Infinity,
    }),
};
