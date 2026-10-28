import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AppMutationOptions<Variables> = {
  mutationFn: (variables: Variables) => Promise<unknown>;
  successMessage?: string;
  errorMessage?: string;
  invalidates?: { queryKey: QueryKey }[];
};

/** Runs `mutationFn`, reports the outcome as a toast and invalidates the queries given as factory results. */
export function useAppMutation<Variables = void>({
  mutationFn,
  successMessage,
  errorMessage = "Something went wrong",
  invalidates = [],
}: AppMutationOptions<Variables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      if (successMessage)
        window.api.showToast({ kind: "success", message: successMessage });
      await Promise.all(
        invalidates.map(({ queryKey }) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
    },
    onError: () => {
      window.api.showToast({ kind: "error", message: errorMessage });
    },
  });
}
