export function nextId(items: readonly { id: number }[]): number {
  return items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;
}
