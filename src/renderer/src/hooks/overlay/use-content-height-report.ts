import { useEffect } from "react";

import { getContentHeight } from "@/components/overlay/utils/get-content-height";

const TOAST_SELECTOR = "[data-sonner-toast]";

function getLayoutBottom(toast: HTMLElement) {
  const container = toast.offsetParent?.getBoundingClientRect().top ?? 0;

  return container + toast.offsetTop + toast.offsetHeight;
}

/** Reports the toast stack's height to main whenever it changes, so main can fit the overlay view to it. */
export function useContentHeightReport(padding: number) {
  useEffect(() => {
    let frame = 0;
    let reported: number | null = null;

    const report = () => {
      const bottoms = [
        ...document.querySelectorAll<HTMLElement>(TOAST_SELECTOR),
      ].map(getLayoutBottom);
      const height = getContentHeight(bottoms, padding);
      if (height === reported) return;

      reported = height;
      window.overlayApi.reportContentHeight(height);
    };

    const scheduleReport = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(report);
    };

    const resizeObserver = new ResizeObserver(scheduleReport);
    const observeToasts = () => {
      resizeObserver.disconnect();
      document
        .querySelectorAll(TOAST_SELECTOR)
        .forEach((toast) => resizeObserver.observe(toast));
      scheduleReport();
    };

    const mutationObserver = new MutationObserver(observeToasts);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [padding]);
}
