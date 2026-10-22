import { useLanguage } from "@/i18n/LanguageContext";
import { SUBLIMATION_MUGS, isSublimationMug, mugPricePair } from "@/lib/sublimationMugs";

const eur = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

/** Shows the unprinted goods price and the printed price (goods + one sublimation surcharge). */
export function MugPricePanel({ source, name }: { source: string; name?: string | null }) {
  const { lang } = useLanguage();
  if (!isSublimationMug(source, name)) return null;
  const n = (name || "").trim().toLocaleLowerCase("lv");
  const seed = SUBLIMATION_MUGS.find((m) => m.name_lv.toLocaleLowerCase("lv") === n || m.name_en.toLowerCase() === n);
  if (!seed) return null;
  const p = mugPricePair(seed.retail_price);
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const row = (label: string, net: number, gross: number) => (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm"><strong className="text-foreground">{eur(net)}</strong> <span className="text-muted-foreground">{t("bez PVN", "excl. VAT")} · {eur(gross)} {t("ar PVN", "incl. VAT")}</span></span>
    </div>
  );
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/30 px-4 py-2 divide-y divide-border" aria-label={t("Krūzes cenas par gabalu", "Mug prices per piece")}>
      {row(t("Bez apdrukas, gab.", "Without print, pc"), p.plainNet, p.plainGross)}
      {row(t("Ar sublimācijas apdruku, gab.", "With sublimation print, pc"), p.printedNet, p.printedGross)}
    </div>
  );
}
