import { Info } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrderMinimum } from "@/lib/orderMinimums";
import { cn } from "@/lib/utils";

export function OrderMinimumNotice(props: { source: string; category?: string | null; name?: string | null; className?: string }) {
  const { lang } = useLanguage();
  const rule = getOrderMinimum(props);
  if (!rule) return null;
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const quantity = (n: number) => <strong className="whitespace-nowrap font-semibold text-foreground">{t(`no ${n} vienībām`, `from ${n} units`)}</strong>;
  return <aside aria-label={t("Pasūtīšanas daudzumi", "Order quantities")} className={cn("border-t border-border py-5", props.className)}>
    <div className="flex items-start gap-3 sm:gap-4">
      <AccentIcon icon={Info} className="h-9 w-9 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed">
        <p className="text-foreground">
          {rule.printedMinimum ? <>{t("Šo preci vari pasūtīt bez apdrukas ", "You can order this item without printing ")}{quantity(rule.minimum)}{t(", bet ar apdruku — ", ", or with printing ")}{quantity(rule.printedMinimum)}.</> : <>{t("Šo preci vari pasūtīt ", "You can order this item ")}{quantity(rule.minimum)}.</>}
        </p>
        {rule.recommended && <p className="text-muted-foreground">{rule.recommended.sameSize ? t(`Izvēloties krāsas un izmērus, iesakām vismaz ${rule.recommended.minimum} vienības katrā krāsas un izmēra kombinācijā.`, `When choosing colours and sizes, we recommend at least ${rule.recommended.minimum} units of each colour and size combination.`) : t(`Katrā izvēlētajā krāsā iesakām pasūtīt vismaz ${rule.recommended.minimum} vienības.`, `We recommend ordering at least ${rule.recommended.minimum} units in each colour you choose.`)}</p>}
      </div>
    </div>
  </aside>;
}
