import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import featureImage from "@/assets/megamenu-feature.jpg";
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
      <h3 className="mb-2.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
        {lang === "lv" ? meta.lv : meta.en}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={buildCategoryHref(item.categories)}
              onClick={onNavigate}
              role="menuitem"
              className="block text-[12.5px] leading-snug text-primary-foreground/65 transition-colors hover:text-accent"
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
            className="inline-flex items-center gap-1 text-[12.5px] font-bold leading-snug text-primary-foreground transition-colors hover:text-accent"
          >
            {lang === "lv" ? meta.allLv : meta.allEn}
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);
  const { items } = useMegaMenuItems();

  const bySection = (section: MegaMenuSection) =>
    items
      .filter((i) => i.section === section)
      .sort((a, b) => a.sort_order - b.sort_order);

  const manufacturers = bySection("manufacturers");

  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="overflow-hidden bg-primary text-primary-foreground"
    >
      <div className="flex max-h-[70vh] overflow-y-auto">
        {/* Feature image */}
        <div className="relative hidden w-[210px] shrink-0 lg:block">
          <img
            src={featureImage}
            alt={t("Apdrukāts apģērbs", "Branded apparel")}
            loading="lazy"
            width={640}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-heading text-[11px] font-bold uppercase leading-tight tracking-[0.16em] text-primary-foreground">
              {t("Apdruka jebkurā apjomā", "Branding at any volume")}
            </p>
            <Link
              to="/catalog"
              onClick={onNavigate}
              role="menuitem"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent hover:text-primary-foreground"
            >
              {t("Katalogs", "Catalog")}
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Text columns */}
        <div className="min-w-0 flex-1 px-6 py-6">
          <div className="grid grid-cols-2 gap-x-7 gap-y-7 md:grid-cols-4">
            {MEGA_MENU_COLUMNS.map((col, i) => (
              <div key={i} className="space-y-6">
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

          {/* Manufacturers */}
          {manufacturers.length > 0 && (
            <div className="mt-6 border-t border-primary-foreground/10 pt-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/40">
                  {t("Ražotāji", "Manufacturers")}
                </span>
                {manufacturers.map((m, idx) => (
                  <Link
                    key={m.id}
                    to={buildSourceHref(m.categories[0] || "")}
                    onClick={onNavigate}
                    role="menuitem"
                    className={
                      idx === 0
                        ? "font-heading text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent hover:text-primary-foreground"
                        : "font-heading text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                    }
                  >
                    {lang === "lv" ? m.label_lv : m.label_en}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group flex items-center justify-between bg-accent px-6 py-3 text-accent-foreground transition-colors hover:bg-accent/90"
      >
        <span className="font-heading text-[13px] font-bold uppercase tracking-[0.24em]">
          {t("Skatīt visus produktus", "Browse all products")}
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
