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
// Whole English garment tokens; Latvian inflections stay bounded to one word.
const TEXTILE_TYPE = /\b(?:tshirts?|shirts?|tees?|tops?|bottoms?|polos?|hood(?:ie|ies|y|ies)?|hooded|sweats?|sweatshirts?|sweaters?|fleece|jackets?|vests?|bodywarmers?|trousers?|pants?|shorts?|clothing|textiles?|caps?|hats?|beanies?|headwear|towels?|terry|aprons?|gloves?|socks?|scarves|blankets?|raincoats?|ponchos?|coveralls?|overalls?|workwear|outerwear|knitwear|knitted|softshells?|sportswear|jerseys?|dresses?|skirts?|underwear|cardigans?|pullovers?|leggings?|tights?|bodysuits?|bod(?:y|ies)|bibs?|kitchen linen|training sets?)\b|\b(?:apgerb\w*|krekl\w*|cepur\w*|dviel\w*|prieksaut\w*|biks\w*|jaka\w*|jakas|virsjak\w*|sort\w*|cimd\w*|zek\w*|sall\w*|seg\w*|buf\w*|kleit\w*|svark\w*|apaksvel\w*|trikotaz\w*|flis\w*|dzemper\w*|adijum\w*|adit\w*|vest\w*|dzin\w*)\b/;
/** Specific category wins over incidental words in a product name. */
function categoryKind(value: string): OrderMinimumKind | null {
  const c = normalize(value);
  if (/\b(bags?|totes?|shoppers?|backpacks?|rucksacks?|pouches|pouch|trolleys|suitcases|wallets|cases)\b|somas?|somina|maisini|maisins|mugursom|futrali|kofer/.test(c)) return "bags";
  if (/umbrellas?|lietussarg/.test(c)) return "umbrellas";
  // A notebook remains promotional even in a combined notebook/writing label.
  if (/notebooks?|notepads?|paper products|sticky notes|planners?|bloknot|blocin|piezimju gram|planot/.test(c)) return "promotional";
  if (/\b(pens?|pencils?|markers?|writing|colouring)\b|pildspalv|zimul|rakstam|rakstis|markier/.test(c)) return "writing";
  if (/gadgets?|electronics?|\btech\b|speakers?|headphones?|earbuds?|charg|power banks?|cables?|usb|smartwatch|computer|telephone|camera|lamps?|torches|flashlights|tumbin|austin|iekart|skalrun|ladet/.test(c)) return "gadgets";
  if (TEXTILE_TYPE.test(c)) return "textile";
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
