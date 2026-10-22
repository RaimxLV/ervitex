import type { OfferItem } from "./offer";
import { requestPrintStatus } from "./requestDetails";

export const printMethodName = (method?: string | null) => ({ consult: "Konsultācija", silkscreen: "Sietspiede", dtf: "DTF", termodruka: "Termodruka", embroidery: "Izšūšana", sublimation: "Sublimācija", other: "Cita", none: "Bez apdrukas" }[method || ""] || method || "");
export const printStatusLabel = (method?: string | null, lang: "lv" | "en" = "lv") => {
  const status = requestPrintStatus(method);
  return lang === "lv" ? { required: "Nepieciešama apdruka", none: "Bez apdrukas", unspecified: "Apdruka nav norādīta" }[status] : { required: "Printing required", none: "No printing", unspecified: "Printing not specified" }[status];
};
export function attachmentName(path: string) {
  const raw = path.split("?")[0].split("/").pop() || "Fails";
  try { return decodeURIComponent(raw); } catch { return raw; }
}
export const offerGroupKey = (i: OfferItem) => `${i.source}|${i.productId}|${i.colorKey || i.colorCode || i.colorName || ""}`;
export function replacedOfferItem(original: OfferItem, replacement: Partial<OfferItem>): OfferItem {
  return { ...original, ...replacement, colorCode: replacement.colorCode ?? null, colorKey: replacement.colorKey ?? null, sku: replacement.sku ?? null, unitPrice: replacement.unitPrice ?? null };
}

export interface ModelSwapReplacement {
  source: string; productId: string; name: string; code: string; brand: string | null;
  image: string | null; colorName: string | null; colorHex: string | null; colorCode: string | null;
}

/** Nomaina modeli/krāsu TIKAI izvēlētajai grupai; izmēri, daudzumi, atlaides un apdrukas paliek.
 *  Cena nāk tikai no precīzas krāsas+izmēra rindas; izmēram bez cenas — null, nevis cita varianta cena. */
export function applyModelSwap(items: OfferItem[], targetKey: string, replacement: ModelSwapReplacement, priceBySize: ReadonlyMap<string, number | null>): { items: OfferItem[]; missing: number } {
  let missing = 0;
  const next = items.map((i) => {
    if (offerGroupKey(i) !== targetKey) return i;
    const size = i.size || "-";
    if (!priceBySize.has(size) || priceBySize.get(size) == null) missing += 1;
    return replacedOfferItem(i, { ...replacement, unitPrice: priceBySize.get(size) ?? null });
  });
  return { items: next, missing };
}
export const consumerCartAllowed = (path: string) => !["/request", "/offers", "/admin", "/saraksts", "/piedavajums", "/nodot", "/login"].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));