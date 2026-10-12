import { Palette, ListOrdered, Send, ChevronRight } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";
import { useLanguage } from "@/i18n/LanguageContext";

export const QuoteSteps = ({ offer = false }: { offer?: boolean }) => {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const steps = [
    { icon: Palette, title: t("Izvēlies krāsu", "Choose a colour") },
    { icon: ListOrdered, title: t("Daudzumu un skaitu", "Quantity and count") },
    { icon: Send, title: offer ? t("Nosūtīt piedāvājumu", "Send offer") : t("Nosūtīt pieprasījumu", "Send request") },
  ];
  return <ol aria-label={t("Trīs vienkārši soļi", "Three simple steps")} className="grid grid-cols-3 gap-2 border-y border-border py-4 sm:gap-4">
    {steps.map((step, index) => <li key={index} className="relative flex min-w-0 flex-col items-center gap-2 px-1 text-center">
      <span className="relative inline-flex">
        <AccentIcon icon={step.icon} />
        <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-accent text-[10px] font-bold leading-none text-accent-foreground">{index + 1}</span>
      </span>
      <p className="max-w-[10rem] break-words text-xs font-semibold leading-snug text-foreground"><span className="sr-only">{index + 1}. </span>{step.title}</p>
      {index < steps.length - 1 && <ChevronRight aria-hidden="true" strokeWidth={1.5} className="absolute -right-3 top-4 h-4 w-4 text-muted-foreground/50 sm:-right-4" />}
    </li>)}
  </ol>;
};