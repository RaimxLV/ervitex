import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, LayoutGrid } from "lucide-react";
import {
  IconTShirt,
  IconPolo,
  IconHoodie,
  IconJacket,
  IconVest,
  IconSoftshell,
  IconFleece,
  IconPants,
  IconCap,
  IconBackpack,
  IconToteBag,
  IconAccessories,
  IconMug,
  IconWorkwear,
  IconSport,
  IconKids,
} from "@/components/catalog/CategoryIcons";

interface MegaMenuProps {
  onNavigate?: () => void;
}

// Each tile links to /catalog with a category filter (comma-separated
// values are supported by CatalogPage). Labels are localized.
interface Tile {
  lv: string;
  en: string;
  categories: string[];
  icon: JSX.Element;
}

const COLUMNS: { titleLv: string; titleEn: string; tiles: Tile[] }[] = [
  {
    titleLv: "Apģērbi",
    titleEn: "Apparel",
    tiles: [
      { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts", "Tees", "Tops"], icon: <IconTShirt /> },
      { lv: "Polo krekli", en: "Polos", categories: ["Polos"], icon: <IconPolo /> },
      { lv: "Džemperi & Hūdiji", en: "Sweatshirts & Hoodies", categories: ["Sweatshirts", "Hoodies"], icon: <IconHoodie /> },
      { lv: "Jakas", en: "Jackets", categories: ["Jackets"], icon: <IconJacket /> },
      { lv: "Vestes", en: "Vests", categories: ["Vests", "Bodywarmers"], icon: <IconVest /> },
      { lv: "Softshell", en: "Softshell", categories: ["Softshell"], icon: <IconSoftshell /> },
      { lv: "Fleece", en: "Fleece", categories: ["Fleece"], icon: <IconFleece /> },
      { lv: "Bikses & Šorti", en: "Trousers & Shorts", categories: ["Trousers", "Shorts", "Bottoms", "Pants"], icon: <IconPants /> },
    ],
  },
  {
    titleLv: "Aksesuāri",
    titleEn: "Accessories",
    tiles: [
      { lv: "Cepures", en: "Caps & Hats", categories: ["Caps & Hats", "Headwear", "Beanies"], icon: <IconCap /> },
      { lv: "Somas", en: "Bags", categories: ["Bags", "Backpacks", "Laptop Backpacks", "Cooler Bags"], icon: <IconBackpack /> },
      { lv: "Audumu maisiņi", en: "Tote bags", categories: ["Shopping & Tote Bags"], icon: <IconToteBag /> },
      { lv: "Aksesuāri", en: "Accessories", categories: ["Accessories", "Travel Accessories", "Keychains & Keyrings"], icon: <IconAccessories /> },
    ],
  },
  {
    titleLv: "Dāvanas & Biznesam",
    titleEn: "Gifts & Business",
    tiles: [
      { lv: "Krūzes", en: "Mugs", categories: ["Mugs", "Standard Mugs", "Insulated Mugs", "Travel Mugs"], icon: <IconMug /> },
      { lv: "Pudeles & Termosi", en: "Bottles & Thermos", categories: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"], icon: <IconMug /> },
      { lv: "Darba apģērbi", en: "Workwear", categories: ["Workwear", "Hi-Vis"], icon: <IconWorkwear /> },
      { lv: "Sports", en: "Sport", categories: ["Sport", "Sports"], icon: <IconSport /> },
      { lv: "Bērniem", en: "Kids", categories: ["Kids", "Baby"], icon: <IconKids /> },
    ],
  },
];

const SUPPLIERS = [
  { href: "/stanley-stella", name: "Stanley/Stella" },
  { href: "/nwg", name: "New Wave Group" },
  { href: "/pf-concept", name: "PF Concept" },
];

const buildHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();

  return (
    <div
      role="menu"
      aria-label={lang === "lv" ? "Kataloga izvēlne" : "Catalog menu"}
      className="p-6 lg:p-8"
    >
      {/* All products banner */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group mb-6 flex items-center justify-between rounded-sm bg-accent px-4 py-3 text-accent-foreground transition-opacity hover:opacity-90"
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-heading text-sm font-bold uppercase tracking-wider">
            {lang === "lv" ? "Visi produkti" : "All products"}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.titleEn}>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
              {lang === "lv" ? col.titleLv : col.titleEn}
            </h3>
            <ul className="space-y-0.5">
              {col.tiles.map((tile) => (
                <li key={tile.en}>
                  <Link
                    to={buildHref(tile.categories)}
                    onClick={onNavigate}
                    role="menuitem"
                    className="group flex items-center gap-3 rounded-sm px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border bg-card text-foreground/80 transition-colors group-hover:border-accent group-hover:text-accent">
                      {tile.icon}
                    </span>
                    <span className="flex-1 font-medium">
                      {lang === "lv" ? tile.lv : tile.en}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Suppliers footer */}
      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground font-heading">
          {lang === "lv" ? "Pēc piegādātāja" : "By supplier"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUPPLIERS.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              onClick={onNavigate}
              role="menuitem"
              className="rounded-sm border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
