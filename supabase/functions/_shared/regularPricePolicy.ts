/** Narrow MF policy: skipping is no write, never null/delete or another SKU's price.
 * Non-promo uses existing documented semantics, not a new price certificate. */
export function malfiniPriceWrite(sku: string, promotional: boolean,
  unit: { price: number; currency: string } | undefined,
  suggested: { price: number; currency: string } | undefined) {
  if (promotional || !unit || !Number.isFinite(unit.price) || unit.price <= 0) return null;
  return { sku, wholesale_price: unit.price,
    retail_price: Number((unit.price * 1.75).toFixed(4)),
    suggested_retail_price: suggested?.price ?? null,
    currency: unit.currency || suggested?.currency || "EUR" };
}