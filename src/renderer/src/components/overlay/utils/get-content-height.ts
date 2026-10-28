/** Returns the height that contains every rect's bottom edge plus `padding`, rounded up; zero when there are no rects. */
export function getContentHeight(
  rects: { bottom: number }[],
  padding: number
): number {
  if (rects.length === 0) return 0;

  return Math.ceil(Math.max(...rects.map((rect) => rect.bottom))) + padding;
}
