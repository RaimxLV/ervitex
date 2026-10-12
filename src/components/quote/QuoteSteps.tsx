import { ClipboardList, ListPlus, Send } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";
import { useLanguage } from "@/i18n/LanguageContext";

export const QuoteSteps = ({ offer = false }: { offer?: boolean }) => {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const steps = [
    { icon: ListPlus, title: t("Pievieno preces", "Add items"), detail: t("Krāsa · izmērs · skaits", "Colour · size · quantity") },
    { icon: ClipboardList, title: offer ? t("Izveido piedāvājumu", "Create offer") : t("Atver pieprasījumu", "Open request"), detail: t("Apdruka · kontakti", "Decoration · contacts") },
    { icon: Send, title: offer ? t("Nosūti piedāvājumu", "Send offer") : t("Nosūti pieprasījumu", "Send request"), detail: t("E-pastā", "By email") },
  ];
  return <ol aria-label={t("Trīs vienkārši soļi", "Three simple steps")} className="grid gap-3 border-y border-border py-4 sm:grid-cols-3">
    {steps.map((step, index) => <li key={index} className="flex min-w-0 items-start gap-2">
      <AccentIcon icon={step.icon} className="shrink-0" />
      <div className="min-w-0"><p className="text-xs font-bold leading-snug text-foreground"><span className="mr-1 text-accent">{index + 1}.</span>{step.title}</p><p className="mt-1 text-[10px] leading-snug text-muted-foreground">{step.detail}</p></div>
    </li>)}
  </ol>;
};