import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import { FALLBACK_IMAGES } from "@/lib/megaMenuImages";

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
  { label: "Russell", token: "ru" },
  { label: "Beechfield Brands", token: "bb" },
  { label: "Malfini", token: "mf" },
  { label: "Prezentmateriāli", token: "pf" },
];

type Tile = { lv: string; en: string; cats: string[]; img?: string };
type TextLink = { lv: string; en: string; cats: string[] };

const img = (key: string) => FALLBACK_IMAGES[key];

// COLUMN 1 — Apparel
const COL1: Tile[] = [
  { lv: "T-krekli un topi", en: "T-shirts & tops", cats: ["T-shirts", "Tops", "Tees"], img: img("t-shirts") },
  { lv: "Polo krekli", en: "Polos", cats: ["Polos", "Polo shirts"], img: img("polos") },
  { lv: "Krekli", en: "Shirts", cats: ["Shirts"], img: img("shirts") },
  { lv: "Hūdiji", en: "Hoodies", cats: ["Hoodies", "Hoodie sweatshirts"], img: img("hoodies") },
  { lv: "Džemperi un flīsi", en: "Sweatshirts & fleece", cats: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], img: img("sweatshirts") },
  { lv: "Virsjakas", en: "Jackets", cats: ["Jackets", "Non Padded Jacket", "Jackets-Vests"], img: img("jackets") },
  { lv: "Vestes", en: "Bodywarmers", cats: ["Bodywarmers", "Vests"], img: img("vests") },
  { lv: "Bikses", en: "Trousers", cats: ["Bottoms", "Trousers-shorts", "Trousers"], img: img("trousers") },
  { lv: "Šorti", en: "Shorts", cats: ["Shorts", "Shorts & Trousers"], img: img("shorts") },
];

const COL1_LINKS: TextLink[] = [
  { lv: "Sporta apģērbs", en: "Sportswear", cats: ["Sportswear", "Sports", "Fitness & Sport", "Training Set", "Training pants"] },
  { lv: "Zeķes", en: "Socks", cats: ["Socks"] },
];

// COLUMN 2 — Workwear, headwear & textiles
const COL2: Tile[] = [
  { lv: "Darba apģērbs", en: "Workwear", cats: ["Workwear", "Coveralls"], img: img("workwear") },
  { lv: "Atstarojošais apģērbs", en: "Hi-vis clothing", cats: ["Safety", "Safety Vests", "Hi-vis"], img: img("vests") },
  { lv: "Darba apavi", en: "Safety footwear", cats: ["Shoes", "Safety Footwear"], img: img("shoes") },
  { lv: "Cepures", en: "Caps & beanies", cats: ["Caps & Hats", "Caps", "Headwear", "Beanies"], img: img("caps & hats") },
  { lv: "Cimdi", en: "Gloves", cats: ["Gloves"], img: img("gloves") },
  { lv: "Šalles", en: "Scarves", cats: ["Scarves"], img: img("scarves") },
  { lv: "Dvieļi", en: "Towels", cats: ["Towels", "Terry"], img: img("towels") },
  { lv: "Pledi", en: "Blankets", cats: ["Blankets", "Fleece Blankets"], img: img("towels") },
  { lv: "Priekšauti", en: "Aprons", cats: ["Aprons"], img: img("aprons") },
];

// COLUMN 3 — Bags & accessories (renamed: no "travel")
const COL3: Tile[] = [
  { lv: "Auduma somas", en: "Tote bags", cats: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"], img: img("tote bags") },
  { lv: "Mugursomas", en: "Backpacks", cats: ["Backpacks", "Laptop Backpacks"], img: img("backpacks") },
  { lv: "Datoru somas", en: "Laptop bags", cats: ["Laptop & Tablet Bags"], img: img("laptop bags") },
  { lv: "Biznesa somas", en: "Business bags", cats: ["Business Bags", "Portfolios", "Conference Bags"], img: img("business bags") },
  { lv: "Sporta somas", en: "Sports bags", cats: ["Sports Bags", "Travel Bags", "Trolleys & Suitcases"], img: img("bags") },
  { lv: "Jostas somas", en: "Waist bags", cats: ["Waist Bags", "Belt Bags"], img: img("waist bags") },
];

const COL3_LINKS: TextLink[] = [
  { lv: "Aukstumsomas", en: "Cooler bags", cats: ["Cooler Bags"] },
  { lv: "Kosmētikas somiņas", en: "Toiletry bags", cats: ["Toiletry Bags", "Travel Accessories"] },
  { lv: "Atslēgu piekariņi", en: "Keyrings", cats: ["Keyrings", "Keychains"] },
];

// COLUMN 4 — Promo & gifts
const COL4: Tile[] = [
  { lv: "Pudeles un termosi", en: "Bottles", cats: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"], img: img("bottles") },
  { lv: "Krūzes", en: "Mugs", cats: ["Mugs", "Standard Mugs", "Insulated Mugs", "Travel Mugs"], img: img("mugs") },
  { lv: "Bloknoti un pildspalvas", en: "Notebooks & pens", cats: ["Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads", "Ballpoint Pens", "Rollerball Pens", "Pencils"], img: img("notebooks") },
  { lv: "Austiņas un skaļruņi", en: "Audio", cats: ["Speakers", "Earbuds", "Headphones"], img: img("audio") },
  { lv: "Lietussargi", en: "Umbrellas", cats: ["Standard Umbrellas", "Folding Umbrellas", "Golf Umbrellas", "Storm Umbrellas"], img: img("umbrellas") },
  { lv: "Dāvanu komplekti", en: "Gift sets", cats: ["Gift Sets"], img: img("keychains") },
];

const COL4_LINKS: TextLink[] = [
  { lv: "Glāzes un vīna aksesuāri", en: "Glasses & wine accessories", cats: ["Glasses", "Bar glass", "Carafes", "Wine Accessories", "Bottle Openers & Accessories"] },
  { lv: "Virtuve un pusdienu kastes", en: "Kitchen & lunch boxes", cats: ["Kitchen", "Serving Boards", "Lunch Boxes", "BBQ Accessories", "Chef's Knives"] },
  { lv: "Lādētāji un USB", en: "Chargers & USB", cats: ["Power Banks", "Wireless Charging", "Chargers", "Cables", "USB Flash Drives", "USB Hubs"] },
  { lv: "Biroja piederumi", en: "Office accessories", cats: ["Office", "Desk Accessories", "Office Stands & Holders", "Sticky Notes"] },
  { lv: "Instrumenti", en: "Tools", cats: ["Multitools", "Tool Sets"] },
  { lv: "Auto piederumi", en: "Car accessories", cats: ["Car Accessories"] },
];

const buildCategoryHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;
const buildManufacturerHref = (token: string) =>
  `/catalog?source=${encodeURIComponent(token)}`;

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-primary-foreground/10 pb-2 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/50">
      {children}
    </h3>
  );
}

function TileGrid({ tiles, onNavigate }: { tiles: Tile[]; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-x-2 gap-y-3">
      {tiles.map((t) => {
        const title = lang === "lv" ? t.lv : t.en;
        return (
          <Link
            key={t.en}
            to={buildCategoryHref(t.cats)}
            onClick={onNavigate}
            role="menuitem"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-sm bg-primary-foreground/5">
              <div className="aspect-square">
                {t.img ? (
                  <img
                    src={t.img}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary-foreground/30">
                    <span className="text-[9px] uppercase tracking-widest">—</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-1 line-clamp-2 font-heading text-[10.5px] font-semibold uppercase leading-tight tracking-[0.06em] text-primary-foreground/85 transition-colors group-hover:text-accent">
              {title}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function LinkList({ links, onNavigate }: { links: TextLink[]; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  if (!links.length) return null;
  return (
    <ul className="mt-4 space-y-1.5 border-t border-primary-foreground/10 pt-3">
      {links.map((l) => (
        <li key={l.en}>
          <Link
            to={buildCategoryHref(l.cats)}
            onClick={onNavigate}
            role="menuitem"
            className="block text-[12.5px] leading-snug text-primary-foreground/75 transition-colors hover:text-accent"
          >
            {lang === "lv" ? l.lv : l.en}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="bg-primary text-primary-foreground"
    >
      <div className="max-h-[62vh] overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <ColumnHeader>{t("Apģērbi", "Apparel")}</ColumnHeader>
              <TileGrid tiles={COL1} onNavigate={onNavigate} />
              <LinkList links={COL1_LINKS} onNavigate={onNavigate} />
            </div>

            <div>
              <ColumnHeader>{t("Darba apģērbs un tekstils", "Workwear & textiles")}</ColumnHeader>
              <TileGrid tiles={COL2} onNavigate={onNavigate} />
            </div>

            <div>
              <ColumnHeader>{t("Somas un aksesuāri", "Bags & accessories")}</ColumnHeader>
              <TileGrid tiles={COL3} onNavigate={onNavigate} />
              <LinkList links={COL3_LINKS} onNavigate={onNavigate} />
            </div>

            <div>
              <ColumnHeader>{t("Prezentmateriāli un dāvanas", "Promo & gifts")}</ColumnHeader>
              <TileGrid tiles={COL4} onNavigate={onNavigate} />
              <LinkList links={COL4_LINKS} onNavigate={onNavigate} />
            </div>
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
