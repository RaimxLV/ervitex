import { Link, useLocation } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";

const QuoteCartButton = () => {
  const { items, totalQty } = useQuoteCart();
  const { lang } = useLanguage();
  const location = useLocation();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  if (totalQty === 0) return null;
  if (location.pathname.startsWith("/request")) return null;
  if (location.pathname.startsWith("/admin")) return null;

  const lines = items.length;

  return (
    <Link
      to="/request"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-accent px-5 py-3.5 font-heading text-xs font-black uppercase tracking-widest text-accent-foreground shadow-2xl ring-2 ring-accent/40 transition-all hover:scale-105 hover:bg-accent/90 sm:bottom-8 sm:right-8 animate-in fade-in slide-in-from-bottom-4"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground text-accent">
        <ClipboardList className="h-4 w-4" />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-black text-background">
          {lines}
        </span>
      </span>
      <span className="flex flex-col leading-tight">
        <span>{t("Mans pieprasījums", "My request")}</span>
        <span className="text-[10px] font-semibold tracking-wide opacity-80">
          {totalQty} {t("gab.", "pcs")} · {lines} {t("pozīcij.", "lines")}
        </span>
      </span>
    </Link>
  );
};

export default QuoteCartButton;
