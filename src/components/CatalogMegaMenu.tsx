import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";

import imgJacket from "@/assets/menu/jacket.jpg";
import imgHoodie from "@/assets/menu/hoodie.jpg";
import imgBackpack from "@/assets/menu/backpack.jpg";
import imgBottle from "@/assets/menu/bottle.jpg";

interface MegaMenuProps {
  onNavigate?: () => void;
}

interface Item {
  lv: string;
  en: string;
  categories: string[];
}

// Columns organized like modern retail mega menus (Uniqlo / COS / Zara):
// text-first, dense, grouped by function, sorted by category value / size.
const COL_OUTERWEAR: Item[] = [
  { lv: "Jakas", en: "Jackets", categories: ["Jackets"] },
  { lv: "Vestes", en: "Vests", categories: ["Vests"] },
];

const COL_TOPS: Item[] = [
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies"] },
  { lv: "Džemperi", en: "Sweaters", categories: ["Sweaters"] },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos"] },
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts"] },
];

const COL_BOTTOMS: Item[] = [
  { lv: "Bikses", en: "Trousers", categories: ["Trousers"] },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts"] },
];

const COL_BAGS: Item[] = [
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks"] },
  { lv: "Somas", en: "Bags", categories: ["Bags"] },
  { lv: "Maisiņi", en: "Tote bags", categories: ["Tote Bags"] },
];

const COL_ACCESSORIES: Item[] = [
  { lv: "Cepures", en: "Caps & hats", categories: ["Caps & Hats"] },
  { lv: "Lietussargi", en: "Umbrellas", categories: ["Umbrellas"] },
];

const COL_GIFTS: Item[] = [
  { lv: "Austiņas", en: "Headphones", categories: ["Headphones"] },
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles"] },
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs"] },
  { lv: "Piezīmju grāmatiņas", en: "Notebooks", categories: ["Notebooks"] },
  { lv: "Atslēgu piekariņi", en: "Keychains", categories: ["Keychains & Keyrings"] },
];

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

function LinkList({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: Item[];
  onNavigate?: () => void;
}) {
  const { lang } = useLanguage();
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1 w-1 bg-accent" />
        <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">
          {title}
        </h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.en}>
            <Link
              to={buildCategoryHref(item.categories)}
              onClick={onNavigate}
              role="menuitem"
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-white/85 transition-colors hover:text-accent"
            >
              <span>{lang === "lv" ? item.lv : item.en}</span>
              <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({
  image,
  eyebrow,
  title,
  href,
  onNavigate,
}: {
  image: string;
  eyebrow: string;
  title: string;
  href: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onNavigate}
      role="menuitem"
      className="group relative block overflow-hidden rounded-sm bg-neutral-900"
    >
      <div className="aspect-[4/5]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-1 font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </div>
        <div className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-[0.14em] text-white">
          {title}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="max-h-[calc(100vh-5rem)] overflow-y-auto bg-[#0A0A0A] text-white"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid grid-cols-12 gap-8 lg:gap-10">
          {/* APPAREL — biggest category, 3 sublists */}
          <section className="col-span-12 lg:col-span-5">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-white">
                {t("Apģērbi", "Apparel")}
              </h2>
              <Link
                to={buildCategoryHref([
                  "Jackets","Vests","Hoodies","Sweaters","Polos","T-shirts","Trousers","Shorts",
                ])}
                onClick={onNavigate}
                className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-accent"
              >
                {t("Skatīt visu", "See all")} →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <LinkList title={t("Virsdrēbes", "Outerwear")} items={COL_OUTERWEAR} onNavigate={onNavigate} />
              <LinkList title={t("Topi", "Tops")} items={COL_TOPS} onNavigate={onNavigate} />
              <LinkList title={t("Apakšdaļa", "Bottoms")} items={COL_BOTTOMS} onNavigate={onNavigate} />
            </div>
          </section>

          {/* ACCESSORIES */}
          <section className="col-span-12 lg:col-span-3">
            <div className="mb-5">
              <h2 className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-white">
                {t("Aksesuāri", "Accessories")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <LinkList title={t("Somas", "Bags")} items={COL_BAGS} onNavigate={onNavigate} />
              <LinkList title={t("Papildus", "More")} items={COL_ACCESSORIES} onNavigate={onNavigate} />
            </div>
          </section>

          {/* GIFTS */}
          <section className="col-span-12 lg:col-span-2">
            <div className="mb-5">
              <h2 className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-white">
                {t("Prezentmateriāli", "Gifts")}
              </h2>
            </div>
            <LinkList title={t("Priekšmeti", "Items")} items={COL_GIFTS} onNavigate={onNavigate} />
          </section>

          {/* FEATURED — 2 stacked photo CTAs */}
          <aside className="col-span-12 lg:col-span-2">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <FeatureCard
                image={imgJacket}
                eyebrow={t("Ieteikums", "Featured")}
                title={t("Virsdrēbes", "Outerwear")}
                href={buildCategoryHref(["Jackets", "Vests"])}
                onNavigate={onNavigate}
              />
              <FeatureCard
                image={imgBackpack}
                eyebrow={t("Populārs", "Popular")}
                title={t("Somas", "Bags")}
                href={buildCategoryHref(["Backpacks", "Bags"])}
                onNavigate={onNavigate}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Manufacturers strip */}
      <div className="border-t border-white/5 bg-black/50">
        <div className="mx-auto max-w-[1400px] px-6 py-5 lg:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">
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
                    ? "font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-accent hover:text-white"
                    : "font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors hover:text-white"
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
        className="group flex items-center justify-between bg-accent px-6 py-4 text-white transition-colors hover:bg-accent/90 lg:px-10"
      >
        <span className="font-heading text-sm font-bold uppercase tracking-[0.24em]">
          {t("Skatīt visus produktus", "Browse all products")}
        </span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
