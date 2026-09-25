import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMegaMenuItems, type MegaMenuItem } from "@/hooks/useMegaMenuItems";
import {
  MEGA_MENU_COLUMNS,
  SECTION_META,
  buildCategoryHref,
  buildSourceHref,
  type MegaMenuSection,
} from "@/lib/megaMenuConfig";

interface MegaMenuProps {
  onNavigate?: () => void;
  open?: boolean;
}

function GroupBlock({
  section,
  items,
  onNavigate,
}: {
  section: MegaMenuSection;
  items: MegaMenuItem[];
  onNavigate?: () => void;
}) {
  const { lang } = useLanguage();
  const meta = SECTION_META[section];
  if (!items.length) return null;
  const allCats = Array.from(new Set(items.flatMap((i) => i.categories)));
  return (
    <div>
      <h3 className="mb-2.5 font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
        {lang === "lv" ? meta.lv : meta.en}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={buildCategoryHref(item.categories)}
              onClick={onNavigate}
              role="menuitem"
              className="block text-[14.5px] leading-snug text-primary-foreground/65 transition-colors hover:text-accent"
            >
              {lang === "lv" ? item.label_lv : item.label_en}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to={buildCategoryHref(allCats)}
            onClick={onNavigate}
            role="menuitem"
            className="inline-flex items-center gap-1 text-[14.5px] font-bold leading-snug text-primary-foreground transition-colors hover:text-accent"
          >
            {lang === "lv" ? meta.allLv : meta.allEn}
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default function CatalogMegaMenu({ onNavigate, open = true }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);
  const { items } = useMegaMenuItems();

  const bySection = (section: MegaMenuSection) =>
    items
      .filter((i) => i.section === section)
      .sort((a, b) => a.sort_order - b.sort_order);


  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="overflow-hidden bg-primary text-primary-foreground"
    >
      {/* Text columns */}
      <div className="min-w-0 flex-1 px-5 py-5 2xl:px-7 2xl:py-6">
        <div className="grid grid-cols-4 gap-x-6 gap-y-5 2xl:gap-x-8 2xl:gap-y-7">
          {MEGA_MENU_COLUMNS.map((col, i) => (
            <div
              key={i}
              className={`space-y-5 transition-all duration-500 ease-out motion-reduce:transition-none 2xl:space-y-6 ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${60 + i * 45}ms` : "0ms" }}
            >
              {col.map((section) => (
                <GroupBlock
                  key={section}
                  section={section}
                  items={bySection(section)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </div>

        {/* CTA inside the menu */}
        <Link
          to="/catalog"
          onClick={onNavigate}
          role="menuitem"
          className={`cta-drift group mt-6 inline-flex items-center gap-3 px-7 py-3 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: open ? "220ms" : "0ms" }}
        >
          <span className="font-heading text-[15px] font-bold uppercase tracking-[0.24em] text-accent-foreground">
            {t("Skatīt visus produktus", "Browse all products")}
          </span>
          <ArrowRight className="h-4 w-4 text-accent-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function MobileCatalogMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const { items } = useMegaMenuItems();
  const [openSection, setOpenSection] = useState<MegaMenuSection | null>("tops");
  const sections = MEGA_MENU_COLUMNS.flat();
  const manufacturers = items
    .filter((item) => item.section === "manufacturers")
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="border-t border-primary-foreground/10">
      {sections.map((section) => {
        const meta = SECTION_META[section];
        const sectionItems = items
          .filter((item) => item.section === section)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (!sectionItems.length) return null;
        const expanded = openSection === section;
        const allCategories = Array.from(new Set(sectionItems.flatMap((item) => item.categories)));

        return (
          <div key={section} className="border-b border-primary-foreground/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenSection(expanded ? null : section)}
              aria-expanded={expanded}
              className="h-auto w-full justify-between rounded-none px-0 py-3.5 font-heading text-base font-bold uppercase text-primary-foreground hover:bg-transparent hover:text-accent"
            >
              {lang === "lv" ? meta.lv : meta.en}
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </Button>
            {expanded && (
              <div className="grid grid-cols-1 gap-1 pb-4 min-[430px]:grid-cols-2">
                {sectionItems.map((item) => (
                  <Link
                    key={item.id}
                    to={buildCategoryHref(item.categories)}
                    onClick={onNavigate}
                    className="py-2 text-[15px] leading-snug text-primary-foreground/70"
                  >
                    {lang === "lv" ? item.label_lv : item.label_en}
                  </Link>
                ))}
                <Link
                  to={buildCategoryHref(allCategories)}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-1 py-2 text-[15px] font-bold text-accent"
                >
                  {lang === "lv" ? meta.allLv : meta.allEn}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        );
      })}

      {manufacturers.length > 0 && (
        <div className="py-4">
          <p className="mb-3 font-heading text-sm font-bold uppercase text-primary-foreground">
            {lang === "lv" ? "Ražotāji" : "Manufacturers"}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {manufacturers.map((manufacturer) => (
              <Link
                key={manufacturer.id}
                to={buildSourceHref(manufacturer.categories[0] || "")}
                onClick={onNavigate}
                className="text-[15px] font-semibold text-primary-foreground/70"
              >
                {lang === "lv" ? manufacturer.label_lv : manufacturer.label_en}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/catalog"
        onClick={onNavigate}
        className="mt-2 flex items-center justify-between bg-accent px-4 py-3.5 font-heading text-base font-bold uppercase text-accent-foreground"
      >
        {lang === "lv" ? "Skatīt visus produktus" : "Browse all products"}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
