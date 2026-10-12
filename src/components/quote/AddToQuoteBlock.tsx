import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SizeQuantityTable } from "./SizeQuantityTable";
import { Check, ClipboardList, Trash2, Plus as PlusIcon } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOffer } from "@/components/quote/CreateOfferButton";

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
  /** Price per size, VAT excluded */
  sizePrices?: Record<string, number>;
  onClose?: () => void;
}

const AddToQuoteBlock = ({
  source, productId, name, code, brand, image, colorCode, colorName, colorHex, sizes, sizePrices, onClose,
}: Props) => {
  const { items, add, updateQty, remove } = useQuoteCart();
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const { create: createOffer, busy: offerBusy } = useCreateOffer();
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
      const g = map.get(key);
      if (!g) continue;
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
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);
  useEffect(() => () => { if (addedTimer.current) window.clearTimeout(addedTimer.current); }, []);

  const confirmAdd = () => {
    if (totalForProduct === 0 || added) return;
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => {
      setAdded(false);
      onClose?.();
    }, 950);
  };

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
  const sumHere = Object.entries(qtyBySize).reduce(
    (a, [size, qty]) => a + (sizePrices?.[size] || 0) * qty,
    0,
  );
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
        unitPrice: sizePrices?.[size] ?? null,
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
    <div className="border-t border-border py-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-base font-black uppercase tracking-wider text-foreground">
            {isAdmin ? t("Izveido piedāvājumu", "Create an offer") : t("Izveido pieprasījumu", "Create a request")}
          </p>
        </div>
        {flash && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            <Check className="h-3 w-3" /> {t("Saglabāts", "Saved")}
          </span>
        )}
      </div>

      {/* Current color header */}
      <div className="flex items-center justify-between gap-2 rounded border border-border bg-background px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          {colorHex && (
            <span className="inline-block h-5 w-5 rounded-sm border border-border" style={{ backgroundColor: colorHex }} />
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

      <SizeQuantityTable rows={(sizes.length ? sizes : ["-"]).map((size) => ({ size, price: sizePrices?.[size] ?? null }))} quantities={qtyBySize} onChange={setSize} />

      {/* Summary of other colors already in cart for this product */}
      {otherGrouped.length > 0 && (
        <div className="rounded border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("Šai precei jau pievienots citās krāsās", "Already added in other colors")}
            </p>
            <button
              type="button"
              onClick={() => { for (const l of otherColorLines) remove(l.id); clearThisColor(); }}
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("Notīrīt visu", "Clear all")}
            </button>
          </div>
          <ul className="space-y-1.5">
            {otherGrouped.map((g) => (
              <li key={g.code} className="flex items-center gap-2 text-xs">
                {g.hex && (
                  <span className="inline-block h-4 w-4 rounded-sm border border-border" style={{ backgroundColor: g.hex }} />
                )}
                <span className="flex-1 truncate">{g.name}</span>
                <span className="font-semibold">
                  {g.lines.map((l) => `${l.size || "—"}×${l.qty}`).join(", ")}
                </span>
                <span className="text-muted-foreground">= {g.qty} {t("gab.", "pcs")}</span>
                <button
                  type="button"
                  aria-label={t(`Dzēst ${g.name}`, `Remove ${g.name}`)}
                  onClick={() => { for (const l of g.lines) remove(l.id); }}
                  className="rounded p-1 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Totals + actions */}
      <div className="flex flex-col gap-2 border-t border-accent/30 pt-3">
        <div className="text-xs">
          <span className="text-muted-foreground">{t("Šai precei kopā:", "Total for this item:")}</span>{" "}
          <span className="font-heading text-base font-black">{totalForProduct}</span>{" "}
          <span className="text-muted-foreground">{t("gab.", "pcs")}</span>
        </div>
        {sumHere > 0 && (
          <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
            <span className="font-heading text-lg font-black text-accent">€{(sumHere * 1.21).toFixed(2)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("ar PVN", "incl. VAT")}
            </span>
            <span className="text-muted-foreground">
              €{sumHere.toFixed(2)} {t("bez PVN", "excl. VAT")}
            </span>
          </div>
        )}



        <div className="mt-1 flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
          <Button
            type="button"
            size="sm"
            disabled={totalForProduct === 0}
            onClick={confirmAdd}
            className={cn(
              "h-auto min-h-9 w-full min-w-0 flex-1 whitespace-normal break-words px-3 py-2 text-center leading-tight bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest transition-transform",
              added && "ring-2 ring-accent ring-offset-2 ring-offset-background scale-[1.02] bg-foreground hover:bg-foreground",
            )}
          >
            {added ? (
              <>
                <Check className="mr-2 h-4 w-4 shrink-0" />
                {isAdmin ? t("Pievienots piedāvājumam", "Added to offer") : t("Pievienots pieprasījumam", "Added to request")}
              </>
            ) : (
              <>
                <PlusIcon className="mr-2 h-4 w-4 shrink-0" />
                {isAdmin ? t("Pievienot piedāvājumam", "Add to offer") : t("Pievienot pieprasījuma sarakstam", "Add to request list")}
              </>
            )}
          </Button>
          {isAdmin ? (
            <Button
              size="sm"
              variant="outline"
              disabled={items.length === 0 || offerBusy}
              onClick={() => createOffer(true)}
              className="h-auto min-h-9 w-full min-w-0 whitespace-normal break-words px-3 py-2 text-center leading-tight font-heading text-xs uppercase tracking-widest sm:w-auto"
            >
              <ClipboardList className="mr-2 h-4 w-4 shrink-0" />
              {t("Izveidot piedāvājumu", "Create offer")}
            </Button>
          ) : (
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled={totalForProduct === 0}
            className="h-auto min-h-9 w-full min-w-0 whitespace-normal break-words px-3 py-2 text-center leading-tight font-heading text-xs uppercase tracking-widest sm:w-auto"
          >
            <Link to="/request">
              <ClipboardList className="mr-2 h-4 w-4 shrink-0" />
              {t("Uz pieprasījumu", "Go to request")}
            </Link>
          </Button>
          )}
        </div>


      </div>
    </div>
  );
};

export default AddToQuoteBlock;
