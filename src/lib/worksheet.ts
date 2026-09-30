import type { OfferItem } from "@/lib/offer";
import { round2 } from "@/lib/offer";

/** Apdrukas veidi, ko var izvēlēties. Vienai precei var būt vairāki (mikss). */
export const PRINT_METHODS = [
  "Sietspiede",
  "DTF",
  "Izšūšana",
  "Sublimācija",
  "Cita",
] as const;

export type PrintMethod = (typeof PRINT_METHODS)[number];

export interface PrintLine {
  /** Apdrukas veids */
  method: string;
  /** Vieta uz preces, piem. "Priekšpuse" */
  placement?: string | null;
  /** Cena bez PVN — ievada ar roku */
  price: number | null;
  /** "unit" = cena par gabalu, "total" = cena kopā par visu apdruku */
  mode?: "unit" | "total";
  /** "order" = viena kopēja apdruka visam sarakstam */
  scope?: "item" | "order";
}

export interface WorksheetItem extends OfferItem {
  /** Apdrukas rindas — var būt vairākas (mikss) */
  prints?: PrintLine[];
}

export interface Worksheet {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  items: WorksheetItem[];
  vat_rate: number;
  locked: boolean;
  worksheet_updated_at: string | null;
  worksheet_updated_by: string | null;
  assigned_pm_name: string | null;
  assigned_pm_email: string | null;
  created_at: string;
  revision: number;
  draft_items: WorksheetItem[] | null;
  draft_updated_at: string | null;
  draft_updated_by: string | null;
  actor_side: "client" | "staff";
}

export interface WorksheetVersion {
  id: string;
  revision: number;
  items: WorksheetItem[];
  actor_side: string;
  actor_name: string | null;
  summary: string;
  created_at: string;
}

/** Apdrukas cena par gabalu (tikai rindas ar mode "unit"). */
export const printTotalPerUnit = (i: WorksheetItem) =>
  round2((i.prints || []).reduce((s, p) => s + (p.scope === "order" || p.mode === "total" ? 0 : Number(p.price) || 0), 0));

/** Apdrukas rindas, kur cena ierakstīta kopā par visu. */
export const printFixedTotal = (i: WorksheetItem) =>
  round2((i.prints || []).reduce((s, p) => s + (p.scope !== "order" && p.mode === "total" ? Number(p.price) || 0 : 0), 0));

/** Visas apdrukas kopā šai precei, bez PVN. */
export const printNet = (i: WorksheetItem) =>
  round2(printTotalPerUnit(i) * (Number(i.qty) || 0) + printFixedTotal(i));

/** Kopējās apdrukas izmaksas visam sarakstam, bez PVN. */
export const orderPrintNet = (items: WorksheetItem[]) => {
  const qty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  return round2(items.reduce(
    (sum, item) => sum + (item.prints || []).reduce((lineSum, print) => {
      if (print.scope !== "order") return lineSum;
      const price = Number(print.price) || 0;
      return lineSum + (print.mode === "total" ? price : price * qty);
    }, 0),
    0,
  ));
};

export const lineNet = (i: WorksheetItem) =>
  round2((Number(i.unitPrice) || 0) * (Number(i.qty) || 0) + printNet(i));

export interface Discount {
  type: "percent" | "amount";
  value: number;
}

export interface Billing {
  company?: string;
  regNo?: string;
  vatNo?: string;
  address?: string;
  delivery?: string;
}

export const BILLING_FIELDS: { key: keyof Billing; label: string }[] = [
  { key: "company", label: "Uzņēmuma nosaukums" },
  { key: "regNo", label: "Reģ. Nr." },
  { key: "vatNo", label: "PVN Nr." },
  { key: "address", label: "Juridiskā adrese" },
  { key: "delivery", label: "Piegādes adrese" },
];

export const hasBilling = (b?: Billing | null) => !!b && BILLING_FIELDS.some((f) => (b[f.key] || "").trim());

/** Atlaides summa (bez PVN) no neto summas. */
export const discountAmount = (net: number, d?: Discount | null) => {
  if (!d || !(Number(d.value) > 0)) return 0;
  const v = Number(d.value);
  return round2(Math.min(net, d.type === "percent" ? (net * Math.min(v, 100)) / 100 : v));
};

export const worksheetTotals = (items: WorksheetItem[], vatRate = 21, discount?: Discount | null) => {
  const goods = round2(items.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0));
  const print = round2(items.reduce((s, i) => s + printNet(i), 0) + orderPrintNet(items));
  const subtotal = round2(goods + print);
  const disc = discountAmount(subtotal, discount);
  const net = round2(subtotal - disc);
  const vat = round2((net * vatRate) / 100);
  return {
    qty: items.reduce((s, i) => s + (Number(i.qty) || 0), 0),
    goods,
    print,
    subtotal,
    discount: disc,
    net,
    vat,
    gross: round2(net + vat),
  };
};

const PUBLIC_APP_BASE = "https://raimxlv.github.io/ervitex";

/** Absolūta saite uz kopīgo preču sarakstu (darbojas arī no e-pasta). */
export const worksheetUrl = (token: string) => {
  let base = PUBLIC_APP_BASE;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("github.io") || host.endsWith("ervitex.lv")) {
      base = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`.replace(/\/+$/, "");
    }
  }
  return `${base}/saraksts/${token}`;
};

/** Relatīva saite iekšējai navigācijai. */
export const worksheetPath = (token: string) =>
  `${(import.meta.env.BASE_URL || "/").replace(/\/+$/, "")}/saraksts/${token}`;
