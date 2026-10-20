import type { OfferItem } from "./offer";
import { printMethodName, printStatusLabel } from "./requestPresentation";
import { setOrderPrints } from "./orderPrinting";

export function requestOfferData(request: {
  id: string; name: string; email: string; phone?: string | null; company?: string | null;
  message?: string | null; assigned_pm_name?: string | null; assigned_pm_email?: string | null;
  billing?: unknown; worksheet_items?: unknown; items?: unknown; worksheet_discount?: unknown; worksheet_vat_rate?: number;
  print_method?: string | null; print_placement?: string | null; print_colors?: string | null; deadline?: string | null;
}) {
  const confirmed = Array.isArray(request.worksheet_items) && request.worksheet_items.length > 0;
  const raw = confirmed ? request.worksheet_items : request.items;
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