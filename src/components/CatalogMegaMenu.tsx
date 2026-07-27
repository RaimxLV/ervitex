import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";

import imgJacket from "@/assets/menu/jacket.jpg";
import imgHoodie from "@/assets/menu/hoodie.jpg";
import imgBackpack from "@/assets/menu/backpack.jpg";
import imgBottle from "@/assets/menu/bottle.jpg";
import imgBag from "@/assets/menu/bag.jpg";
import imgCap from "@/assets/menu/cap.jpg";
import imgPolo from "@/assets/menu/polo.jpg";
import imgSweater from "@/assets/menu/sweater.jpg";
import imgTshirt from "@/assets/menu/tshirt.jpg";
import imgVest from "@/assets/menu/vest.jpg";

interface MegaMenuProps {
  onNavigate?: () => void;
}

interface Item {
  lv: string;
  en: string;
  categories: string[];
}

interface TileItem extends Item {
  image: string;
  priority?: "hero" | "large" | "normal";
}

const FEATURED_TILES: TileItem[] = [
  { lv: "Virsjakas", en: "Jackets", categories: ["Jackets", "Non Padded Jacket", "Light Padded Jacket", "Padded Jacket"], image: imgJacket, priority: "hero" },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies", "Hoodie sweatshirts"], image: imgHoodie, priority: "large" },
  { lv: "Džemperi", en: "Sweatshirts", categories: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], image: imgSweater, priority: "large" },
  { lv: "Vestes", en: "Vests", categories: ["Vests", "Bodywarmers", "Jackets-Vests"], image: imgVest },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos", "Polo shirts"], image: imgPolo },
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts", "Tops"], image: imgTshirt },
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks", "Laptop Backpacks"], image: imgBackpack },
  { lv: "Somas", en: "Bags", categories: ["Bags", "Travel Bags", "Sports Bags"], image: imgBag },
];

const PRIORITY_LINKS: Item[] = [
  { lv: "Apavi", en: "Shoes", categories: ["Shoes", "Safety Footwear"] },
  { lv: "Virsjakas", en: "Jackets", categories: ["Jackets", "Non Padded Jacket", "Light Padded Jacket", "Padded Jacket"] },
  { lv: "Vestes", en: "Vests", categories: ["Vests", "Bodywarmers"] },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies", "Hoodie sweatshirts"] },
  { lv: "Džemperi", en: "Sweatshirts", categories: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"] },
  { lv: "Bikses", en: "Trousers", categories: ["Trousers", "Trousers-shorts", "Bottoms"] },
];

const APPAREL_LINKS: Item[] = [
  { lv: "Polo krekli", en: "Polos", categories: ["Polos", "Polo shirts"] },
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts", "Tops"] },
  { lv: "Krekli", en: "Shirts", categories: ["Shirts"] },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts", "Trousers-shorts"] },
  { lv: "Cepures", en: "Caps & hats", categories: ["Caps & Hats", "Caps", "Headwear"] },
  { lv: "Cimdi un šalles", en: "Gloves & scarves", categories: ["Gloves", "Scarves"] },
];

const BAG_LINKS: Item[] = [
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks", "Laptop Backpacks"] },
  { lv: "Somas", en: "Bags", categories: ["Bags", "Travel Bags", "Sports Bags"] },
  { lv: "Datora somas", en: "Laptop bags", categories: ["Laptop & Tablet Bags"] },
  { lv: "Ceļojumu aksesuāri", en: "Travel accessories", categories: ["Travel Accessories", "Toiletry Bags"] },
  { lv: "Iepirkumu maisiņi", en: "Tote bags", categories: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"] },
];

const PROMO_LINKS: Item[] = [
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"] },
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs", "Insulated Mugs", "Travel Mugs", "Standard Mugs"] },
  { lv: "Austiņas un skaļruņi", en: "Audio", categories: ["Headphones", "Earbuds", "Speakers"] },
  { lv: "Ārējie akumulatori", en: "Power banks", categories: ["Power Banks", "Wireless Chargers", "Chargers"] },
  { lv: "Lietussargi", en: "Umbrellas", categories: ["Umbrellas", "Golf Umbrellas", "Storm Umbrellas"] },
  { lv: "Bloknoti", en: "Notebooks", categories: ["Notebooks", "Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads"] },
];

const IMAGE_SHORTCUTS: TileItem[] = [
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks", "Laptop Backpacks"], image: imgBackpack },
  { lv: "Somas", en: "Bags", categories: ["Bags", "Travel Bags", "Sports Bags"], image: imgBag },
  { lv: "Cepures", en: "Headwear", categories: ["Caps & Hats", "Caps", "Headwear"], image: imgCap },
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles", "Water Bottles", "Sports Bottles"], image: imgBottle },
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
        <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-primary-foreground/50">
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
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-foreground/85 transition-colors hover:text-accent"
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
      className="group relative block overflow-hidden rounded-sm bg-primary-foreground/5"
    >
      <div className="aspect-[5/4] lg:aspect-[6/5]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <div className="mb-1 font-heading text-[9px] font-bold uppercase tracking-[0.28em] text-accent">
          {eyebrow}
        </div>
        <div className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground">
          {title}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function CategoryTile({ item, onNavigate }: { item: TileItem; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const title = lang === "lv" ? item.lv : item.en;
  const sizeClass = item.priority === "hero"
    ? "sm:col-span-2 sm:row-span-2"
    : item.priority === "large"
      ? "sm:col-span-2"
      : "";

  return (
    <Link
      to={buildCategoryHref(item.categories)}
      onClick={onNavigate}
      role="menuitem"
      className={`group relative block h-full min-h-0 overflow-hidden rounded-sm bg-primary-foreground/5 ${sizeClass}`}
    >
      <img
        src={item.image}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <span className="font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
          {title}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-primary-foreground opacity-70 transition-transform group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100" />
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
      className="max-h-[calc(100vh-5rem)] overflow-y-auto bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-4 lg:px-8 lg:py-5 xl:px-10">
        <div className="grid grid-cols-12 gap-5 xl:gap-6">
          <section className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-primary-foreground">
                {t("Prioritārie produkti", "Priority products")}
              </h2>
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/40">
                {t("no lielākā uz mazāko", "highest value first")}
              </span>
            </div>
            <div className="grid auto-rows-[104px] grid-cols-2 gap-2.5 sm:grid-cols-4 lg:auto-rows-[96px] xl:auto-rows-[108px]">
              {FEATURED_TILES.map((item) => (
                <CategoryTile key={item.en} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </section>

          <section className="col-span-12 lg:col-span-5 xl:col-span-4">
            <div className="grid grid-cols-2 gap-3">
              {IMAGE_SHORTCUTS.map((item) => (
                <FeatureCard
                  key={item.en}
                  image={item.image}
                  eyebrow={t("Populārs", "Popular")}
                  title={lang === "lv" ? item.lv : item.en}
                  href={buildCategoryHref(item.categories)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>

          <section className="col-span-12 border-t border-primary-foreground/10 pt-5">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5 xl:gap-8">
              <LinkList title={t("Prioritāte", "Priority")} items={PRIORITY_LINKS} onNavigate={onNavigate} />
              <LinkList title={t("Apģērbi", "Apparel")} items={APPAREL_LINKS} onNavigate={onNavigate} />
              <LinkList title={t("Somas", "Bags")} items={BAG_LINKS} onNavigate={onNavigate} />
              <LinkList title={t("Prezentmateriāli", "Promo products")} items={PROMO_LINKS} onNavigate={onNavigate} />
              <div className="hidden lg:block">
                <FeatureCard
                  image={imgJacket}
                  eyebrow={t("Katalogs", "Catalog")}
                  title={t("Visas preces", "All products")}
                  href="/catalog"
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          </section>
        </div>
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
