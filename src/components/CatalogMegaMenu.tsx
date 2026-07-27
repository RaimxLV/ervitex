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

const imgShoes = "https://images.nwgmedia.com/highres/230335/1906960-999982_V175_Fuseknit_Front.jpg";

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
}

// Ordered per user request: t-krekli, polo, hūdiji, džemperi, jakas, apavi, cepures, somas, mugursomas, pudeles
const TILES: TileItem[] = [
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts", "Tops"], image: imgTshirt },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos", "Polo shirts"], image: imgPolo },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies", "Hoodie sweatshirts"], image: imgHoodie },
  { lv: "Džemperi", en: "Sweatshirts", categories: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], image: imgSweater },
  { lv: "Virsjakas", en: "Jackets", categories: ["Jackets", "Non Padded Jacket", "Light Padded Jacket", "Padded Jacket"], image: imgJacket },
  { lv: "Apavi", en: "Shoes", categories: ["Shoes", "Safety Footwear"], image: imgShoes },
  { lv: "Cepures", en: "Caps & hats", categories: ["Caps & Hats", "Caps", "Headwear"], image: imgCap },
  { lv: "Somas", en: "Bags", categories: ["Bags", "Travel Bags", "Sports Bags"], image: imgBag },
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks", "Laptop Backpacks"], image: imgBackpack },
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"], image: imgBottle },
];

// Apparel items without dedicated tiles
const APPAREL_LINKS: Item[] = [
  { lv: "Bikses", en: "Trousers", categories: ["Trousers", "Trousers-shorts", "Bottoms"] },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts"] },
  { lv: "Vestes", en: "Vests", categories: ["Vests", "Bodywarmers", "Jackets-Vests"] },
  { lv: "Krekli", en: "Shirts", categories: ["Shirts"] },
  { lv: "Cimdi", en: "Gloves", categories: ["Gloves"] },
  { lv: "Šalles", en: "Scarves", categories: ["Scarves"] },
];

const BAG_LINKS: Item[] = [
  { lv: "Datora somas", en: "Laptop bags", categories: ["Laptop & Tablet Bags"] },
  { lv: "Ceļojumu aksesuāri", en: "Travel accessories", categories: ["Travel Accessories", "Toiletry Bags"] },
  { lv: "Iepirkumu maisiņi", en: "Tote bags", categories: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"] },
  { lv: "Jostas somas", en: "Waist bags", categories: ["Waist Bags", "Belt Bags"] },
];

const PROMO_LINKS: Item[] = [
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs", "Insulated Mugs", "Travel Mugs", "Standard Mugs"] },
  { lv: "Austiņas un skaļruņi", en: "Audio", categories: ["Headphones", "Earbuds", "Speakers"] },
  { lv: "Ārējie akumulatori", en: "Power banks", categories: ["Power Banks", "Wireless Chargers", "Chargers"] },
  { lv: "Lietussargi", en: "Umbrellas", categories: ["Umbrellas", "Golf Umbrellas", "Storm Umbrellas"] },
  { lv: "Bloknoti", en: "Notebooks", categories: ["Notebooks", "Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads"] },
  { lv: "Pildspalvas", en: "Pens", categories: ["Pens", "Ballpoint Pens"] },
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

function CategoryTile({ item, onNavigate }: { item: TileItem; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const title = lang === "lv" ? item.lv : item.en;
  return (
    <Link
      to={buildCategoryHref(item.categories)}
      onClick={onNavigate}
      role="menuitem"
      className="group relative block overflow-hidden rounded-sm bg-primary-foreground/5"
    >
      <div className="aspect-[4/5]">
        <img
          src={item.image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
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
      <div className="mx-auto max-w-[1400px] px-5 py-5 lg:px-8 lg:py-6 xl:px-10">
        {/* Tiles row */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
          {TILES.map((item) => (
            <CategoryTile key={item.en} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Link lists */}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-primary-foreground/10 pt-5 md:grid-cols-3 xl:gap-10">
          <LinkList title={t("Apģērbi", "Apparel")} items={APPAREL_LINKS} onNavigate={onNavigate} />
          <LinkList title={t("Somas un ceļojumi", "Bags & travel")} items={BAG_LINKS} onNavigate={onNavigate} />
          <LinkList title={t("Prezentmateriāli", "Promo products")} items={PROMO_LINKS} onNavigate={onNavigate} />
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
