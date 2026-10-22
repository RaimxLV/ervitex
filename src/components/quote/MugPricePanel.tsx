import { useLanguage } from "@/i18n/LanguageContext";
import { approvedMugSeed, mugPricePair } from "@/lib/sublimationMugs";

const eur = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

/** Only the four reviewed mug IDs: unprinted goods price (actual retail row) and printed = goods + one surcharge. */
export function MugPricePanel({ source, id, retail, draft }: { source: string; id: string; retail: number | null; draft?: boolean }) {
  const { lang } = useLanguage();
  const seed = approvedMugSeed(source, id);
  if (!seed) return null;
  const p = mugPricePair(retail ?? seed.retail_price);
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const row = (label: string, net: number, gross: number) => (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm"><strong className="text-foreground">{eur(net)}</strong> <span className="text-muted-foreground">{t("bez PVN", "excl. VAT")} · {eur(gross)} {t("ar PVN", "incl. VAT")}</span></span>
    </div>
  );
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/30 px-4 py-2 divide-y divide-border" aria-label={t("Krūzes cenas par gabalu", "Mug prices per piece")}>
      {draft && <p className="py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">{t("Melnraksts — klientiem nav redzams", "Draft — hidden from customers")}</p>}
      {row(t("Bez apdrukas, gab.", "Without print, pc"), p.plainNet, p.plainGross)}
      {row(t("Ar sublimācijas apdruku, gab.", "With sublimation print, pc"), p.printedNet, p.printedGross)}
    </div>
  );
}
