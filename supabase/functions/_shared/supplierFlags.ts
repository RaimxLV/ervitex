// Pure helpers shared by supplier syncs (no Deno/Node APIs, unit-tested).

/** Malfini /product/prices row (official v4 ProductPriceExternalDto). */
export type MalfiniPriceRow = { productSizeCode?: string | null; limit?: number | null; price?: number | null; currency?: string | null };

/**
 * One standard unit price per SKU: only the quantity=1 tier (`limit` = minimum pieces).
 * Quantity-tier prices are never used. Conflicting single-piece prices => SKU left unpriced.
 */
export function malfiniUnitPrices(rows: MalfiniPriceRow[]): Map<string, { price: number; currency: string }> {
  const seen = new Map<string, { price: number; currency: string } | null>();
  for (const r of rows) {
    const sku = (r.productSizeCode ?? "").trim();
    const price = Number(r.price);
    if (!sku || Number(r.limit) !== 1 || !Number.isFinite(price) || price <= 0) continue;
    const prev = seen.get(sku);
    if (prev === undefined) seen.set(sku, { price, currency: r.currency || "EUR" });
    else if (prev && prev.price !== price) seen.set(sku, null);
  }
  const out = new Map<string, { price: number; currency: string }>();
  for (const [k, v] of seen) if (v) out.set(k, v);
  return out;
}

/** Malfini marks clearance models with category OUTLET (name or code). */
export const isMalfiniOutlet = (p: { categoryName?: unknown; categoryCode?: unknown }) =>
  String(p.categoryName ?? "").trim().toUpperCase() === "OUTLET" ||
  String(p.categoryCode ?? "").trim().toUpperCase() === "OUTLET";

/** UTT Data Export `outlet`: integer 0/1 (observed). Anything else aborts the sync instead of silently publishing. */
export function parseUttOutlet(v: unknown, sku: string): boolean {
  if (v === 1 || v === "1") return true;
  if (v === 0 || v === "0") return false;
  throw new Error(`UTT outlet flag unrecognised for ${sku}: ${JSON.stringify(v)}`);
}
