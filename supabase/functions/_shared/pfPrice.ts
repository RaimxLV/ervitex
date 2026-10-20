// PF feed item segment -> single-unit base price.
// Clearance/promotion items carry a reduced "nettPrice" plus the regular
// "standardPrice" inside "promotion". We never sell at clearance/promo prices:
// such items use the first-bar standardPrice, or null (caller keeps the prior
// known price) when no valid standard exists. Normal items use first-bar nettPrice.
function firstBar(seg: string, field: string): number | null {
  // Each scale object: tolerate whitespace and property order.
  const objRe = /\{[^{}]*"priceBar"[^{}]*\}/g;
  const barRe = /"priceBar"\s*:\s*(\d+)/;
  const valRe = new RegExp(`"${field}"\\s*:\\s*(-?[\\d.]+)`);
  let price: number | null = null;
  let lowest = Number.MAX_SAFE_INTEGER;
  for (const m of seg.match(objRe) || []) {
    const b = m.match(barRe);
    const v = m.match(valRe);
    if (!b || !v) continue;
    const bar = Number(b[1]);
    const val = Number(v[1]);
    if (Number.isFinite(val) && val > 0 && bar < lowest) { lowest = bar; price = val; }
  }
  return price;
}

export function pfIsReducedPriceItem(seg: string): boolean {
  const clearance = seg.match(/"clearance"\s*:\s*"([^"]*)"/);
  if (clearance && clearance[1].trim() !== "") return true;
  return /"promotion"\s*:\s*\[\s*\{/.test(seg);
}

// Clearance/promotion items: deliberate hold -> null (caller keeps last known
// regular base; new items stay without price). promotion.standardPrice is NOT a
// verified regular contract price, so it is never used.
export function pfFirstBarStandardPrice(seg: string): number | null {
  if (pfIsReducedPriceItem(seg)) return null;
  return firstBar(seg, "nettPrice");
}
