import { Toaster } from "@/components/ui/sonner";
import { useContentHeightReport } from "@/hooks/overlay/use-content-height-report";
import { useToastListener } from "@/hooks/overlay/use-toast-listener";

const TOAST_OFFSET = 16; // sonner's mobile offset, which applies because the overlay view is narrower than 600px

export function ToastHost() {
  useToastListener();
  useContentHeightReport(TOAST_OFFSET);

  return (
    <Toaster
      mobileOffset={TOAST_OFFSET}
      offset={TOAST_OFFSET}
      position="top-right"
    />
  );
}
