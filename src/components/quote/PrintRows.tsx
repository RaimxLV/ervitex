import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import type { OfferPrint } from "@/lib/orderPrinting";

const METHODS = ["Sietspiede", "DTF", "Termodruka", "Izšūšana", "Sublimācija", "Cita"];
export function PrintRows({ value, onChange, priced = true, addLabel }: { value: OfferPrint[]; onChange: (value: OfferPrint[]) => void; priced?: boolean; addLabel?: string }) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  return <div className="space-y-3">
    {value.map((p, index) => {
      const patch = (change: Partial<OfferPrint>) => onChange(value.map((line, n) => n === index ? { ...line, ...change } : line));
      return <div key={index} className={`grid items-end gap-3 ${priced ? "grid-cols-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_95px_40px]" : "grid-cols-[minmax(0,1fr)_40px] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]"}`}>
        <label className="space-y-2"><span className="quote-label">{t("Apdrukas veids", "Print method")}</span><Select value={p.method} onValueChange={(method) => patch({ method })}><SelectTrigger aria-label={t("Apdrukas veids", "Print method")}><SelectValue /></SelectTrigger><SelectContent>{METHODS.map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent></Select></label>
        <label className={priced ? "space-y-2" : "col-start-1 row-start-2 space-y-2 sm:col-start-auto sm:row-start-auto"}><span className="quote-label">{t("Vieta", "Placement")}</span><Input aria-label={t("Apdrukas vieta", "Print placement")} value={p.placement || ""} onChange={(e) => patch({ placement: e.target.value })} /></label>
        {priced && <><label className="space-y-2"><span className="quote-label">{t("Cena bez PVN", "Price excl. VAT")}</span><DecimalInput aria-label="Apdrukas cena bez PVN" value={p.price} onValueChange={(price) => patch({ price })} placeholder="0,00" /></label><label className="space-y-2"><span className="quote-label">{t("Aprēķins", "Pricing")}</span><Select value={p.mode || "unit"} onValueChange={(mode) => patch({ mode: mode as "unit" | "total" })}><SelectTrigger aria-label="Apdrukas cenas aprēķins"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unit">{t("Par gab.", "Per unit")}</SelectItem><SelectItem value="total">{t("Kopā", "Total")}</SelectItem></SelectContent></Select></label></>}
        <Button type="button" variant="ghost" size="icon" aria-label={t("Dzēst apdruku", "Remove print")} onClick={() => onChange(value.filter((_, n) => n !== index))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </div>;
    })}
    <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { method: "Sietspiede", placement: "", price: null, mode: "unit" }])}><Plus className="h-4 w-4" />{addLabel || t("Pievienot apdruku", "Add decoration")}</Button>
  </div>;
}