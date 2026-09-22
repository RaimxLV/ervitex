import { useMemo } from "react";
import { Input } from "@/components/ui/input";
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

  const pickColor = (code?: string | null) => {
    const c = colors.find((x) => x.c === code);
    if (!c) return;
    const price = sizesFor(c.c ?? null).find((s) => s.size === (item.size || "-"))?.price;
    onChange({
      colorName: c.n || null,
      colorHex: c.h || null,
      image: c.u || item.image,
      unitPrice: price ?? item.unitPrice,
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
    <div className="space-y-3">
      {colors.length > 0 && (
        <div>
          <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">Krāsa</span>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
              <button
                key={c.c || c.n}
                type="button"
                title={c.n}
                disabled={disabled}
                onClick={() => pickColor(c.c)}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] disabled:opacity-50 ${
                  (c.n || "") === (item.colorName || "") ? "border-accent" : "border-border"
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-border" style={{ background: c.h || "#ccc" }} />
                {c.n}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground">Izmērs</span>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const active = (item.size || "-") === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickSize(s.size)}
                  title={s.price ? money(s.price) : "cena pēc pieprasījuma"}
                  className={`rounded-sm border px-2.5 py-1 text-[11px] font-semibold disabled:opacity-50 ${
                    active ? "border-accent bg-accent/10" : "border-border"
                  }`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {!sizes.some((s) => (item.size || "-") === s.size) && (
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
