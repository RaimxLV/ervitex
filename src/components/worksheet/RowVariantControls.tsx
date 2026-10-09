import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/offer";
import type { WorksheetItem } from "@/lib/worksheet";
import { useVariants } from "./useVariants";

interface Props {
  item: WorksheetItem;
  disabled?: boolean;
  onChange: (changes: Partial<WorksheetItem>) => void;
}

/** Krāsas un izmēra maiņa vienam modelim, ar cenu no kataloga. */
const RowVariantControls = ({ item, disabled, onChange }: Props) => {
  const { colors, sizesFor, loading } = useVariants(item.source, item.productId);
  const activeColor = useMemo(
    () => colors.find((c) => (c.n || "") === (item.colorName || ""))?.c ?? null,
    [colors, item.colorName],
  );
  const sizes = useMemo(() => sizesFor(activeColor), [activeColor, sizesFor]);
  const isCurrent = (s: { size: string; raw: string }) =>
    (item.size || "-").trim().toLowerCase() === s.size.toLowerCase() ||
    (item.size || "-").trim().toLowerCase() === s.raw.toLowerCase();

  const pickColor = (code?: string | null) => {
    const c = colors.find((x) => x.c === code);
    if (!c) return;
    const match = sizesFor(c.c ?? null).find((s) => isCurrent(s));
    onChange({
      colorName: c.n || null,
      colorHex: c.h || null,
      image: c.u || item.image,
      size: match ? (match.size === "-" ? null : match.size) : item.size,
      unitPrice: match?.price ?? item.unitPrice,
    });
  };

  const pickSize = (size: string) => {
    const price = sizes.find((s) => s.size === size)?.price;
    onChange({ size: size === "-" ? null : size, unitPrice: price ?? item.unitPrice });
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
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
              <Button
                key={c.c || c.n}
                type="button"
                title={c.n}
                disabled={disabled}
                variant="outline"
                size="sm"
                aria-pressed={(c.n || "") === (item.colorName || "")}
                onClick={() => pickColor(c.c)}
                className={`h-auto min-h-9 max-w-full gap-2 whitespace-normal rounded-sm px-3 py-2 text-left text-xs disabled:opacity-50 ${
                  (c.n || "") === (item.colorName || "") ? "border-accent bg-accent/10 text-foreground" : "border-border"
                }`}
              >
                <span className="h-3 w-3 shrink-0 rounded-full border border-border bg-muted" style={c.h ? { background: c.h } : undefined} />
                {c.n}
              </Button>
            ))}
          </div>
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
