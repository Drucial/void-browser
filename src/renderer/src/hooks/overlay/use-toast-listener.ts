import { useEffect } from "react";

import { toast } from "sonner";

export function useToastListener() {
  useEffect(
    () =>
      window.overlayApi.onToast(({ kind, message }) => {
        if (kind === "success") toast.success(message);
        else toast.error(message);
      }),
    []
  );
}
