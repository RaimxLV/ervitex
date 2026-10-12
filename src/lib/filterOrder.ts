/** Saved order wins; values missing from the saved order keep their default order after it. */
export function applyOrder<T>(list: T[], order: string[] | undefined, keyOf: (x: T) => string): T[] {
  if (!order || order.length === 0) return list;
  const rank = new Map(order.map((k, i) => [k, i]));
  return list
    .map((x, i) => ({ x, i, r: rank.get(keyOf(x)) }))
    .sort((a, b) => {
      if (a.r !== undefined && b.r !== undefined) return a.r - b.r;
      if (a.r !== undefined) return -1;
      if (b.r !== undefined) return 1;
      return a.i - b.i;
    })
    .map((e) => e.x);
}

export const SECTIONS_ORDER_KEY = "__sections";
