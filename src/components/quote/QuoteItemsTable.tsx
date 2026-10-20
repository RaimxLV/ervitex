import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecimalInput } from "@/components/ui/decimal-input";
import { QtyStepper } from "@/components/quote/QtyStepper";
import { money, itemPrintNet, itemDiscountNet, itemDiscountPercent, itemTotalNet, type OfferItem } from "@/lib/offer";
import { useLanguage } from "@/i18n/LanguageContext";
import { offerGroupKey } from "@/lib/requestPresentation";

export function QuoteItemsTable({ items, onQuantity, onRemove, onPrice, onDiscount, groupAction, itemDetails, onGroupSelect, disabled = false }: {
  items: OfferItem[]; onQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
  onPrice?: (id: string, price: number | null) => void; groupAction?: (item: OfferItem) => ReactNode; itemDetails?: (item: OfferItem) => ReactNode;
  onGroupSelect?: (item: OfferItem) => void;
  onDiscount?: (id: string, percent: number | null) => void;
  disabled?: boolean;
}) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const showDiscounts = !!onDiscount || items.some((i) => itemDiscountPercent(i) > 0);
  const grid = showDiscounts
    ? "grid grid-cols-[50px_64px_minmax(85px,1fr)_70px_85px_minmax(90px,1fr)_36px] items-center gap-2 sm:gap-3"
    : "grid grid-cols-[50px_64px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-2 sm:grid-cols-[70px_80px_minmax(0,1fr)_minmax(0,1fr)_40px] sm:gap-3";
  const groups = new Map<string, OfferItem[]>();
  for (const i of items) { const key = offerGroupKey(i); groups.set(key, [...(groups.get(key) || []), i]); }
  return <div className="divide-y divide-border border-t border-border">{[...groups.entries()].map(([key, group]) => {
    const head = group[0];
    return <article key={key} className="py-5 sm:py-6">
      <div className="mb-4 flex items-start gap-4">
        {head.image && <img src={head.image} alt={head.name} loading="lazy" className="h-20 w-20 shrink-0 border border-border bg-background object-contain p-1" />}
        <div className="min-w-0 flex-1">{onGroupSelect ? <Button type="button" variant="ghost" className="h-auto max-w-full justify-start whitespace-normal px-0 py-1 text-left text-base font-semibold" onClick={() => onGroupSelect(head)}>{head.name}</Button> : <h3 className="break-words text-base font-semibold leading-snug">{head.name}</h3>}<p className="mt-1 font-mono text-sm text-muted-foreground">{head.code}</p><p className="mt-2 flex items-center gap-2 text-sm">{head.colorHex && <span className="h-4 w-4 shrink-0 rounded-sm border border-border" style={{ backgroundColor: head.colorHex }} />}{head.colorName || "—"}</p>{groupAction?.(head)}</div>
      </div>
      <div className="max-w-full overflow-x-auto"><div className={showDiscounts ? "min-w-[560px]" : ""}>
      <div className={`${grid} bg-muted/50 px-2 py-3 text-[11px] font-semibold text-muted-foreground sm:px-3`}><span>{t("Izmērs", "Size")}</span><span className="text-center">{t("Skaits", "Qty")}</span><span>{t("Cena bez PVN", "Price excl. VAT")}</span>{showDiscounts && <><span>{t("Atlaide %", "Discount %")}</span><span className="text-right">{t("Atlaide €", "Discount €")}</span></>}<span className="text-right">{t("Summa bez PVN", "Total excl. VAT")}</span><span /></div>
      {group.map((i) => <div key={i.id}><div className={`${grid} border-t border-border bg-card px-2 py-3 text-sm tabular-nums sm:px-3`}>
        <span className="break-words font-semibold">{i.size || "—"}</span><QtyStepper disabled={disabled} ariaLabel={`Skaits ${i.code} ${i.size || ""}`} value={i.qty} min={1} className="w-16 justify-self-center" onChange={(qty) => onQuantity(i.id, Math.max(1, qty))} />
        {onPrice ? <DecimalInput aria-label={`Cena ${i.code} ${i.size || ""}`} value={i.unitPrice} onValueChange={(v) => onPrice(i.id, v)} className="min-w-0 px-2" /> : <span className="break-words">{i.unitPrice ? money(i.unitPrice) : "—"}</span>}
        {showDiscounts && <>{onDiscount ? <DecimalInput aria-label={`Atlaide % ${i.code} ${i.size || ""}`} value={i.discountPercent ?? null} placeholder="0" onValueChange={(v) => onDiscount(i.id, v === null ? null : Math.min(100, Math.max(0, v)))} className="min-w-0 px-2 text-right" /> : <span>{itemDiscountPercent(i)}%</span>}<span className="break-words text-right text-accent">{money(itemDiscountNet(i))}</span></>}
        <span className="break-words text-right font-semibold">{i.unitPrice || itemPrintNet(i) ? money(itemTotalNet(i)) : "—"}</span><Button disabled={disabled} type="button" variant="ghost" size="icon" aria-label={`Dzēst ${i.code} ${i.size || ""}`} onClick={() => onRemove(i.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>{itemDetails && <div className="border-t border-border bg-card px-2 py-3 sm:px-3">{itemDetails(i)}</div>}</div>)}
      </div></div>
    </article>;
  })}</div>;
}