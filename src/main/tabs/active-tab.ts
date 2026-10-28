/** Returns the tab to activate after `closedId` closes: the active one if it survives, else the neighbour that takes its place, else null. */
export function pickActiveAfterClose(
  orderedIds: number[],
  closedId: number,
  activeId: number | null
): number | null {
  const remaining = orderedIds.filter((id) => id !== closedId);
  if (activeId !== closedId) return activeId;

  const closedIndex = orderedIds.indexOf(closedId);

  return remaining[Math.min(closedIndex, remaining.length - 1)] ?? null;
}
