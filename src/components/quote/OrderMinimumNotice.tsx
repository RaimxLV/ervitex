import { Package } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrderMinimum } from "@/lib/orderMinimums";
import { cn } from "@/lib/utils";

export function OrderMinimumNotice(props: { source: string; category?: string | null; name?: string | null; className?: string }) {
  const { lang } = useLanguage();
  const rule = getOrderMinimum(props);
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  return <aside aria-label={t("Pasūtījuma daudzums", "Order quantity")} className={cn("order-notice rounded-md p-5 sm:p-6", props.className)}>
    <div className="mb-3 flex items-center gap-2.5">
      <Package aria-hidden="true" className="order-notice-icon h-5 w-5 shrink-0" strokeWidth={1.5} />
      <h3 className="text-base font-semibold">{t("Pasūtījuma daudzums", "Order quantity")}</h3>
    </div>
    <div className="order-notice-muted space-y-3 text-sm leading-relaxed">
      {rule.printedMinimum ? <div className="order-notice-thresholds grid grid-cols-1 gap-3 sm:grid-cols-2">
        <p>{t(`Bez apdrukas — no ${rule.minimum} vienībām`, `Without printing — from ${rule.minimum} units`)}</p>
        <p>{t(`Ar apdruku — no ${rule.printedMinimum} vienībām`, `With printing — from ${rule.printedMinimum} units`)}</p>
      </div> : <p>{t(`Pasūtījums no ${rule.minimum} vienībām.`, `Orders from ${rule.minimum} units.`)}</p>}
      {rule.recommended && <p>{rule.recommended.sameSize ? t(`Ieteicamais daudzums — vismaz ${rule.recommended.minimum} vienības katrā krāsas un izmēra kombinācijā.`, `Recommended quantity — at least ${rule.recommended.minimum} units in each colour and size combination.`) : t(`Ieteicamais daudzums — vismaz ${rule.recommended.minimum} vienības vienā krāsā.`, `Recommended quantity — at least ${rule.recommended.minimum} units per colour.`)}</p>}
    </div>
  </aside>;
}
