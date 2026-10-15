import { Info } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrderMinimum, type OrderMinimumKind } from "@/lib/orderMinimums";

const labels: Record<OrderMinimumKind, [string, string]> = {
  textile: ["Tekstils", "Textiles"], promotional: ["Prezentmateriāli", "Promotional items"],
  writing: ["Rakstāmlietas", "Writing instruments"], bags: ["Somas un maisiņi", "Bags"],
  gadgets: ["Gadžeti", "Gadgets"], umbrellas: ["Lietussargi", "Umbrellas"],
  sublimation: ["Sporta formas · sublimācija", "Sportswear · sublimation"],
};
export function OrderMinimumNotice(props: { source: string; category?: string | null; name?: string | null }) {
  const { lang } = useLanguage();
  const rule = getOrderMinimum(props);
  if (!rule) return null;
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const quantity = (n: number) => <span className="whitespace-nowrap font-heading text-base font-bold text-foreground">{t(`no ${n} vienībām`, `from ${n} units`)}</span>;
  return <aside aria-label={t("Pasūtīšanas daudzumi", "Order quantities")} className="rounded-md border border-accent/20 border-l-[3px] border-l-accent bg-accent/5 p-3 sm:p-4">
    <div className="flex items-start gap-3">
      <AccentIcon icon={Info} className="h-9 w-9" />
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-accent">{t(...labels[rule.kind])}</h4>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{t("Pasūtīšanas daudzumi", "Order quantities")}</p>
        <dl className="mt-3 space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"><dt className="text-muted-foreground">{rule.printedMinimum ? t("Bez apdrukas", "Without printing") : t("Pasūtīšana", "Orders")}</dt><dd>{quantity(rule.minimum)}</dd></div>
          {rule.printedMinimum && <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-accent/15 pt-2 text-sm"><dt className="text-muted-foreground">{t("Ar apdruku", "With printing")}</dt><dd>{quantity(rule.printedMinimum)}</dd></div>}
        </dl>
        {rule.recommended && <p className="mt-3 border-t border-accent/15 pt-2 text-xs leading-relaxed text-muted-foreground">{rule.recommended.sameSize ? t(`Ieteicams: vienā krāsā un izmērā no ${rule.recommended.minimum} vienībām.`, `Recommended: at least ${rule.recommended.minimum} units per colour and size.`) : t(`Ieteicams: vienā krāsā no ${rule.recommended.minimum} vienībām.`, `Recommended: at least ${rule.recommended.minimum} units per colour.`)}</p>}
      </div>
    </div>
  </aside>;
}
