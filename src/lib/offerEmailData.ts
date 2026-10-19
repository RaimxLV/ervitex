import { getOrderPrints } from "./orderPrinting";
import { money, itemDiscountNet, itemDiscountPercent, itemPrintNet, itemTotalNet, offerTotals, offerUrl, type Offer } from "./offer";

export function offerEmailData(offer: Offer) {
  const totals = offerTotals(offer.items, offer.vat_rate, offer.discount);
  return {
    title: offer.title || "Ervitex piedāvājums", clientName: offer.client_name,
    pmName: offer.pm_name || "", pmEmail: offer.pm_email || "birojs@ervitex.lv",
    note: [offer.note, ...getOrderPrints(offer.items).map((p) => `Apdruka visām precēm: ${p.method}${p.placement ? ` (${p.placement})` : ""}${p.price ? ` — ${money(p.price)}${p.mode === "total" ? " kopā" : " / gab."}` : ""}`)].filter(Boolean).join("\n"),
    items: offer.items.map((i) => ({
      name: i.name, code: i.code, colorName: i.colorName, size: i.size, qty: i.qty,
      unitPrice: i.unitPrice ? money(i.unitPrice) : null,
      discountPercent: itemDiscountPercent(i), discountAmount: money(itemDiscountNet(i)),
      lineTotal: i.unitPrice || itemPrintNet(i) ? money(itemTotalNet(i)) : "",
      prints: (i.prints || []).filter((p) => p.scope !== "order").map((p) => `${p.method}${p.placement ? ` (${p.placement})` : ""}: ${money(Number(p.price))}${p.mode === "total" ? " kopā" : " / gab."}`),
    })),
    discount: totals.discount > 0 ? `−${money(totals.discount)}` : "",
    totalQty: totals.qty, net: money(totals.net), vat: money(totals.vat), gross: money(totals.gross),
    vatRate: offer.vat_rate, url: offer.token ? offerUrl(offer.token) : "",
  };
}