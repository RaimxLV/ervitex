import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import { useMegaMenuItems, type MegaMenuItem } from "@/hooks/useMegaMenuItems";
import { resolveMenuImage } from "@/lib/megaMenuImages";

interface MegaMenuProps {
  onNavigate?: () => void;
}

const MANUFACTURERS: { label: string; token: string; featured?: boolean }[] = [
  { label: "Stanley/Stella", token: "stanley-stella", featured: true },
  { label: "Craft", token: "nwg-craft" },
  { label: "Clique", token: "nwg-clique" },
  { label: "ProJob", token: "nwg-projob" },
  { label: "Cutter & Buck", token: "nwg-cutter" },
  { label: "Elevate", token: "pf-elevate" },
  { label: "Roly", token: "pf-roly" },
  { label: "Beechfield Brands", token: "bb" },
  { label: "Malfini", token: "mf" },
  { label: "Prezentmateriāli", token: "pf" },
];

const buildCategoryHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;
const buildManufacturerHref = (token: string) =>
  `/catalog?source=${encodeURIComponent(token)}`;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-6 bg-accent" />
      <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/60">
        {children}
      </h3>
    </div>
  );
}

function CategoryTile({
  item,
  onNavigate,
}: {
  item: MegaMenuItem;
  onNavigate?: () => void;
}) {
  const { lang } = useLanguage();
  const title = lang === "lv" ? item.label_lv : item.label_en;
  const image = resolveMenuImage(item.image_url, item.label_en);
  return (
    <Link
      to={buildCategoryHref(item.categories)}
      onClick={onNavigate}
      role="menuitem"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-sm bg-primary-foreground/5">
        <div className="aspect-square">
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-foreground/10 text-primary-foreground/30">
              <span className="text-[9px] uppercase tracking-widest">—</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="truncate font-heading text-[10.5px] font-semibold uppercase tracking-[0.1em] text-primary-foreground/85 transition-colors group-hover:text-accent">
          {title}
        </span>
      </div>
    </Link>
  );
}

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);
  const { items } = useMegaMenuItems({ onlyActive: true });

  const apparel = items.filter((i) => i.section === "apparel");
  const bags = items.filter((i) => i.section === "bags");
  const promo = items.filter((i) => i.section === "promo");
  const promoLinks = items.filter((i) => i.section === "promo_link");

  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="max-h-[calc(100vh-5rem)] overflow-y-auto bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-5 lg:px-8 lg:py-6 xl:px-10">
        {apparel.length > 0 && (
          <>
            <SectionTitle>{t("Apģērbi", "Apparel")}</SectionTitle>
            <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {apparel.map((item) => (
                <CategoryTile key={item.id} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </>
        )}

        {bags.length > 0 && (
          <div className="mt-7 border-t border-primary-foreground/10 pt-5">
            <SectionTitle>{t("Somas un ceļojumi", "Bags & travel")}</SectionTitle>
            <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {bags.map((item) => (
                <CategoryTile key={item.id} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        {(promo.length > 0 || promoLinks.length > 0) && (
          <div className="mt-7 border-t border-primary-foreground/10 pt-5">
            <SectionTitle>{t("Prezentmateriāli", "Promo products")}</SectionTitle>
            {promo.length > 0 && (
              <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                {promo.map((item) => (
                  <CategoryTile key={item.id} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            )}
            {promoLinks.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                {promoLinks.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={buildCategoryHref(item.categories)}
                      onClick={onNavigate}
                      role="menuitem"
                      className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                    >
                      <span>{lang === "lv" ? item.label_lv : item.label_en}</span>
                      <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Manufacturers strip */}
      <div className="border-t border-primary-foreground/10 bg-primary-foreground/5">
        <div className="mx-auto max-w-[1400px] px-6 py-3 lg:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/40">
              {t("Ražotāji", "Manufacturers")}
            </span>
            {MANUFACTURERS.map((m) => (
              <Link
                key={m.token}
                to={buildManufacturerHref(m.token)}
                onClick={onNavigate}
                role="menuitem"
                className={
                  m.featured
                    ? "font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-accent hover:text-primary-foreground"
                    : "font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                }
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group flex items-center justify-between bg-accent px-6 py-3 text-accent-foreground transition-colors hover:bg-accent/90 lg:px-10"
      >
        <span className="font-heading text-sm font-bold uppercase tracking-[0.24em]">
          {t("Skatīt visus produktus", "Browse all products")}
        </span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
