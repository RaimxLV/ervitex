import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Sparkles } from "lucide-react";

// Category tile photos — cinematic dark studio shots matching brand tone.
import imgTshirt from "@/assets/menu/tshirt.jpg";
import imgPolo from "@/assets/menu/polo.jpg";
import imgHoodie from "@/assets/menu/hoodie.jpg";
import imgSweater from "@/assets/menu/sweater.jpg";
import imgJacket from "@/assets/menu/jacket.jpg";
import imgVest from "@/assets/menu/vest.jpg";
import imgPants from "@/assets/menu/pants.jpg";
import imgShorts from "@/assets/menu/shorts.jpg";
import imgCap from "@/assets/menu/cap.jpg";
import imgBackpack from "@/assets/menu/backpack.jpg";
import imgBag from "@/assets/menu/bag.jpg";
import imgTote from "@/assets/menu/tote.jpg";
import imgUmbrella from "@/assets/menu/umbrella.jpg";
import imgMug from "@/assets/menu/mug.jpg";
import imgBottle from "@/assets/menu/bottle.jpg";
import imgNotebook from "@/assets/menu/notebook.jpg";
import imgKeychain from "@/assets/menu/keychain.jpg";
import imgHeadphones from "@/assets/menu/headphones.jpg";

interface MegaMenuProps {
  onNavigate?: () => void;
}

interface Tile {
  lv: string;
  en: string;
  categories: string[];
  image: string;
}

// Apparel tiles — labels 1:1 with CATEGORY_MAP in UnifiedCatalog.tsx.
const APPAREL: Tile[] = [
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts"], image: imgTshirt },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos"], image: imgPolo },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies"], image: imgHoodie },
  { lv: "Džemperi", en: "Sweaters", categories: ["Sweaters"], image: imgSweater },
  { lv: "Jakas", en: "Jackets", categories: ["Jackets"], image: imgJacket },
  { lv: "Vestes", en: "Vests", categories: ["Vests"], image: imgVest },
  { lv: "Bikses", en: "Trousers", categories: ["Trousers"], image: imgPants },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts"], image: imgShorts },
];

const ACCESSORIES: Tile[] = [
  { lv: "Cepures", en: "Caps & Hats", categories: ["Caps & Hats"], image: imgCap },
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks"], image: imgBackpack },
  { lv: "Somas", en: "Bags", categories: ["Bags"], image: imgBag },
  { lv: "Maisiņi", en: "Tote Bags", categories: ["Tote Bags"], image: imgTote },
];

const UMBRELLA: Tile = {
  lv: "Lietussargi",
  en: "Umbrellas",
  categories: ["Umbrellas"],
  image: imgUmbrella,
};

const GIFTS: Tile[] = [
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs"], image: imgMug },
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles"], image: imgBottle },
  { lv: "Piezīmju grāmatiņas", en: "Notebooks", categories: ["Notebooks"], image: imgNotebook },
  { lv: "Atslēgu piekariņi", en: "Keychains", categories: ["Keychains & Keyrings"], image: imgKeychain },
  { lv: "Austiņas", en: "Headphones", categories: ["Headphones"], image: imgHeadphones },
];

// Manufacturer chips — mirror the "Ražotājs" facet in the sidebar filter.
// Stanley/Stella pinned first with red accent treatment.
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

// Reusable photo tile — object-cover image + dark gradient + red hover wash.
function PhotoTile({
  tile,
  onNavigate,
  aspect,
  size = "md",
}: {
  tile: Tile;
  onNavigate?: () => void;
  aspect: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      to={buildCategoryHref(tile.categories)}
      onClick={onNavigate}
      role="menuitem"
      className={`group relative overflow-hidden rounded-sm ${aspect}`}
    >
      <img
        src={tile.image}
        alt={tile.lv}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute inset-0 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/40" />
      <span
        className={`absolute left-3 bottom-3 font-heading font-bold uppercase tracking-[0.18em] text-white ${
          size === "sm" ? "text-[10px]" : "text-[11px]"
        }`}
      >
        {tile.lv}
      </span>
    </Link>
  );
}

// Wide horizontal tile used for the gift-material list.
function WideTile({ tile, onNavigate }: { tile: Tile; onNavigate?: () => void }) {
  return (
    <Link
      to={buildCategoryHref(tile.categories)}
      onClick={onNavigate}
      role="menuitem"
      className="group relative flex h-16 items-center overflow-hidden rounded-sm border border-white/10"
    >
      <img
        src={tile.image}
        alt={tile.lv}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
      />
      <div className="absolute inset-0 bg-black/60 transition-colors duration-500 group-hover:bg-accent/60" />
      <div className="relative flex h-full w-full items-center justify-between px-5">
        <span className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white">
          {tile.lv}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-white/40 transition-all group-hover:translate-x-1 group-hover:text-white" />
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
      {/* Top banner — Visi produkti */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group flex items-center justify-between border-b border-white/5 bg-white px-5 py-3 text-black transition-colors hover:bg-white/95 lg:px-8"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
            <div className="bg-accent" />
            <div className="bg-accent" />
            <div className="bg-accent" />
            <div className="bg-accent" />
          </div>
          <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] sm:text-sm">
            {t("Visi produkti", "All products")}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-black/30 transition-all group-hover:translate-x-1 group-hover:text-accent" />
      </Link>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12 lg:gap-8 lg:p-8">
        {/* Apģērbi — 4 col × 2 rows */}
        <section className="lg:col-span-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" />
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
              {t("Apģērbi", "Apparel")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {APPAREL.map((tile) => (
              <PhotoTile
                key={tile.en}
                tile={tile}
                onNavigate={onNavigate}
                aspect="aspect-[3/4]"
                size="sm"
              />
            ))}
          </div>
        </section>

        {/* Aksesuāri — 2×2 grid + wide umbrella */}
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" />
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
              {t("Aksesuāri", "Accessories")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACCESSORIES.map((tile) => (
              <PhotoTile
                key={tile.en}
                tile={tile}
                onNavigate={onNavigate}
                aspect="aspect-square"
                size="sm"
              />
            ))}
            <div className="col-span-2">
              <Link
                to={buildCategoryHref(UMBRELLA.categories)}
                onClick={onNavigate}
                role="menuitem"
                className="group relative block h-16 overflow-hidden rounded-sm"
              >
                <img
                  src={UMBRELLA.image}
                  alt={UMBRELLA.lv}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent transition-colors group-hover:bg-accent/50" />
                <span className="absolute left-3 bottom-2 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  {UMBRELLA.lv}
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Prezentmateriāli — stacked wide rows */}
        <section className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" />
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
              {t("Prezentmateriāli", "Business gifts")}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {GIFTS.map((tile) => (
              <WideTile key={tile.en} tile={tile} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      </div>

      {/* Manufacturers */}
      <div className="border-t border-white/5 bg-black/40 px-5 py-4 lg:px-8 lg:py-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            {t("Ražotāji", "Manufacturers")}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MANUFACTURERS.map((m) => (
            <Link
              key={m.token}
              to={buildManufacturerHref(m.token)}
              onClick={onNavigate}
              role="menuitem"
              className={
                m.featured
                  ? "rounded-sm border-2 border-accent bg-accent/10 px-3.5 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_0_15px_rgba(228,3,46,0.25)] transition-colors hover:bg-accent"
                  : "rounded-sm border border-white/10 px-3.5 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 transition-all hover:border-white/30 hover:text-white"
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
