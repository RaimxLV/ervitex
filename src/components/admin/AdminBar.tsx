import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FileText, Settings, ChevronUp, ChevronDown, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OfferItem } from "@/lib/offer";

/**
 * Always-on admin toolbar shown while an admin browses the public site.
 * Its only job: turn the regular customer cart into a client offer with
 * one click, plus a shortcut into the technical panel.
 */
const AdminBar = () => {
  const { isAdmin } = useAuth();
  const { items } = useQuoteCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!isAdmin) return null;
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/piedavajums")) return null;

  const createOffer = async () => {
    setCreating(true);
    const offerItems: OfferItem[] = items.map((i) => ({
      id: i.id,
      source: i.source,
      productId: i.productId,
      name: i.name,
      code: i.code,
      brand: i.brand,
      image: i.image,
      colorName: i.colorName,
      colorHex: i.colorHex,
      size: i.size,
      qty: i.qty,
      unitPrice: i.unitPrice ?? null,
    }));
    const { data, error } = await supabase
      .from("pm_offers")
      .insert({ title: "Piedāvājums", items: offerItems as any })
      .select("id")
      .single();
    setCreating(false);
    if (error) {
      toast({ title: "Neizdevās izveidot piedāvājumu", description: error.message, variant: "destructive" });
      return;
    }
    navigate(`/admin/offers/${data.id}`);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {open && (
        <div className="w-56 rounded-sm border border-border bg-card/95 p-3 shadow-xl backdrop-blur">
          <Button
            size="sm"
            onClick={createOffer}
            disabled={creating || items.length === 0}
            className="w-full font-heading text-[11px] uppercase tracking-widest"
          >
            <FileText className="mr-2 h-3.5 w-3.5" />
            {items.length ? `Piedāvājums (${items.length})` : "Grozs ir tukšs"}
          </Button>
          <Link
            to="/admin"
            className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" /> Panelis
          </Link>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Admin rīki"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground opacity-50 shadow-sm backdrop-blur transition hover:opacity-100 hover:text-foreground"
      >
        <ShieldCheck className="h-4 w-4" />
      </button>
    </div>
  );
};


export default AdminBar;
