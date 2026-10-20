import { ColorSelector } from "@/components/quote/ColorSelector";
import { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/offer";
import type { WorksheetItem } from "@/lib/worksheet";
import { useVariants } from "./useVariants";
import { pfFindColor } from "@/lib/pfVariantIdentity";

interface Props {
  item: WorksheetItem;
  disabled?: boolean;
  onChange: (changes: Partial<WorksheetItem>) => void;
}

/** Krāsas un izmēra maiņa vienam modelim, ar cenu no kataloga. */
const RowVariantControls = ({ item, disabled, onChange }: Props) => {
  const { colors, sizesFor, loading } = useVariants(item.source, item.productId);
  const isPf = item.source === "pf";
  // PF cenas atslēga ir pilnā krāsa (k); swatch kods c ir SKU attēlam.
  const priceKey = (c?: { c?: string; k?: string } | null) => (isPf ? c?.k : c?.c) ?? null;
  const activeColor = useMemo(
    () => (isPf ? colors[pfFindColor(colors, item)]?.c : colors.find((c) => (c.n || "") === (item.colorName || ""))?.c) ?? null,
    [colors, item, isPf],
  );
  const activeKey = priceKey(colors.find((c) => c.c === activeColor));
  const sizes = useMemo(() => sizesFor(activeKey), [activeKey, sizesFor]);

  // Auto-labojums: ja prece saglabāta ar cenu 0 bet katalogā ir cena, pievieno to automātiski.
  const autofixed = useRef(false);
  useEffect(() => {
    if (disabled || autofixed.current || loading || item.unitPrice) return;
    const match = sizes.find((s) => {
      const want = (item.size || "-").trim().toLowerCase();
      return s.size.toLowerCase() === want || s.raw.toLowerCase() === want;
    });
    if (match?.price) {
      autofixed.current = true;
      onChange({ unitPrice: match.price });
    }
  }, [disabled, loading, sizes, item.unitPrice, item.size, onChange]);
  const isCurrent = (s: { size: string; raw: string }) =>
    (item.size || "-").trim().toLowerCase() === s.size.toLowerCase() ||
    (item.size || "-").trim().toLowerCase() === s.raw.toLowerCase();

  const pickColor = (code?: string | null) => {
    const c = colors.find((x) => x.c === code);
    if (!c) return;
    const match = sizesFor(priceKey(c)).find((s) => isCurrent(s));
    onChange({
      ...(isPf ? { colorKey: c.k || null, sku: (match as { sku?: string | null } | undefined)?.sku ?? null } : {}),
      colorName: c.n || null,
      colorHex: c.h || null,
      colorCode: c.c || null,
      image: c.u || null,
      size: match ? (match.size === "-" ? null : match.size) : item.size,
      unitPrice: match?.price ?? null,
    });
  };

  const pickSize = (size: string) => {
    const hit = sizes.find((s) => s.size === size) as { price: number | null; sku?: string | null } | undefined;
    const price = hit?.price;
    onChange({ ...(isPf ? { sku: hit?.sku ?? null } : {}), size: size === "-" ? null : size, unitPrice: price ?? null });
  };


  if (loading) return <p className="text-[11px] text-muted-foreground">Ielādē krāsas un izmērus…</p>;

  if (colors.length === 0 && sizes.length === 0) {
    return (
      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Izmērs</span>
        <Input value={item.size || ""} disabled={disabled} onChange={(e) => onChange({ size: e.target.value })} />
      </label>
    );
  }

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">Krāsa</span>
          <ColorSelector colors={colors.map((c, index) => ({ code: c.c || String(index), name: c.n || c.c || "—", hex: c.h }))} value={activeColor} disabled={disabled} onChange={pickColor} />
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">Izmērs</span>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const active = isCurrent(s);
              return (
                <Button
                  key={s.size}
                  type="button"
                  disabled={disabled}
                  variant="outline"
                  size="sm"
                  aria-pressed={active}
                  onClick={() => pickSize(s.size)}
                  title={s.price ? money(s.price) : "cena pēc pieprasījuma"}
                  className={`h-9 min-w-10 rounded-sm px-3 text-xs font-semibold disabled:opacity-50 ${
                    active ? "border-accent bg-accent/10 text-foreground" : "border-border"
                  }`}
                >
                  {s.size}
                </Button>
              );
            })}
          </div>
          {!sizes.some((s) => isCurrent(s)) && (
            <p className="mt-1.5 text-[11px] font-semibold text-destructive">
              Izmērs {item.size || "—"} šim modelim nav pieejams — izvēlies citu.
            </p>
          )}

        </div>
      )}
    </div>
  );
};

export default RowVariantControls;
