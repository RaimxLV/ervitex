import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Loader2 } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWorksheetPick } from "@/lib/worksheetPick";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOffer } from "@/components/quote/CreateOfferButton";

const QuoteCartButton = () => {
  const { items, totalQty } = useQuoteCart();
  const { lang } = useLanguage();
  const location = useLocation();
  const pick = useWorksheetPick();
  const { isAdmin } = useAuth();
  const { create, busy } = useCreateOffer();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  if (pick) return null;
  if (totalQty === 0) return null;
  if (location.pathname.startsWith("/request")) return null;
  if (location.pathname.startsWith("/admin")) return null;

  const lines = items.length;
  const cls = "group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-accent px-5 py-3.5 font-heading text-xs font-black uppercase tracking-widest text-accent-foreground shadow-2xl ring-2 ring-accent/40 transition-all hover:scale-105 hover:bg-accent/90 sm:bottom-8 sm:right-8 animate-in fade-in slide-in-from-bottom-4";
  const inner = (label: string) => (
    <>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-accent-foreground text-accent">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-black text-background">
          {lines}
        </span>
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span>{label}</span>
        <span className="text-[10px] font-semibold tracking-wide opacity-80">
          {totalQty} {t("gab.", "pcs")} · {lines} {t("pozīcij.", "lines")}
        </span>
      </span>
    </>
  );

  if (isAdmin) {
    return (
      <button type="button" disabled={busy} onClick={() => create(true)} className={cls}>
        {inner(t("Izveidot piedāvājumu", "Create offer"))}
      </button>
    );
  }

  return <Link to="/request" className={cls}>{inner(t("Mans pieprasījums", "My request"))}</Link>;
};

export default QuoteCartButton;
