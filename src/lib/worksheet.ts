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
}

export const printTotalPerUnit = (i: WorksheetItem) =>
  round2((i.prints || []).reduce((s, p) => s + (Number(p.price) || 0), 0));

export const lineNet = (i: WorksheetItem) =>
  round2(((Number(i.unitPrice) || 0) + printTotalPerUnit(i)) * (Number(i.qty) || 0));

export const worksheetTotals = (items: WorksheetItem[], vatRate = 21) => {
  const goods = round2(items.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 0), 0));
  const print = round2(items.reduce((s, i) => s + printTotalPerUnit(i) * (Number(i.qty) || 0), 0));
  const net = round2(goods + print);
  const vat = round2((net * vatRate) / 100);
  return {
    qty: items.reduce((s, i) => s + (Number(i.qty) || 0), 0),
    goods,
    print,
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
