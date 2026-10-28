import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { HISTORY_QUERY_KEY } from "@/hooks/history/history.queries";

import { tabQueries } from "./tabs.queries";

export function useTabsChangedSync() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      window.api.onTabsChanged(() => {
        queryClient.invalidateQueries(tabQueries.all());
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
      }),
    [queryClient]
  );
}
