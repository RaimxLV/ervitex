import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrderMinimum } from "@/lib/orderMinimums";
import { cn } from "@/lib/utils";

export function OrderMinimumNotice(props: { source: string; category?: string | null; name?: string | null; className?: string }) {
  const { lang } = useLanguage();
  const rule = getOrderMinimum(props);
  if (!rule) return null;
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const quantity = (n: number) => <strong className="whitespace-nowrap font-semibold text-accent">{t(`no ${n} vienībām`, `from ${n} units`)}</strong>;
  return <aside aria-label={t("Pasūtīšanas daudzumi", "Order quantities")} className={cn("order-notice relative overflow-hidden rounded-2xl p-5 sm:p-6", props.className)}>
    <div className="relative flex items-start gap-3.5 sm:gap-4">
      <span className="order-notice-icon mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <AlertCircle aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed">
        <p>
          {rule.printedMinimum ? <>{t("Šo preci vari pasūtīt bez apdrukas ", "You can order this item without printing ")}{quantity(rule.minimum)}{t(", bet ar apdruku — ", ", or with printing ")}{quantity(rule.printedMinimum)}.</> : <>{t("Šo preci vari pasūtīt ", "You can order this item ")}{quantity(rule.minimum)}.</>}
        </p>
        {rule.recommended && <p className="order-notice-muted">{rule.recommended.sameSize ? t(`Izvēloties krāsas un izmērus, iesakām vismaz ${rule.recommended.minimum} vienības katrā krāsas un izmēra kombinācijā.`, `When choosing colours and sizes, we recommend at least ${rule.recommended.minimum} units of each colour and size combination.`) : t(`Katrā izvēlētajā krāsā iesakām pasūtīt vismaz ${rule.recommended.minimum} vienības.`, `We recommend ordering at least ${rule.recommended.minimum} units in each colour you choose.`)}</p>}
      </div>
    </div>
  </aside>;
}
