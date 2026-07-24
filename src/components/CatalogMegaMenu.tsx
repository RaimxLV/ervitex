import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import {
  IconTShirt,
  IconPolo,
  IconHoodie,
  IconJacket,
  IconVest,
  IconFleece,
  IconPants,
  IconCap,
  IconBackpack,
  IconToteBag,
  IconAccessories,
  IconMug,
} from "@/components/catalog/CategoryIcons";

interface MegaMenuProps {
  onNavigate?: () => void;
}

// Each tile links to /catalog with a category filter. Labels come from the
// canonical CATEGORY_MAP output in UnifiedCatalog.tsx, so filter selection
// matches 1:1 with what the sidebar shows.
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
      { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts"], icon: <IconTShirt /> },
      { lv: "Polo krekli", en: "Polos", categories: ["Polos"], icon: <IconPolo /> },
      { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies"], icon: <IconHoodie /> },
      { lv: "Džemperi", en: "Sweaters", categories: ["Sweaters"], icon: <IconFleece /> },
      { lv: "Jakas", en: "Jackets", categories: ["Jackets"], icon: <IconJacket /> },
      { lv: "Vestes", en: "Vests", categories: ["Vests"], icon: <IconVest /> },
      { lv: "Bikses", en: "Trousers", categories: ["Trousers"], icon: <IconPants /> },
      { lv: "Šorti", en: "Shorts", categories: ["Shorts"], icon: <IconPants /> },
    ],
  },
  {
    titleLv: "Aksesuāri",
    titleEn: "Accessories",
    tiles: [
      { lv: "Cepures", en: "Caps & Hats", categories: ["Caps & Hats"], icon: <IconCap /> },
      { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks"], icon: <IconBackpack /> },
      { lv: "Somas", en: "Bags", categories: ["Bags"], icon: <IconBackpack /> },
      { lv: "Audumu maisiņi", en: "Tote Bags", categories: ["Tote Bags"], icon: <IconToteBag /> },
      { lv: "Lietussargi", en: "Umbrellas", categories: ["Umbrellas"], icon: <IconAccessories /> },
    ],
  },
  {
    titleLv: "Prezentmateriāli",
    titleEn: "Business gifts",
    tiles: [
      { lv: "Krūzes", en: "Mugs", categories: ["Mugs"], icon: <IconMug /> },
      { lv: "Pudeles", en: "Bottles", categories: ["Bottles"], icon: <IconMug /> },
      { lv: "Piezīmju grāmatiņas", en: "Notebooks", categories: ["Notebooks"], icon: <IconAccessories /> },
      { lv: "Atslēgu piekariņi", en: "Keychains", categories: ["Keychains & Keyrings"], icon: <IconAccessories /> },
      { lv: "Austiņas", en: "Headphones", categories: ["Headphones"], icon: <IconAccessories /> },
    ],
  },
];

// Manufacturer chips — mirrors the "Ražotājs" facet in the sidebar filter
// (MANUFACTURERS in UnifiedCatalog.tsx). Stanley/Stella is pinned first.
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

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();

  return (
    <div
      role="menu"
      aria-label={lang === "lv" ? "Kataloga izvēlne" : "Catalog menu"}
      className="p-6 lg:p-10"
    >
      {/* All products banner */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group mb-8 flex items-center justify-between rounded-sm bg-primary px-5 py-4 text-primary-foreground transition-opacity hover:opacity-90"
      >
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-4 w-4 text-accent" />
          <span className="font-heading text-sm font-bold uppercase tracking-[0.2em]">
            {lang === "lv" ? "Visi produkti" : "All products"}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 opacity-80 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.titleEn}>
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground font-heading">
              {lang === "lv" ? col.titleLv : col.titleEn}
            </h3>
            <ul className="space-y-1">
              {col.tiles.map((tile) => (
                <li key={tile.en}>
                  <Link
                    to={buildCategoryHref(tile.categories)}
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

      {/* Manufacturers */}
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground font-heading">
          <Sparkles className="h-3 w-3 text-accent" />
          {lang === "lv" ? "Ražotāji" : "Manufacturers"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {MANUFACTURERS.map((m) => (
            <Link
              key={m.token}
              to={buildManufacturerHref(m.token)}
              onClick={onNavigate}
              role="menuitem"
              className={
                m.featured
                  ? "rounded-sm border border-accent bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  : "rounded-sm border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
              }
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
