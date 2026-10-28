import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { themeQueries } from "./theme.queries";

export function useThemeChangedSync() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      window.api.onThemeChanged(() => {
        queryClient.invalidateQueries(themeQueries.current());
      }),
    [queryClient]
  );
}
