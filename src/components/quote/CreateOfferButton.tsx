import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CreateOfferButton({ fromCart = false, compact = false }: { fromCart?: boolean; compact?: boolean }) {
  const [busy, setBusy] = useState(false);
  const { items } = useQuoteCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const create = async () => {
    setBusy(true);
    try {
      const lines = fromCart ? items.map(({ id, source, productId, name, code, brand, image, colorName, colorHex, size, qty, unitPrice }) => ({ id, source, productId, name, code, brand, image, colorName, colorHex, size, qty, unitPrice: unitPrice ?? null })) : [];
      const { data, error } = await supabase.from("pm_offers")
        .insert({ title: "Piedāvājums", items: lines }).select("id").single();
      if (error || !data) throw error || new Error("Neizdevās izveidot");
      navigate(`/admin/offers/${data.id}`);
    } catch {
      toast({ title: "Neizdevās izveidot piedāvājumu", variant: "destructive" });
    } finally { setBusy(false); }
  };
  return <Button onClick={create} disabled={busy} variant={fromCart ? "outline" : "default"}
    size={compact ? "sm" : "default"} className={fromCart ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}>
    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : fromCart ? <ClipboardList className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
    {fromCart ? `No groza (${items.length})` : "Izveidot piedāvājumu"}
  </Button>;
}