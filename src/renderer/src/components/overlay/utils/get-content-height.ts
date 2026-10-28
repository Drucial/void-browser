/** Returns the height that contains every bottom edge plus `padding`, rounded up; zero when there are no bottoms. */
export function getContentHeight(bottoms: number[], padding: number): number {
  if (bottoms.length === 0) return 0;

  return Math.ceil(Math.max(...bottoms)) + padding;
}
