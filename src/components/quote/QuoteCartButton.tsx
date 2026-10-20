import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@/lib/router-compat";
import { ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";
import { useWorksheetPick } from "@/lib/worksheetPick";
import { useAuth } from "@/hooks/useAuth";
import { useCreateOffer } from "@/components/quote/CreateOfferButton";
import { consumerCartAllowed } from "@/lib/requestPresentation";

const QuoteCartButton = () => {
  const { items, totalQty } = useQuoteCart();
  const { lang } = useLanguage();
  const location = useLocation();
  const pick = useWorksheetPick();
  const { isAdmin } = useAuth();
  const { create, busy } = useCreateOffer();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  const visible = !pick && totalQty > 0 &&
    consumerCartAllowed(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("has-quote-dock", visible);
    return () => document.body.classList.remove("has-quote-dock");
  }, [visible]);

  if (!visible) return null;

  const lines = items.length;
  const cls = "group flex h-11 w-full items-center justify-start gap-3 rounded-sm bg-accent px-3 font-heading text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/90 sm:h-auto sm:w-auto sm:rounded-full sm:px-5 sm:py-3.5 sm:uppercase sm:tracking-widest sm:shadow-2xl sm:ring-2 sm:ring-accent/40";
  const inner = (label: string) => (
    <>
      <span className="relative flex h-7 w-7 shrink-0 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-accent-foreground text-accent">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-black text-background">
          {lines}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
        <span>{label}</span>
        <span className="text-[10px] font-semibold tracking-wide opacity-80">
          {totalQty} {t("gab.", "pcs")} · {lines} {t("pozīcij.", "lines")}
        </span>
      </span>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 sm:hidden" aria-hidden="true" />
    </>
  );

  return (
    <div className="quote-cart-dock fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-3 pt-2 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:border-0 sm:bg-transparent sm:p-0">
      {isAdmin ? <Button type="button" disabled={busy} onClick={() => create(true)} className={cls}>
        {inner(t("Izveidot piedāvājumu", "Create offer"))}
      </Button> : <Button asChild className={cls}>
        <Link to="/request">{inner(t("Mans pieprasījums", "My request"))}</Link>
      </Button>}
    </div>
  );
};

export default QuoteCartButton;
