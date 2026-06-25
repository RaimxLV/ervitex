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

      {/* Feature cards */}
      <div>
        <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
          {lang === "lv" ? "Izceltie" : "Featured"}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/catalog?sort=newest"
            onClick={onNavigate}
            role="menuitem"
            className="group relative block aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img
              src={newArrivalsImg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <Sparkles className="mb-2 h-4 w-4 text-accent" strokeWidth={2} />
              <p className="font-heading text-base font-bold uppercase tracking-wider text-primary-foreground">
                {lang === "lv" ? "Jaunumi" : "New Arrivals"}
              </p>
              <p className="mt-0.5 text-[11px] text-primary-foreground/70">
                {lang === "lv" ? "Svaigākās kolekcijas" : "Latest drops"}
              </p>
            </div>
          </Link>

          <Link
            to="/stanley-stella"
            onClick={onNavigate}
            role="menuitem"
            className="group relative block aspect-[4/5] overflow-hidden rounded-sm border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img
              src={bestsellersImg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <Star className="mb-2 h-4 w-4 text-accent" strokeWidth={2} fill="currentColor" />
              <p className="font-heading text-base font-bold uppercase tracking-wider text-primary-foreground">
                Stanley/Stella
              </p>
              <p className="mt-0.5 text-[11px] text-primary-foreground/70">
                {lang === "lv" ? "Premium kolekcija" : "Premium collection"}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
