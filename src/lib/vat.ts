/**
 * Shared VAT logic. Latvian VAT is 21%; all catalog retail_price values are
 * stored NET (without VAT) and the public price is net × 1.21.
 * Use grossFromNet everywhere a net price is shown or published, so the
 * conversion (and its rounding) exists exactly once.
 */
export const VAT_RATE_PERCENT = 21;
export const VAT_MULTIPLIER = 1 + VAT_RATE_PERCENT / 100; // 1.21

/** Net → gross, rounded to cents the same way the UI displays prices. */
export function grossFromNet(net: number): number {
  return Math.round((net * VAT_MULTIPLIER + Number.EPSILON) * 100) / 100;
}
