import type { TransitionEvent } from "react";
import { useEffect, useState } from "react";

/** Tracks whether main wants the floating nav open, reports hover over it, and confirms its slide-out to main. */
export function usePeekSession() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => window.overlayApi.onPeek(setIsOpen), []);

  useEffect(() => {
    if (!isOpen) return;

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.overlayApi.dismissPeek();
    };
    document.addEventListener("keydown", dismissOnEscape);

    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [isOpen]);

  return {
    isOpen,
    reportHover: window.overlayApi.reportPanelHover,
    confirmExit: (event: TransitionEvent<HTMLElement>) => {
      if (!isOpen && event.target === event.currentTarget) {
        window.overlayApi.confirmPeekExit();
      }
    },
  };
}
