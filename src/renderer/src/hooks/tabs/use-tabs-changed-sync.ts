import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { tabQueries } from "./tabs.queries";

export function useTabsChangedSync() {
  const queryClient = useQueryClient();

  useEffect(
    () =>
      window.api.onTabsChanged(() => {
        queryClient.invalidateQueries(tabQueries.all());
      }),
    [queryClient]
  );
}
