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
  size: string | null;
  qty: number;
  /** Unit price, VAT excluded */
  unitPrice: number | null;
  note?: string | null;
}

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
  created_at: string;
  updated_at: string;
}

export const VAT_DEFAULT = 21;

export const money = (v: number, currency = "EUR") =>
  new Intl.NumberFormat("lv-LV", { style: "currency", currency, maximumFractionDigits: 2 }).format(v);

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const offerTotals = (items: OfferItem[], vatRate = VAT_DEFAULT) => {
  const net = round2(items.reduce((s, i) => s + (i.unitPrice || 0) * i.qty, 0));
  const vat = round2((net * vatRate) / 100);
  return { net, vat, gross: round2(net + vat), qty: items.reduce((s, i) => s + i.qty, 0) };
};

export const offerUrl = (token: string) => `https://www.ervitex.lv/piedavajums/${token}`;

export const PRINT_DISCLAIMER_LV =
  "Norādītās cenas ir par apģērbu/preci bez apdrukas. Apdrukas (DTF, sietspiede, sublimācija) un izšuvumu izmaksas tiek aprēķinātas atsevišķi — atkarībā no izvēlētās tehnoloģijas, izmēra, krāsu skaita un tirāžas. Cenas ir informatīvas un spēkā 14 dienas, ja nav norādīts citādi.";

export const PRINT_DISCLAIMER_EN =
  "Prices shown are for the garment/product only, without decoration. Printing (DTF, screen print, sublimation) and embroidery are quoted separately depending on technology, size, number of colours and quantity. Prices are indicative and valid for 14 days unless stated otherwise.";

export const offerPlainText = (offer: Offer, lang: "lv" | "en" = "lv") => {
  const { net, vat, gross } = offerTotals(offer.items, offer.vat_rate);
  const lines = offer.items.map((i) => {
    const bits = [i.name, i.code, i.colorName, i.size].filter(Boolean).join(" · ");
    const price = i.unitPrice ? ` — ${i.qty} gab. × ${money(i.unitPrice)} = ${money(i.unitPrice * i.qty)}` : ` — ${i.qty} gab.`;
    return `• ${bits}${price}`;
  });
  return [
    offer.title || (lang === "lv" ? "Piedāvājums" : "Offer"),
    offer.client_name ? `${lang === "lv" ? "Klients" : "Client"}: ${offer.client_name}` : "",
    "",
    ...lines,
    "",
    `${lang === "lv" ? "Kopā bez PVN" : "Total excl. VAT"}: ${money(net)}`,
    `PVN ${offer.vat_rate}%: ${money(vat)}`,
    `${lang === "lv" ? "Kopā ar PVN" : "Total incl. VAT"}: ${money(gross)}`,
    "",
    lang === "lv" ? PRINT_DISCLAIMER_LV : PRINT_DISCLAIMER_EN,
    offer.token ? `\n${offerUrl(offer.token)}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");
};
