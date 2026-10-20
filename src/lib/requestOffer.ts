import type { OfferItem } from "./offer";
import { printMethodName, printStatusLabel } from "./requestPresentation";
import { setOrderPrints } from "./orderPrinting";

type ConversionSource = { worksheet_items?: unknown; worksheet_revision?: number | null; worksheet_updated_at?: string | null };
/**
 * "worksheet": a confirmed list with items; "confirmed_empty": staff/client explicitly confirmed an
 * empty list (items were deleted on purpose); "original": no list was ever confirmed.
 */
export function requestConversionSource(r: ConversionSource): "worksheet" | "confirmed_empty" | "original" {
  const list = Array.isArray(r.worksheet_items) ? r.worksheet_items : [];
  if (list.length > 0) return "worksheet";
  return (r.worksheet_revision ?? 0) > 0 || !!r.worksheet_updated_at ? "confirmed_empty" : "original";
}
export const CONFIRMED_EMPTY_MESSAGE = "Apstiprinātais preču saraksts ir tukšs — piedāvājumu nevar izveidot, kamēr sarakstā nav preču.";

export function requestOfferData(request: ConversionSource & {
  id: string; name: string; email: string; phone?: string | null; company?: string | null;
  message?: string | null; assigned_pm_name?: string | null; assigned_pm_email?: string | null;
  billing?: unknown; worksheet_items?: unknown; items?: unknown; worksheet_discount?: unknown; worksheet_vat_rate?: number;
  print_method?: string | null; print_placement?: string | null; print_colors?: string | null; deadline?: string | null;
}) {
  const source = requestConversionSource(request);
  // Never resurrect deliberately deleted lines from the original request.
  if (source === "confirmed_empty") throw new Error(CONFIRMED_EMPTY_MESSAGE);
  const raw = source === "worksheet" ? request.worksheet_items : request.items;
  const items: OfferItem[] = (Array.isArray(raw) ? raw : []).map((item, index) => ({ ...item, id: item.id || `request-${index}`, unitPrice: item.unitPrice ?? null }));
  const prints = request.print_method && request.print_method !== "none" && !items.some((item) => item.prints?.length)
    ? [{ method: printMethodName(request.print_method), placement: request.print_placement || null, price: null, mode: "unit" as const, scope: "order" as const }] : [];
  return {
    title: "Piedāvājums", status: "draft", quote_request_id: request.id,
    client_name: request.name, client_email: request.email, client_phone: request.phone || null, client_company: request.company || null,
    client_billing: request.billing || null, pm_name: request.assigned_pm_name || null, pm_email: request.assigned_pm_email || null,
    vat_rate: request.worksheet_vat_rate ?? 21, discount: request.worksheet_discount || null,
    note: [printStatusLabel(request.print_method), request.print_placement, request.print_colors, request.deadline, request.message].filter(Boolean).join("\n"),
    items: prints.length ? setOrderPrints(items, prints) : items,
  };
}