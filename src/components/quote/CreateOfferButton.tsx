import { setOrderPrints, type OfferPrint } from "@/lib/orderPrinting";
import type { Offer } from "@/lib/offer";
import { offerEditorPath } from "@/lib/offerNavigation";
import { useState } from "react";
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
  const { items, clear } = useQuoteCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const create = async (fromCart: boolean, details: Partial<Pick<Offer, "client_name" | "client_email" | "client_phone" | "client_company" | "client_billing" | "note">> = {}, prints: OfferPrint[] = []) => {
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
    } finally { setBusy(false); }
  };
  return { create, busy };
}

export function CreateOfferButton({ fromCart = false, compact = false, iconOnly = false }: { fromCart?: boolean; compact?: boolean; iconOnly?: boolean }) {
  const { items } = useQuoteCart();
  const { create, busy } = useCreateOffer();
  return <Button onClick={() => create(fromCart || items.length > 0)} disabled={busy} variant={fromCart ? "outline" : "default"}
    aria-label={iconOnly ? "Izveidot piedāvājumu" : undefined} title={iconOnly ? "Izveidot piedāvājumu" : undefined}
    size={iconOnly ? "icon" : compact ? "sm" : "default"} className={fromCart ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
    {busy ? <Loader2 className={`${iconOnly ? "" : "mr-2"} h-4 w-4 animate-spin`} /> : fromCart ? <ClipboardList className="mr-2 h-4 w-4" /> : <Plus className={`${iconOnly ? "" : "mr-2"} h-4 w-4`} />}
    {!iconOnly && (fromCart ? `No groza (${items.length})` : "Izveidot piedāvājumu")}
  </Button>;
}
