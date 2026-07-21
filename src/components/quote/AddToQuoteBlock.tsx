import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus, ClipboardList, Trash2 } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  source: string;
  productId: string;
  name: string;
  code: string;
  brand: string | null;
  image: string | null;
  colorCode: string | null;
  colorName: string | null;
  colorHex: string | null;
  sizes: string[];
}

const AddToQuoteBlock = ({
  source, productId, name, code, brand, image, colorCode, colorName, colorHex, sizes,
}: Props) => {
  const { items, add, updateQty, remove } = useQuoteCart();
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  // Cart lines for THIS product+color (drive the quantity inputs)
  const currentLines = useMemo(
    () => items.filter((i) => i.productId === productId && i.colorCode === colorCode),
    [items, productId, colorCode],
  );

  // Cart lines for THIS product but OTHER colors (summary section)
  const otherColorLines = useMemo(
    () => items.filter((i) => i.productId === productId && i.colorCode !== colorCode),
    [items, productId, colorCode],
  );

  const otherGrouped = useMemo(() => {
    const map = new Map<string, { name: string; hex: string | null; qty: number; lines: typeof items }>();
    for (const it of otherColorLines) {
      const key = it.colorCode || "-";
      if (!map.has(key)) map.set(key, { name: it.colorName || "-", hex: it.colorHex, qty: 0, lines: [] });
      const g = map.get(key)!;
      g.qty += it.qty;
      g.lines.push(it);
    }
    return [...map.entries()].map(([k, v]) => ({ code: k, ...v }));
  }, [otherColorLines]);

  // Build a size -> id map from existing cart lines
  const idBySize = useMemo(() => {
    const m: Record<string, string> = {};
    for (const l of currentLines) m[l.size || "-"] = l.id;
    return m;
  }, [currentLines]);

  const readCartQtys = () => {
    const src = sizes.length ? sizes : ["-"];
    return Object.fromEntries(
      src.map((s) => [s, currentLines.find((l) => (l.size || "-") === s)?.qty || 0]),
    ) as Record<string, number>;
  };

  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>(readCartQtys);
  const [flash, setFlash] = useState(false);

  // Re-sync inputs when color or product changes (preserving what user already saved for that color)
  const syncKey = `${productId}|${colorCode}|${sizes.join(",")}`;
  const prevKey = useRef(syncKey);
  useEffect(() => {
    if (prevKey.current !== syncKey) {
      prevKey.current = syncKey;
      setQtyBySize(readCartQtys());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncKey]);

  const totalHere = Object.values(qtyBySize).reduce((a, b) => a + b, 0);
  const totalOther = otherColorLines.reduce((a, l) => a + l.qty, 0);
  const totalForProduct = totalHere + totalOther;

  const setSize = (size: string, next: number) => {
    const qty = Math.max(0, next);
    setQtyBySize((prev) => ({ ...prev, [size]: qty }));

    // Auto-sync to cart immediately so state persists across color/product switches
    const existingId = idBySize[size];
    const cartSize = size === "-" ? null : size;
    if (existingId) {
      if (qty === 0) remove(existingId);
      else updateQty(existingId, qty);
    } else if (qty > 0) {
      add({
        source, productId, name, code, brand, image,
        colorCode, colorName, colorHex,
        size: cartSize, qty,
      });
    }
    setFlash(true);
    window.clearTimeout((setSize as any)._t);
    (setSize as any)._t = window.setTimeout(() => setFlash(false), 900);
  };

  const clearThisColor = () => {
    for (const l of currentLines) remove(l.id);
    setQtyBySize(Object.fromEntries((sizes.length ? sizes : ["-"]).map((s) => [s, 0])));
  };

  return (
    <div className="rounded-md border-2 border-accent/60 bg-accent/5 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-sm font-black uppercase tracking-wider text-foreground">
          {t("Pievieno pieprasījumam", "Add to request")}
        </p>
        {flash && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            <Check className="h-3 w-3" /> {t("Saglabāts", "Saved")}
          </span>
        )}
      </div>

      {/* Current color header */}
      <div className="flex items-center justify-between gap-2 rounded border border-border bg-background px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {colorHex && (
            <span className="inline-block h-5 w-5 rounded-full border border-black/20" style={{ backgroundColor: colorHex }} />
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wider">
              {colorName || t("Krāsa", "Color")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("Šajā krāsā", "In this color")}: <span className="font-semibold text-foreground">{totalHere} {t("gab.", "pcs")}</span>
            </p>
          </div>
        </div>
        {totalHere > 0 && (
          <button
            type="button"
            onClick={clearThisColor}
            className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> {t("Notīrīt", "Clear")}
          </button>
        )}
      </div>

      {sizes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {sizes.map((s) => {
            const v = qtyBySize[s] || 0;
            return (
              <div
                key={s}
                className={`flex flex-col items-center rounded border p-1.5 transition-colors ${
                  v > 0 ? "border-accent bg-accent/10" : "border-border bg-background"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s}</span>
                <div className="mt-1 flex w-full items-center">
                  <button
                    type="button"
                    onClick={() => setSize(s, v - 1)}
                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                    disabled={v <= 0}
                    aria-label="decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={v || ""}
                    onChange={(e) => setSize(s, parseInt(e.target.value) || 0)}
                    className="h-7 w-full border-0 bg-transparent p-0 text-center text-sm font-bold focus-visible:ring-0"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setSize(s, v + 1)}
                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label="increase"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSize("-", (qtyBySize["-"] || 0) - 1)}
            className="flex h-9 w-9 items-center justify-center rounded border border-border"
          >
            <Minus className="h-4 w-4" />
          </button>
          <Input
            type="number"
            min={0}
            value={qtyBySize["-"] || ""}
            onChange={(e) => setSize("-", parseInt(e.target.value) || 0)}
            className="h-9 text-center font-bold"
            placeholder="0"
          />
          <button
            type="button"
            onClick={() => setSize("-", (qtyBySize["-"] || 0) + 1)}
            className="flex h-9 w-9 items-center justify-center rounded border border-border"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary of other colors already in cart for this product */}
      {otherGrouped.length > 0 && (
        <div className="rounded border border-border bg-background p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("Šai precei jau pievienots citās krāsās", "Already added in other colors")}
          </p>
          <ul className="space-y-1.5">
            {otherGrouped.map((g) => (
              <li key={g.code} className="flex items-center gap-2 text-xs">
                {g.hex && (
                  <span className="inline-block h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: g.hex }} />
                )}
                <span className="flex-1 truncate">{g.name}</span>
                <span className="font-semibold">
                  {g.lines.map((l) => `${l.size || "—"}×${l.qty}`).join(", ")}
                </span>
                <span className="text-muted-foreground">= {g.qty} {t("gab.", "pcs")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Totals + go-to-request CTA */}
      <div className="flex flex-col gap-2 border-t border-accent/30 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs">
          <span className="text-muted-foreground">{t("Šai precei kopā:", "Total for this item:")}</span>{" "}
          <span className="font-heading text-base font-black">{totalForProduct}</span>{" "}
          <span className="text-muted-foreground">{t("gab.", "pcs")}</span>
        </div>
        <Button
          asChild
          size="sm"
          disabled={totalForProduct === 0}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest"
        >
          <Link to="/request">
            <ClipboardList className="mr-2 h-4 w-4" />
            {t("Uz pieprasījumu", "Go to request")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AddToQuoteBlock;
