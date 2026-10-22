import { isEtxCategory } from "./etxCatalog";

export type OrderMinimumKind = "textile" | "promotional" | "writing" | "bags" | "gadgets" | "umbrellas" | "sublimation" | "generic";
export interface OrderMinimum {
  kind: OrderMinimumKind;
  minimum: number;
  printedMinimum?: number;
  recommended?: { minimum: number; sameSize: boolean };
}
const rules: Record<OrderMinimumKind, OrderMinimum> = {
  textile: { kind: "textile", minimum: 10, recommended: { minimum: 5, sameSize: true } },
  promotional: { kind: "promotional", minimum: 10, printedMinimum: 25 },
  writing: { kind: "writing", minimum: 25, printedMinimum: 50 },
  bags: { kind: "bags", minimum: 10, recommended: { minimum: 5, sameSize: false } },
  gadgets: { kind: "gadgets", minimum: 10 },
  umbrellas: { kind: "umbrellas", minimum: 10 },
  sublimation: { kind: "sublimation", minimum: 10 },
  generic: { kind: "generic", minimum: 10 },
};
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
/** Specific category wins over incidental words in a product name. */
function categoryKind(value: string): OrderMinimumKind | null {
  const c = normalize(value);
  if (/\b(bags?|totes?|shoppers?|backpacks?|rucksacks?|pouches|pouch|trolleys|suitcases|wallets|cases)\b|somas?|somina|maisini|maisins|mugursom|futrali|kofer/.test(c)) return "bags";
  if (/umbrellas?|lietussarg/.test(c)) return "umbrellas";
  // A notebook remains promotional even in a combined notebook/writing label.
  if (/notebooks?|notepads?|paper products|sticky notes|planners?|bloknot|blocin|piezimju gram|planot/.test(c)) return "promotional";
  if (/\b(pens?|pencils?|markers?|writing|colouring)\b|pildspalv|zimul|rakstam|rakstis|markier/.test(c)) return "writing";
  if (/gadgets?|electronics?|\btech\b|speakers?|headphones?|earbuds?|charg|power banks?|cables?|usb|smartwatch|computer|telephone|camera|lamps?|torches|flashlights|tumbin|austin|iekart|skalrun|ladet/.test(c)) return "gadgets";
  if (/shirts?|tees|tops?|bottoms?|polos?|hood|sweat|fleece|jackets?|vests?|bodywarm|trousers?|pants?|shorts?|clothing|textiles?|caps?|hats?|beanies|headwear|towels?|terry|aprons?|gloves?|socks?|scarves|blankets?|raincoat|poncho|coverall|workwear|kitchen linen|training set|bod(y|ies)|\bbib\b|apgerb|krekl|cepur|dviel|prieksaut|biks|jakas?|sorti|cimdi|zekes|salles|segas|bufs/.test(c)) return "textile";
  if (/bottles?|mugs?|cups?|drinkware|notebooks?|notepads?|paper products|sticky notes|planners?|boards?|kruz|pudel|delis|delisi|bloknot|blocin|planot/.test(c)) return "promotional";
  return null;
}
export function getOrderMinimum({ category, name, productType }: { source: string; category?: string | null; name?: string | null; productType?: string | null }): OrderMinimum {
  // Section membership, never supplier identity or a capability mentioned in a name/description.
  if (isEtxCategory(category) || /^sublimation(?:\s|$)|^sublimacijas(?:\s|$)/.test(normalize(category || ""))) return rules.sublimation;
  const kind = category ? categoryKind(category) : null;
  const fallbackKind = categoryKind(productType || "") || categoryKind(name || "");
  // Broad textile membership must not hide the more specific bag policy.
  if (kind === "textile" && /^(textiles?|clothing|apgerbs)$/.test(normalize((category || "").trim())) && fallbackKind === "bags") return rules.bags;
  if (kind) return rules[kind];
  if (fallbackKind) return rules[fallbackKind];
  return rules.generic;
}
