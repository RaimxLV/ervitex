import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import newArrivalsImg from "@/assets/bento/new-arrivals.jpg";
import bestsellersImg from "@/assets/bento/bestsellers.jpg";

interface MegaMenuProps {
  onNavigate?: () => void;
}

const CATEGORIES: { slug: string; lv: string; en: string }[] = [
  { slug: "t-krekli", lv: "T-krekli", en: "T-shirts" },
  { slug: "polo-krekli", lv: "Polo krekli", en: "Polo Shirts" },
  { slug: "virsjakas", lv: "Virsjakas", en: "Jackets" },
  { slug: "darba-apgerbi", lv: "Darba apģērbs", en: "Workwear" },
  { slug: "sportam", lv: "Sporta apģērbs", en: "Sportswear" },
  { slug: "dzemperi", lv: "Džemperi & Hūdiji", en: "Sweaters & Hoodies" },
  { slug: "cepures", lv: "Cepures", en: "Caps" },
  { slug: "somas", lv: "Somas", en: "Bags" },
];

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();

  return (
    <div
      role="menu"
      aria-label={lang === "lv" ? "Kataloga izvēlne" : "Catalog menu"}
      className="grid grid-cols-1 gap-8 p-8 md:grid-cols-[1.2fr_1fr] lg:gap-12 lg:p-10"
    >
      {/* Categories */}
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
          {lang === "lv" ? "Kategorijas" : "Categories"}
        </h3>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/catalog?category=${c.slug}`}
                onClick={onNavigate}
                role="menuitem"
                className="group flex items-center justify-between rounded-sm py-2.5 px-2 -mx-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="font-heading uppercase tracking-wide text-[13px]">
                  {lang === "lv" ? c.lv : c.en}
                </span>
                <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/catalog"
          onClick={onNavigate}
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent hover:underline font-heading"
        >
          {lang === "lv" ? "Skatīt visu katalogu" : "View full catalog"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Catalog brands */}
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
          {lang === "lv" ? "Katalogi" : "Catalogs"}
        </h3>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to="/stanley-stella"
              onClick={onNavigate}
              role="menuitem"
              className="group flex items-center justify-between rounded-sm py-2.5 px-2 -mx-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-accent"
            >
              <span className="font-heading uppercase tracking-wide text-[13px]">Stanley/Stella</span>
              <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
          <li>
            <Link
              to="/nwg"
              onClick={onNavigate}
              role="menuitem"
              className="group flex items-center justify-between rounded-sm py-2.5 px-2 -mx-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-accent"
            >
              <span className="font-heading uppercase tracking-wide text-[13px]">New Wave Group</span>
              <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
          <li>
            <span className="flex items-center justify-between rounded-sm py-2.5 px-2 -mx-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
              <span className="font-heading uppercase tracking-wide text-[13px]">PF Concept</span>
              <span className="text-[10px] uppercase tracking-wider">{lang === "lv" ? "Drīzumā" : "Soon"}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
