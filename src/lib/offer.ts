import { getOrderPrints, orderPrintingNet } from "./orderPrinting";

export interface OfferItem {
  id: string;
  source: string;
  productId: string;
  name: string;
  code: string;
  brand: string | null;
  image: string | null;
  colorName: string | null;
  colorHex: string | null;
  /** PF (005): pilnā krāsas atslēga un precīza SKU; vecās rindas tos nesatur un paliek nemainītas. */
  colorKey?: string | null;
  colorCode?: string | null;
  sku?: string | null;
  size: string | null;
  qty: number;
  /** Unit price, VAT excluded */
  unitPrice: number | null;
  /** Per-line goods discount percentage; decoration is not discounted. */
  discountPercent?: number | null;
  note?: string | null;
  /** Apdrukas / izšūšanas rindas */
  prints?: { method: string; placement?: string | null; price: number | null; mode?: "unit" | "total"; scope?: "item" | "order" }[];
}

export interface OfferDiscount { type: "percent" | "amount"; value: number }

export interface Offer {
  id: string;
  token?: string;
  title: string;
  client_name: string;
  client_company: string | null;
  client_email: string | null;
  client_phone: string | null;
  note: string | null;
  status: string;
  vat_rate: number;
  items: OfferItem[];
  /** Projektu vadītājs, kuram klients atbild */
  pm_name?: string | null;
  pm_email?: string | null;
  discount?: OfferDiscount | null;
  client_billing?: Record<string, string> | null;

  created_at: string;
  updated_at: string;
}

export const VAT_DEFAULT = 21;

export const money = (v: number, currency = "EUR") =>
  new Intl.NumberFormat("lv-LV", { style: "currency", currency, maximumFractionDigits: 2 }).format(v);

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const itemDiscountPercent = (i: OfferItem) => {
  const value = Number(i.discountPercent);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
};
/** Discount amount for all units in this line, excluding VAT. */
export const itemDiscountNet = (i: OfferItem) =>
  round2((i.unitPrice || 0) * i.qty * itemDiscountPercent(i) / 100);
/** Display-only discount per unit; line totals retain their existing rounding. */
export const itemUnitDiscountNet = (i: OfferItem) =>
  round2((i.unitPrice || 0) * itemDiscountPercent(i) / 100);
/** Display-only unit price after discount; line totals retain their existing rounding. */
export const itemUnitPriceNet = (i: OfferItem) =>
  round2((i.unitPrice || 0) - itemUnitDiscountNet(i));
export const itemGoodsNet = (i: OfferItem) =>
  round2((i.unitPrice || 0) * i.qty - itemDiscountNet(i));

/** Apdruka šai precei kopā, bez PVN. */
export const itemPrintNet = (i: OfferItem) =>
  round2((i.prints || []).filter((p) => p.scope !== "order").reduce((s, p) => s + (Number(p.price) || 0) * (p.mode === "total" ? 1 : Number(i.qty) || 0), 0));

export const itemTotalNet = (i: OfferItem) => round2(itemGoodsNet(i) + itemPrintNet(i));

export const offerTotals = (items: OfferItem[], vatRate = VAT_DEFAULT, discount?: OfferDiscount | null) => {
  const goods = round2(items.reduce((s, i) => s + itemGoodsNet(i), 0));
  const itemDiscount = round2(items.reduce((s, i) => s + itemDiscountNet(i), 0));
  const print = round2(items.reduce((s, i) => s + itemPrintNet(i), 0) + orderPrintingNet(items));
  const subtotal = round2(goods + print);
  const dv = Number(discount?.value) || 0;
  // Atlaide tikai no precēm — nekad no apdrukas/izšūšanas.
  const disc = dv > 0 && discount ? round2(Math.min(goods, discount.type === "percent" ? (goods * Math.min(dv, 100)) / 100 : dv)) : 0;
  const net = round2(subtotal - disc);
  const vat = round2((net * vatRate) / 100);
  return { goods, print, subtotal, itemDiscount, discount: disc, net, vat, gross: round2(net + vat), qty: items.reduce((s, i) => s + i.qty, 0) };
};

/** Publiskā lapas adrese. */
const PUBLIC_APP_BASE = "https://www.ervitex.lv";

/** Absolūta saite uz piedāvājumu klientam — vienmēr www.ervitex.lv. */
export const offerUrl = (token: string) => `${PUBLIC_APP_BASE}/piedavajums/${token}`;

/** Relatīva saite priekš iekšējiem `<a href>`. */
export const offerPath = (token: string, search = "") =>
  `${(import.meta.env.BASE_URL || "/").replace(/\/+$/, "")}/piedavajums/${token}${search}`;

export const PRINT_DISCLAIMER_LV =
  "Katalogā redzamās cenas ir norādītas par apģērbu bez apdrukas.\nVēlaties personalizāciju? Apdrukas izmaksas aprēķinām individuāli katram projektam — atkarībā no izvēlētās tehnikas, dizaina izmēra un vienību skaita.";

export const PRINT_DISCLAIMER_EN =
  "Prices shown are for the garment/product only, without decoration. Printing (DTF, screen print, sublimation) and embroidery are quoted separately depending on technology, size, number of colours and quantity. Prices are indicative and valid for 14 days unless stated otherwise.";

export const offerPlainText = (offer: Offer, lang: "lv" | "en" = "lv") => {
  const { net, vat, gross, discount: disc } = offerTotals(offer.items, offer.vat_rate, offer.discount);
  const lines = offer.items.map((i) => {
    const bits = [i.name, i.code, i.colorName, i.size].filter(Boolean).join(" · ");
    const reduction = itemDiscountPercent(i) > 0 ? ` · ${lang === "lv" ? "Atlaide" : "Discount"} ${itemDiscountPercent(i)}% (−${money(itemDiscountNet(i))})` : "";
    const price = i.unitPrice ? ` — ${i.qty} gab. × ${money(i.unitPrice)}${reduction} = ${money(itemGoodsNet(i))}` : ` — ${i.qty} gab.`;
    const prints = (i.prints || []).filter((p) => p.scope !== "order").map((p) =>
      `   + ${p.method}${p.placement ? ` (${p.placement})` : ""}: ${money(Number(p.price))}${p.mode === "total" ? "" : ` × ${i.qty}`}`);
    return [`• ${bits}${price}`, ...prints].join("\n");
  });
  return [
    offer.title || (lang === "lv" ? "Piedāvājums" : "Offer"),
    offer.client_name ? `${lang === "lv" ? "Klients" : "Client"}: ${offer.client_name}` : "",
    "",
    ...lines,
    ...getOrderPrints(offer.items).map((p) => `${lang === "lv" ? "Apdruka visām precēm" : "Decoration for all items"}: ${p.method}${p.placement ? ` (${p.placement})` : ""}${p.price ? ` — ${money(p.price)}${p.mode === "total" ? " kopā" : " / gab."}` : ""}`),
    "",
    disc > 0 ? `${lang === "lv" ? "Atlaide" : "Discount"}: −${money(disc)}` : "",
    `${lang === "lv" ? "Kopā bez PVN" : "Total excl. VAT"}: ${money(net)}`,
    `PVN ${offer.vat_rate}%: ${money(vat)}`,
    `${lang === "lv" ? "Kopā ar PVN" : "Total incl. VAT"}: ${money(gross)}`,
    "",
    offer.token ? `\n${offerUrl(offer.token)}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
};
