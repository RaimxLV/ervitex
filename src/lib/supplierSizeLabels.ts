/**
 * Display-only labels for verified supplier size codes. Raw codes stay the
 * identity for cart/quantity/price/supplier data; only rendering changes.
 * Russell 0R957M0 collar sizes: manufacturer garment-dimensions PDF (page 2).
 */
const RU_957M_COLLAR: Record<string, { base: string; collar: string }> = {
  S2: { base: "S", collar: "14.5" }, S1: { base: "S", collar: "15" },
  M1: { base: "M", collar: "15.5" },
  L2: { base: "L", collar: "16" }, L1: { base: "L", collar: "16.5" },
  XL2: { base: "XL", collar: "17" }, XL1: { base: "XL", collar: "17.5" },
  "2X1": { base: "2XL", collar: "18" },
  "3X1": { base: "3XL", collar: "18.5" }, "3X2": { base: "3XL", collar: "19" },
  "4X1": { base: "4XL", collar: "19.5" },
};

const modelOf = (model?: string | null) => (model || "").trim().toUpperCase().replace(/^RU:/, "");
const tableFor = (source?: string | null, model?: string | null) =>
  source === "ru" && modelOf(model) === "0R957M0" ? RU_957M_COLLAR : null;

export function supplierSizeLabel(source: string | null | undefined, model: string | null | undefined, size: string | null | undefined, lang: "lv" | "en"): string {
  const raw = (size || "").trim();
  const hit = tableFor(source, model)?.[raw.toUpperCase()];
  if (!hit) return raw;
  const collar = lang === "lv" ? `apkakle ${hit.collar}″` : `collar ${hit.collar}″`;
  return `${hit.base} · ${collar} (${raw})`;
}

/** Short explanation when the model uses collar-coded sizes, else null. */
export function supplierSizeNote(source: string | null | undefined, model: string | null | undefined, lang: "lv" | "en"): string | null {
  if (!tableFor(source, model)) return null;
  return lang === "lv"
    ? "Izmēra kods norāda apkakles apkārtmēru collās (ražotāja izmēru tabula); viena burtu izmēra kodi ir atsevišķi izmēri."
    : "The size code gives the collar circumference in inches (manufacturer size chart); codes sharing a letter size are distinct sizes.";
}
