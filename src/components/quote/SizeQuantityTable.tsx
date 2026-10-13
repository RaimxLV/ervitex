import { money } from "@/lib/offer";
import { QtyStepper } from "@/components/quote/QtyStepper";
import { useLanguage } from "@/i18n/LanguageContext";

export function SizeQuantityTable({ rows, quantities, onChange, readOnly = false }: {
  rows: { size: string; price: number | null }[]; quantities: Record<string, number>;
  onChange: (size: string, qty: number) => void; readOnly?: boolean;
}) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  return <div className="border-y border-border">
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px_minmax(0,1fr)] items-center gap-2 bg-muted/50 px-2 py-3 text-[11px] font-semibold text-muted-foreground sm:px-3">
      <span>{t("Izmērs", "Size")}</span><span>{t("Cena bez PVN", "Price excl. VAT")}</span><span className="text-center">{t("Skaits", "Qty")}</span><span className="text-right">{t("Summa", "Total")}</span>
    </div>
    {rows.map(({ size, price }) => <div key={size} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_80px_minmax(0,1fr)] items-center gap-2 border-t border-border bg-card px-2 py-2 text-xs tabular-nums sm:px-3">
      <span className="font-semibold">{size === "-" ? "—" : size}</span><span>{price ? money(price) : "—"}</span>
      {readOnly ? <span className="text-center">{quantities[size] || "—"}</span> : <QtyStepper ariaLabel={`Skaits izmēram ${size}`} value={quantities[size]} min={0} className="w-20 justify-self-center" onChange={(qty) => onChange(size, qty)} />}
      <span className="text-right font-semibold">{price && quantities[size] ? money(price * quantities[size]) : "—"}</span>
    </div>)}
  </div>;
}