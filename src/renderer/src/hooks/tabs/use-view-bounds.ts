import { useEffect, useRef } from "react";

/** Returns a ref for the element whose on-screen rect the main process fills with the active tab view. */
export function useViewBounds() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const sendBounds = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        window.api.setViewBounds({
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      });
    };

    const observer = new ResizeObserver(sendBounds);
    observer.observe(element);
    sendBounds();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
