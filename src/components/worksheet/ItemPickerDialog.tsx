import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/offer";
import type { WorksheetItem } from "@/lib/worksheet";
import { fetchVariantPrices, sizeIdx, useCatalogSearch, type CatalogHit, type VariantPrice } from "./useVariants";
import { Loader2, Plus, Repeat, Search } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** "add" — pievieno jaunas rindas; "swap" — nomaina modeli esošajām rindām */
  mode: "add" | "swap";
  /** Rinda, ko nomaina (mode="swap") */
  target?: WorksheetItem | null;
  onAdd?: (items: WorksheetItem[]) => void;
  onSwap?: (next: {
    source: string;
    productId: string;
    name: string;
    code: string;
    brand: string | null;
    image: string | null;
    colorName: string | null;
    colorHex: string | null;
    priceBySize: Map<string, number | null>;
  }) => void;
}

const ItemPickerDialog = ({ open, onOpenChange, mode, target, onAdd, onSwap }: Props) => {
  const [q, setQ] = useState("");
  const { hits, searching } = useCatalogSearch(q);
  const [picked, setPicked] = useState<CatalogHit | null>(null);
  const [prices, setPrices] = useState<VariantPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) {
      setQ("");
      setPicked(null);
      setPrices([]);
      setColor(null);
      setQtyBySize({});
    }
  }, [open]);

  const pick = async (hit: CatalogHit) => {
    setPicked(hit);
    setQtyBySize({});
    setColor(hit.colors?.[0]?.c ?? null);
    setLoadingPrices(true);
    const rows = await fetchVariantPrices(hit.source, hit.id);
    setPrices(rows);
    setLoadingPrices(false);
  };

  const colorRows = useMemo(() => (picked?.colors || []).filter((c) => c?.n || c?.c), [picked]);

  const sizeRows = useMemo(() => {
    const forColor = prices.filter((p) => !color || !p.color_code || p.color_code === color);
    const map = new Map<string, number | null>();
    for (const p of forColor.length ? forColor : prices) {
      const s = p.size || "-";
      const price = Number(p.retail_price);
      if (!map.has(s) || (map.get(s) ?? 0) < price) map.set(s, Number.isFinite(price) && price > 0 ? price : null);
    }
    if (map.size === 0) map.set("-", null);
    return [...map.entries()]
      .map(([size, price]) => ({ size, price }))
      .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
  }, [prices, color]);

  const chosen = colorRows.find((c) => c.c === color) || colorRows[0] || null;

  const confirm = () => {
    if (!picked) return;
    if (mode === "swap") {
      onSwap?.({
        source: picked.source,
        productId: picked.id,
        name: picked.name,
        code: picked.id,
        brand: picked.brand,
        image: chosen?.u || picked.image_url || null,
        colorName: chosen?.n || null,
        colorHex: chosen?.h || null,
        priceBySize: new Map(sizeRows.map((r) => [r.size, r.price])),
      });
      onOpenChange(false);
      return;
    }
    const lines: WorksheetItem[] = sizeRows
      .filter((r) => (qtyBySize[r.size] || 0) > 0)
      .map((r) => ({
        id: `${picked.source}-${picked.id}-${chosen?.c || "x"}-${r.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        source: picked.source,
        productId: picked.id,
        name: picked.name,
        code: picked.id,
        brand: picked.brand,
        image: chosen?.u || picked.image_url || null,
        colorName: chosen?.n || null,
        colorHex: chosen?.h || null,
        size: r.size === "-" ? null : r.size,
        qty: qtyBySize[r.size],
        unitPrice: r.price ?? null,
        prints: [],
      }));
    if (lines.length === 0) return;
    onAdd?.(lines);
    onOpenChange(false);
  };

  const canConfirm = !!picked && (mode === "swap" || sizeRows.some((r) => (qtyBySize[r.size] || 0) > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-black uppercase tracking-wide">
            {mode === "swap" ? "Mainīt modeli" : "Pievienot preci"}
          </DialogTitle>
        </DialogHeader>

        {mode === "swap" && target && (
          <p className="rounded-sm border border-border bg-muted/40 p-2 text-xs">
            {[target.name, target.colorName, target.size, `${target.qty} gab.`].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nosaukums vai kods" />
        </div>

        {searching && <p className="text-xs text-muted-foreground">Meklē…</p>}

        {hits.length > 0 && (
          <div className="max-h-56 divide-y divide-border overflow-y-auto rounded-sm border border-border">
            {hits.map((h) => (
              <button
                key={`${h.source}-${h.id}`}
                type="button"
                onClick={() => pick(h)}
                className={`flex w-full items-center gap-3 p-2 text-left hover:bg-muted ${picked?.id === h.id && picked?.source === h.source ? "bg-muted" : ""}`}
              >
                {h.image_url && <img src={h.image_url} alt="" loading="lazy" className="h-10 w-10 rounded-sm object-contain" />}
                <span className="min-w-0">
                  <span className="block truncate text-sm">{h.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{h.id} · {h.brand || h.source.toUpperCase()}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {picked && (
          <div className="rounded-sm border border-border p-3">
            <p className="text-sm font-medium">{picked.name} <span className="text-muted-foreground">({picked.id})</span></p>

            {colorRows.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {colorRows.map((c) => (
                  <button
                    key={c.c || c.n}
                    type="button"
                    title={c.n}
                    onClick={() => setColor(c.c ?? null)}
                    className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${color === c.c ? "border-accent" : "border-border"}`}
                  >
                    <span className="h-3 w-3 rounded-full border border-border" style={{ background: c.h || "#ccc" }} />
                    {c.n}
                  </button>
                ))}
              </div>
            )}

            {loadingPrices ? (
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Ielādē izmērus…</p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {sizeRows.map((r) => (
                  <div key={r.size} className="rounded-sm border border-border p-2">
                    <p className="text-xs font-semibold">{r.size}</p>
                    <p className="text-[11px] text-muted-foreground">{r.price ? money(r.price) : "cena pēc pieprasījuma"}</p>
                    {mode === "add" && (
                      <Input
                        type="number"
                        min={0}
                        className="mt-1 h-8"
                        value={qtyBySize[r.size] ?? ""}
                        onChange={(e) => setQtyBySize({ ...qtyBySize, [r.size]: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button onClick={confirm} disabled={!canConfirm}>
          {mode === "swap" ? <Repeat className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {mode === "swap" ? "Nomainīt" : "Pievienot"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ItemPickerDialog;
