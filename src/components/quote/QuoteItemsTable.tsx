import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { money, itemPrintNet, type OfferItem } from "@/lib/offer";
import { useLanguage } from "@/i18n/LanguageContext";

export function QuoteItemsTable({ items, onQuantity, onRemove, onPrice, groupAction, itemDetails }: {
  items: OfferItem[]; onQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
  onPrice?: (id: string, price: number | null) => void; groupAction?: (item: OfferItem) => ReactNode; itemDetails?: (item: OfferItem) => ReactNode;
  onGroupSelect?: (item: OfferItem) => void;
}) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const groups = new Map<string, OfferItem[]>();
  for (const i of items) { const key = `${i.source}|${i.productId}|${i.colorName || ""}`; groups.set(key, [...(groups.get(key) || []), i]); }
  return <div className="divide-y divide-border border-t border-border">{[...groups.entries()].map(([key, group]) => {
    const head = group[0];
    return <article key={key} className="py-5 sm:py-6">
      <div className="mb-4 flex items-start gap-4">
        {head.image && <img src={head.image} alt={head.name} loading="lazy" className="h-20 w-20 shrink-0 border border-border bg-background object-contain p-1" />}
        <div className="min-w-0 flex-1"><h3 className="break-words text-base font-semibold leading-snug">{head.name}</h3><p className="mt-1 font-mono text-sm text-muted-foreground">{head.code}</p><p className="mt-2 flex items-center gap-2 text-sm">{head.colorHex && <span className="h-4 w-4 shrink-0 rounded-sm border border-border" style={{ backgroundColor: head.colorHex }} />}{head.colorName || "—"}</p>{groupAction?.(head)}</div>
      </div>
      <div className="grid grid-cols-[50px_64px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 bg-muted/50 px-2 py-3 text-[11px] font-semibold text-muted-foreground sm:grid-cols-[70px_80px_minmax(0,1fr)_minmax(0,1fr)_40px] sm:gap-3 sm:px-3"><span>{t("Izmērs", "Size")}</span><span className="text-center">{t("Skaits", "Qty")}</span><span>{t("Cena bez PVN", "Price excl. VAT")}</span><span className="text-right">{t("Summa bez PVN", "Total excl. VAT")}</span><span /></div>
      {group.map((i) => <div key={i.id}><div className="grid grid-cols-[50px_64px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 border-t border-border px-2 py-3 text-sm tabular-nums sm:grid-cols-[70px_80px_minmax(0,1fr)_minmax(0,1fr)_40px] sm:gap-3 sm:px-3">
        <span className="break-words font-semibold">{i.size || "—"}</span><Input aria-label={`Skaits ${i.code} ${i.size || ""}`} type="number" min={1} step={1} inputMode="numeric" value={i.qty} onChange={(e) => onQuantity(i.id, Math.max(1, Math.floor(Number(e.target.value) || 1)))} className="px-1 text-center" />
        {onPrice ? <DecimalInput aria-label={`Cena ${i.code} ${i.size || ""}`} value={i.unitPrice} onValueChange={(v) => onPrice(i.id, v)} className="min-w-0 px-2" /> : <span className="break-words">{i.unitPrice ? money(i.unitPrice) : "—"}</span>}
        <span className="break-words text-right font-semibold">{i.unitPrice || itemPrintNet(i) ? money((i.unitPrice || 0) * i.qty + itemPrintNet(i)) : "—"}</span><Button type="button" variant="ghost" size="icon" aria-label={`Dzēst ${i.code} ${i.size || ""}`} onClick={() => onRemove(i.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>{itemDetails && <div className="border-t border-border px-2 py-3 sm:px-3">{itemDetails(i)}</div>}</div>)}
    </article>;
  })}</div>;
}