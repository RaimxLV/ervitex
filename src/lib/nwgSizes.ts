/** Size labels that NWG gives to more than one size code of the same colour (e.g. 649066: 4 and 5 = "S/M"). */
export function nwgDuplicateSizeLabels(rows: { item: string; code: string | null; label: string }[]): Set<string> {
  const codes = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.code || !r.label) continue;
    const k = `${r.item}\u0000${r.label}`;
    if (!codes.has(k)) codes.set(k, new Set());
    codes.get(k)!.add(r.code);
  }
  const out = new Set<string>();
  for (const [k, set] of codes) if (set.size > 1) out.add(k.split("\u0000")[1]);
  return out;
}

/** Price rows keyed by their own SKU size label, so a shared supplier name never picks another SKU's size. */
export function withSkuSizes<T extends { sku?: string | null; size?: string | null }>(rows: T[], skuSizes?: Record<string, string>): T[] {
  if (!skuSizes) return rows;
  return rows.map((r) => (r.sku && skuSizes[r.sku] ? { ...r, size: skuSizes[r.sku] } : r));
}
