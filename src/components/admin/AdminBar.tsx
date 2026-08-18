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
 * It replaces the need to go "into" the admin panel for everyday work:
 * flip on edit mode to get a pencil on every product card, and turn the
 * regular customer cart into a client offer with one click.
 */
const AdminBar = () => {
  const { isAdmin } = useAuth();
  const { items } = useQuoteCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
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
    <div className="fixed bottom-0 left-0 z-50 w-full sm:bottom-4 sm:left-4 sm:w-auto">
      <div className="border-t border-accent/40 bg-foreground/95 text-background shadow-2xl backdrop-blur sm:rounded-sm sm:border">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-2 font-heading text-[11px] font-black uppercase tracking-widest"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Admin režīms
          {open ? <ChevronDown className="ml-auto h-3.5 w-3.5" /> : <ChevronUp className="ml-auto h-3.5 w-3.5" />}
        </button>

        {open && (
          <div className="flex flex-col gap-3 border-t border-background/15 px-4 py-3 sm:min-w-[260px]">
            <Button
              size="sm"
              onClick={createOffer}
              disabled={creating || items.length === 0}
              className="w-full font-heading text-[11px] uppercase tracking-widest"
            >
              <FileText className="mr-2 h-3.5 w-3.5" />
              {items.length ? `Piedāvājums no groza (${items.length})` : "Grozs ir tukšs"}
            </Button>

            <Link
              to="/admin"
              className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-background/70 hover:text-background"
            >
              <Settings className="h-3.5 w-3.5" /> Tehniskais panelis
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBar;
