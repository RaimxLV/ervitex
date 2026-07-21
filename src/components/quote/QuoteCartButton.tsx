import { Link, useLocation } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";

const QuoteCartButton = () => {
  const { totalQty } = useQuoteCart();
  const { lang } = useLanguage();
  const location = useLocation();

  if (totalQty === 0) return null;
  if (location.pathname.startsWith("/request")) return null;
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <Link
      to="/request"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-accent px-5 py-3 font-heading text-xs font-bold uppercase tracking-widest text-accent-foreground shadow-lg hover:bg-accent/90 transition-all sm:bottom-8 sm:right-8"
    >
      <ClipboardList className="h-4 w-4" />
      <span>{lang === "lv" ? "Pieprasījums" : "Request"}</span>
      <span className="rounded-full bg-accent-foreground text-accent min-w-[1.5rem] px-1.5 py-0.5 text-center text-[11px] font-black">
        {totalQty}
      </span>
    </Link>
  );
};

export default QuoteCartButton;
