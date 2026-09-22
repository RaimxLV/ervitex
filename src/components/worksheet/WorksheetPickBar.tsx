import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { endWorksheetPick, useWorksheetPick } from "@/lib/worksheetPick";
import type { WorksheetItem } from "@/lib/worksheet";
import { fetchVariantPrices, priceForVariant } from "@/components/worksheet/useVariants";
import { ArrowLeft, Check, Loader2, Repeat, X } from "lucide-react";

const WorksheetPickBar = () => {
  const pick = useWorksheetPick();
  const { items, totalQty, clear } = useQuoteCart();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (!pick) return null;

  const back = () => {
    endWorksheetPick();
    navigate(`/saraksts/${pick.token}`);
  };

  const cancel = back;

  const loadSheet = async () => {
    const { data } = await supabase.rpc("get_quote_worksheet" as never, { _token: pick.token } as never);
    const raw = data as unknown;
    const rows = (Array.isArray(raw) ? raw[0] : raw) as { items?: WorksheetItem[] } | null | undefined;
    return (Array.isArray(rows?.items) ? rows!.items : []).map((i, idx) => ({
      ...i,
      id: i.id || `row-${idx}`,
      qty: Number(i.qty) || 0,
      prints: Array.isArray(i.prints) ? i.prints : [],
    })) as WorksheetItem[];
  };

  const persist = async (next: WorksheetItem[]) => {
    const { data, error } = await supabase.rpc("save_quote_worksheet" as never, {
      _token: pick.token,
      _items: next,
      _by: null,
    } as never);
    if (error || data === false) throw new Error("save failed");
  };

  const addToSheet = async () => {
    if (!items.length) return;
    setBusy(true);
    try {
      const current = await loadSheet();
      // Cenu no kataloga pārbaudām vēlreiz, lai sarakstā nenonāk 0,00 €.
      const priceCache = new Map<string, Awaited<ReturnType<typeof fetchVariantPrices>>>();
      const rows: WorksheetItem[] = [];
      for (const c of items) {
        let unitPrice = c.unitPrice ?? null;
        if (!unitPrice) {
          const key = `${c.source}|${c.productId}`;
          if (!priceCache.has(key)) priceCache.set(key, await fetchVariantPrices(c.source, c.productId));
          unitPrice = priceForVariant(c.source, priceCache.get(key)!, c.colorCode, c.size).price;
        }
        rows.push({
          id: `${c.source}-${c.productId}-${c.colorCode || "x"}-${c.size || "x"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          source: c.source,
          productId: c.productId,
          name: c.name,
          code: c.code,
          brand: c.brand,
          image: c.image,
          colorName: c.colorName,
          colorHex: c.colorHex,
          size: c.size,
          qty: c.qty,
          unitPrice,
          prints: [],
        });
      }
      await persist([...current, ...rows]);

      clear();
      toast.success(`Pievienots sarakstam: ${rows.length}`);
      back();
    } catch {
      toast.error("Neizdevās pievienot sarakstam");
    } finally {
      setBusy(false);
    }
  };

  const swapInSheet = async () => {
    const c = items[0];
    if (!c || !pick.rowId) return;
    setBusy(true);
    try {
      const current = await loadSheet();
      const prices = await fetchVariantPrices(c.source, c.productId);
      let missing = false;
      const next = current.map((i) => {
        if (i.id !== pick.rowId) return i;
        const hit = priceForVariant(c.source, prices, c.colorCode, i.size);
        if (!hit.price) missing = true;
        return {
          ...i,
          source: c.source,
          productId: c.productId,
          name: c.name,
          code: c.code,
          brand: c.brand,
          image: c.image,
          colorName: c.colorName,
          colorHex: c.colorHex,
          size: hit.size ?? i.size,
          unitPrice: hit.price,
        };
      });

      await persist(next);
      clear();
      toast[missing ? "warning" : "success"](
        missing ? "Modelis nomainīts — šim izmēram nav cenas" : "Modelis nomainīts",
      );
      back();
    } catch {
      toast.error("Neizdevās nomainīt modeli");
    } finally {
      setBusy(false);
    }
  };

  const swap = pick.mode === "swap";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 p-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-[11px] font-black uppercase tracking-widest">
            {swap ? "Mainīt modeli" : "Pievienot preču sarakstam"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {swap
              ? pick.label || ""
              : `${items.length} pozīcijas · ${totalQty} gab.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={cancel} disabled={busy}>
            <X className="mr-1.5 h-4 w-4" /> Atcelt
          </Button>
          <Button variant="outline" size="sm" onClick={back} disabled={busy}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Uz sarakstu
          </Button>
          <Button size="sm" onClick={swap ? swapInSheet : addToSheet} disabled={busy || items.length === 0}>
            {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : swap ? <Repeat className="mr-1.5 h-4 w-4" /> : <Check className="mr-1.5 h-4 w-4" />}
            {swap ? "Nomainīt" : "Pievienot sarakstam"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorksheetPickBar;
