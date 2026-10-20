import { setOrderPrints, type OfferPrint } from "@/lib/orderPrinting";
import type { Offer } from "@/lib/offer";
import { offerEditorPath } from "@/lib/offerNavigation";
import { useRef, useState } from "react";
import { requestOfferData, requestConversionSource, CONFIRMED_EMPTY_MESSAGE } from "@/lib/requestOffer";
import { useNavigate } from "@/lib/router-compat";
import { Plus, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fillMissingPrices } from "@/lib/fillMissingPrices";

/** Creates a pm_offers draft (optionally from the cart, which is then emptied) and opens the editor. */
export function useCreateOffer() {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const { items, clear } = useQuoteCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const create = async (fromCart: boolean, details: Partial<Pick<Offer, "client_name" | "client_email" | "client_phone" | "client_company" | "client_billing" | "note">> = {}, prints: OfferPrint[] = []) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const priced = fromCart ? await fillMissingPrices(items) : [];
      const lines = priced.map((item) => ({ ...item, unitPrice: item.unitPrice ?? null }));
      const { data, error } = await supabase.from("pm_offers")
        .insert({ title: "Piedāvājums", ...details, items: setOrderPrints(lines, prints) as any }).select("id").single();
      if (error || !data) throw error || new Error("Neizdevās izveidot");
      if (fromCart) clear();
      navigate(offerEditorPath(data.id));
    } catch {
      toast({ title: "Neizdevās izveidot piedāvājumu", variant: "destructive" });
    } finally { setBusy(false); busyRef.current = false; }
  };
  const createFromRequest = async (requestId: string) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true);
    try {
      const { data: request, error: readError } = await supabase.from("quote_requests").select("*").eq("id", requestId).single();
      if (readError || !request) throw readError || new Error("Pieprasījums nav atrasts");
      if (requestConversionSource(request) === "confirmed_empty") { toast({ title: CONFIRMED_EMPTY_MESSAGE, variant: "destructive" }); return; }
      const payload = requestOfferData(request);
      const { data, error } = await supabase.from("pm_offers").insert(payload as any).select("id").single();
      if (error || !data) throw error || new Error("Neizdevās izveidot");
      navigate(offerEditorPath(data.id));
    } catch { toast({ title: "Neizdevās izveidot piedāvājumu", variant: "destructive" }); }
    finally { busyRef.current = false; setBusy(false); }
  };
  return { create, createFromRequest, busy };
}

export function CreateOfferButton({ fromCart = false, compact = false, iconOnly = false, requestId, blockedReason }: { fromCart?: boolean; compact?: boolean; iconOnly?: boolean; requestId?: string; blockedReason?: string }) {
  const { items } = useQuoteCart();
  const { create, createFromRequest, busy } = useCreateOffer();
  const button = <Button onClick={() => requestId ? createFromRequest(requestId) : create(fromCart || items.length > 0)} disabled={busy || !!blockedReason} variant={fromCart ? "outline" : "default"}
    aria-label={iconOnly ? "Izveidot piedāvājumu" : undefined} title={iconOnly ? "Izveidot piedāvājumu" : undefined}
    size={iconOnly ? "icon" : compact ? "sm" : "default"} className={fromCart ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
    {busy ? <Loader2 className={`${iconOnly ? "" : "mr-2"} h-4 w-4 animate-spin`} /> : fromCart ? <ClipboardList className="mr-2 h-4 w-4" /> : <Plus className={`${iconOnly ? "" : "mr-2"} h-4 w-4`} />}
    {!iconOnly && (fromCart ? `No groza (${items.length})` : "Izveidot piedāvājumu")}
  </Button>;
}
