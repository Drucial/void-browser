import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { historyQueries } from "@/hooks/history/history.queries";

type PaletteSession = { id: number; query: string };

/** Tracks the open palette; each open from main starts a fresh session and refreshes the recent list. */
export function usePaletteSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<PaletteSession | null>(null);

  useEffect(() => {
    void queryClient.prefetchQuery(historyQueries.search(""));
  }, [queryClient]);

  useEffect(
    () =>
      window.overlayApi.onOpen(({ query }) => {
        setSession((previous) => ({ id: (previous?.id ?? 0) + 1, query }));
        void queryClient.refetchQueries(historyQueries.search(""));
      }),
    [queryClient]
  );

  return {
    session,
    endSession: () => setSession(null),
    dismiss: () => {
      setSession(null);
      window.overlayApi.close();
    },
  };
}
