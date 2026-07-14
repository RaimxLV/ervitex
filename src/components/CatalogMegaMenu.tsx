import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, LayoutGrid } from "lucide-react";

interface MegaMenuProps {
  onNavigate?: () => void;
}

const CATALOGS: { href: string; name: string; lv: string; en: string }[] = [
  {
    href: "/stanley-stella",
    name: "Stanley/Stella",
    lv: "Mūsu primārais partneris — organiskas dabas apģērbi.",
    en: "Our primary partner — organic apparel.",
  },
  {
    href: "/nwg",
    name: "New Wave Group",
    lv: "Clique, Craft, ProJob, Cutter & Buck u.c.",
    en: "Clique, Craft, ProJob, Cutter & Buck and more.",
  },
  {
    href: "/pf-concept",
    name: "PF Concept",
    lv: "Reklāmas priekšmeti, biroja preces, dāvanas.",
    en: "Promotional items, office goods, gifts.",
  },
];

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();

  return (
    <div
      role="menu"
      aria-label={lang === "lv" ? "Kataloga izvēlne" : "Catalog menu"}
      className="p-8 lg:p-10"
    >
      {/* All-in-one link */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group mb-6 flex items-center justify-between rounded-sm bg-accent px-4 py-3 text-accent-foreground transition-opacity hover:opacity-90"
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-4 w-4" />
          <div>
            <div className="font-heading text-sm font-bold uppercase tracking-wider">
              {lang === "lv" ? "Visi produkti" : "All products"}
            </div>
            <div className="text-[11px] opacity-80">
              {lang === "lv"
                ? "Meklējiet visos katalogos vienlaikus, filtrējiet pēc krāsas"
                : "Search all catalogs at once, filter by color"}
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 -translate-x-1 opacity-70 transition-transform group-hover:translate-x-0" />
      </Link>

      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
        {lang === "lv" ? "Pēc piegādātāja" : "By supplier"}
      </h3>
      <ul className="grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-3">
        {CATALOGS.map((c) => (
          <li key={c.href}>
            <Link
              to={c.href}
              onClick={onNavigate}
              role="menuitem"
              className="group flex h-full flex-col justify-between rounded-sm border border-border p-4 transition-colors hover:border-accent hover:bg-muted"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                  {c.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-accent -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {lang === "lv" ? c.lv : c.en}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
