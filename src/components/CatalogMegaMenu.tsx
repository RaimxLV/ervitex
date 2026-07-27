import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";

// Category tile photos.
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

// Priority: big/high-value items first, small trinkets last.
const APPAREL: Tile[] = [
  { lv: "Jakas", en: "Jackets", categories: ["Jackets"], image: imgJacket },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies"], image: imgHoodie },
  { lv: "Džemperi", en: "Sweaters", categories: ["Sweaters"], image: imgSweater },
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts"], image: imgTshirt },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos"], image: imgPolo },
  { lv: "Vestes", en: "Vests", categories: ["Vests"], image: imgVest },
  { lv: "Bikses", en: "Trousers", categories: ["Trousers"], image: imgPants },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts"], image: imgShorts },
];

const ACCESSORIES: Tile[] = [
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks"], image: imgBackpack },
  { lv: "Somas", en: "Bags", categories: ["Bags"], image: imgBag },
  { lv: "Cepures", en: "Caps & Hats", categories: ["Caps & Hats"], image: imgCap },
  { lv: "Maisiņi", en: "Tote Bags", categories: ["Tote Bags"], image: imgTote },
  { lv: "Lietussargi", en: "Umbrellas", categories: ["Umbrellas"], image: imgUmbrella },
];

const GIFTS: Tile[] = [
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles"], image: imgBottle },
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs"], image: imgMug },
  { lv: "Austiņas", en: "Headphones", categories: ["Headphones"], image: imgHeadphones },
  { lv: "Piezīmju grāmatiņas", en: "Notebooks", categories: ["Notebooks"], image: imgNotebook },
  { lv: "Atslēgu piekariņi", en: "Keychains", categories: ["Keychains & Keyrings"], image: imgKeychain },
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

// Photo tile: light-fashion look, subtle bottom label plate — no heavy dark overlay.
function PhotoTile({
  tile,
  onNavigate,
  aspect,
}: {
  tile: Tile;
  onNavigate?: () => void;
  aspect: string;
}) {
  return (
    <Link
      to={buildCategoryHref(tile.categories)}
      onClick={onNavigate}
      role="menuitem"
      className={`group relative block overflow-hidden rounded-sm bg-neutral-100 ${aspect}`}
    >
      <img
        src={tile.image}
        alt={tile.lv}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Minimal bottom label — no full dark wash */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-2.5 py-2">
        <span className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white">
          {tile.lv}
        </span>
      </div>
      {/* Red hover accent frame */}
      <div className="pointer-events-none absolute inset-0 ring-0 ring-accent transition-all duration-300 group-hover:ring-2" />
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
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-12 lg:gap-6 lg:p-6">
        {/* Apģērbi — priority section, 4×2 */}
        <section className="lg:col-span-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" />
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
              {t("Apģērbi", "Apparel")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {APPAREL.map((tile) => (
              <PhotoTile
                key={tile.en}
                tile={tile}
                onNavigate={onNavigate}
                aspect="aspect-[3/4]"
              />
            ))}
          </div>
        </section>

        {/* Aksesuāri — 5 tiles */}
        <section className="lg:col-span-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-accent" />
            <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
              {t("Aksesuāri", "Accessories")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {ACCESSORIES.slice(0, 2).map((tile) => (
              <PhotoTile
                key={tile.en}
                tile={tile}
                onNavigate={onNavigate}
                aspect="aspect-[3/4]"
              />
            ))}
            <div className="grid grid-cols-1 gap-1.5">
              {ACCESSORIES.slice(2, 4).map((tile) => (
                <PhotoTile
                  key={tile.en}
                  tile={tile}
                  onNavigate={onNavigate}
                  aspect="aspect-[3/2]"
                />
              ))}
            </div>
            <div className="col-span-2 sm:col-span-3">
              <PhotoTile
                tile={ACCESSORIES[4]}
                onNavigate={onNavigate}
                aspect="aspect-[16/5]"
              />
            </div>
          </div>

          {/* Prezentmateriāli — lighter, no dark overlay */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-accent" />
              <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                {t("Prezentmateriāli", "Business gifts")}
              </h3>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {GIFTS.map((tile) => (
                <PhotoTile
                  key={tile.en}
                  tile={tile}
                  onNavigate={onNavigate}
                  aspect="aspect-square"
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Manufacturers */}
      <div className="border-t border-white/5 bg-black/40 px-5 py-4 lg:px-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-accent" />
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
                  ? "rounded-sm border-2 border-accent bg-accent/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_0_15px_rgba(228,3,46,0.25)] transition-colors hover:bg-accent"
                  : "rounded-sm border border-white/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 transition-all hover:border-white/30 hover:text-white"
              }
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA — Visi produkti, prominent */}
      <Link
        to="/catalog"
        onClick={onNavigate}
        role="menuitem"
        className="group flex items-center justify-between border-t border-accent bg-accent px-5 py-4 text-white transition-colors hover:bg-accent/90 lg:px-6"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white" />
          </div>
          <span className="font-heading text-sm font-bold uppercase tracking-[0.24em]">
            {t("Skatīt visus produktus", "Browse all products")}
          </span>
        </div>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
