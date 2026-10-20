// PF feed item segment -> single-unit base price.
// Clearance/promotion items carry a reduced "nettPrice" plus the regular
// "standardPrice" inside "promotion". We never sell at clearance/promo prices,
// so the standard price of the first (smallest) bar wins when present.
export function pfFirstBarStandardPrice(seg: string): number | null {
  const pick = (re: RegExp): number | null => {
    let price: number | null = null;
    let lowest = Number.MAX_SAFE_INTEGER;
    let m: RegExpExecArray | null;
    while ((m = re.exec(seg)) !== null) {
      const bar = Number(m[1]);
      const val = Number(m[2]);
      if (Number.isFinite(val) && val > 0 && bar < lowest) { lowest = bar; price = val; }
    }
    return price;
  };
  return pick(/"priceBar":(\d+),"standardPrice":([\d.]+)/g)
    ?? pick(/"priceBar":(\d+),"nettPrice":([\d.]+)/g);
}
