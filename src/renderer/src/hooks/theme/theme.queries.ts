import { queryOptions } from "@tanstack/react-query";

export const themeQueries = {
  current: () =>
    queryOptions({
      queryKey: ["theme"],
      queryFn: () => window.api.getTheme(),
      staleTime: Infinity,
    }),
};
