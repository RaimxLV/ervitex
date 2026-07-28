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
type TextGroup = { lv: string; en: string; links: TextLink[] };

const img = (key: string) => FALLBACK_IMAGES[key];

// COLUMN 1 — Core garments (image tiles)
const COL1: Tile[] = [
  { lv: "T-krekli un topi", en: "T-shirts & tops", cats: ["T-shirts", "Tops", "Tees"], img: img("t-shirts") },
  { lv: "Polo krekli", en: "Polos", cats: ["Polos", "Polo shirts"], img: img("polos") },
  { lv: "Krekli", en: "Shirts", cats: ["Shirts"], img: img("shirts") },
  { lv: "Hūdiji, džemperi un flīsi", en: "Hoodies, sweatshirts & fleece", cats: ["Hoodies", "Hoodie sweatshirts", "Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], img: img("hoodies") },
  { lv: "Virsjakas un vestes", en: "Jackets & vests", cats: ["Jackets", "Non Padded Jacket", "Jackets-Vests", "Bodywarmers"], img: img("jackets") },
  { lv: "Bikses un šorti", en: "Trousers & shorts", cats: ["Bottoms", "Trousers-shorts", "Shorts & Trousers", "Trousers", "Shorts"], img: img("trousers") },
  { lv: "Sporta apģērbs", en: "Sportswear", cats: ["Sportswear", "Sports", "Fitness & Sport", "Training Set", "Training pants"], img: img("sweatshirts") },
];

// COLUMN 2 — Workwear, headwear & textiles (image tiles)
const COL2: Tile[] = [
  { lv: "Darba apģērbs un kombinezoni", en: "Workwear & coveralls", cats: ["Workwear", "Coveralls"], img: img("workwear") },
  { lv: "Atstarojošais apģērbs", en: "Hi-vis clothing", cats: ["Safety", "Safety Vests", "Hi-vis"], img: img("vests") },
  { lv: "Darba apavi", en: "Safety footwear", cats: ["Shoes", "Safety Footwear"], img: img("shoes") },
  { lv: "Cepures", en: "Caps & beanies", cats: ["Caps & Hats", "Caps", "Headwear", "Beanies"], img: img("caps & hats") },
  { lv: "Cimdi un šalles", en: "Gloves & scarves", cats: ["Gloves", "Scarves"], img: img("gloves") },
  { lv: "Dvieļi un pledi", en: "Towels & blankets", cats: ["Towels", "Terry", "Blankets", "Fleece Blankets"], img: img("towels") },
];

// COLUMN 3 — Bags & travel (grouped text)
const COL3: TextGroup[] = [
  {
    lv: "Somas un ceļojumi",
    en: "Bags & travel",
    links: [
      { lv: "Auduma somas un iepirkumu maisiņi", en: "Tote & shopping bags", cats: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"] },
      { lv: "Mugursomas", en: "Backpacks", cats: ["Backpacks", "Laptop Backpacks"] },
      { lv: "Datoru un biznesa somas", en: "Laptop & business bags", cats: ["Laptop & Tablet Bags", "Business Bags", "Portfolios", "Conference Bags"] },
      { lv: "Sporta somas", en: "Sports bags", cats: ["Sports Bags"] },
      { lv: "Ceļojumu somas un koferi", en: "Travel bags & trolleys", cats: ["Travel Bags", "Trolleys & Suitcases"] },
      { lv: "Aukstumsomas un ceļojumu piederumi", en: "Cooler bags & travel accessories", cats: ["Cooler Bags", "Travel Accessories", "Toiletry Bags"] },
    ],
  },
];

// COLUMN 4 — Promo & gifts (grouped text)
const COL4: TextGroup[] = [
  {
    lv: "Dzērienu trauki",
    en: "Drinkware",
    links: [
      { lv: "Pudeles un termosi", en: "Bottles & thermoses", cats: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"] },
      { lv: "Krūzes un termokrūzes", en: "Mugs & travel mugs", cats: ["Mugs", "Standard Mugs", "Insulated Mugs", "Travel Mugs"] },
      { lv: "Glāzes, karafes un vīna aksesuāri", en: "Glasses, carafes & wine", cats: ["Glasses", "Bar glass", "Carafes", "Wine Accessories", "Bottle Openers & Accessories"] },
    ],
  },
  {
    lv: "Virtuve",
    en: "Kitchen",
    links: [
      { lv: "Priekšauti, virtuves tekstils un dēlīši", en: "Aprons, kitchen textiles & boards", cats: ["Aprons", "Kitchen", "Serving Boards", "Lunch Boxes", "BBQ Accessories", "Chef's Knives"] },
    ],
  },
  {
    lv: "Birojs un rakstāmpiederumi",
    en: "Office & writing",
    links: [
      { lv: "Pildspalvas, zīmuļi un bloknoti", en: "Pens, pencils & notebooks", cats: ["Ballpoint Pens", "Rollerball Pens", "Fountain Pens", "Other Pens & Writing Accessories", "Pencils", "Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads", "Sticky Notes", "Office", "Desk Accessories", "Office Stands & Holders"] },
    ],
  },
  {
    lv: "Tehnoloģijas",
    en: "Technology",
    links: [
      { lv: "Ārējie akumulatori, USB un austiņas", en: "Power banks, USB & audio", cats: ["Power Banks", "Wireless Charging", "Chargers", "Cables", "USB Flash Drives", "USB Hubs", "Speakers", "Earbuds", "Headphones", "Telephone & Tablet Accessories", "Computer Accessories"] },
    ],
  },
  {
    lv: "Dāvanas un piederumi",
    en: "Gifts & accessories",
    links: [
      { lv: "Lietussargi", en: "Umbrellas", cats: ["Standard Umbrellas", "Folding Umbrellas", "Golf Umbrellas", "Storm Umbrellas"] },
      { lv: "Dāvanu komplekti", en: "Gift sets", cats: ["Gift Sets"] },
      { lv: "Instrumenti", en: "Tools", cats: ["Multitools", "Tool Sets"] },
      { lv: "Auto piederumi", en: "Car accessories", cats: ["Car Accessories"] },
    ],
  },
];

const buildCategoryHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;
const buildManufacturerHref = (token: string) =>
  `/catalog?source=${encodeURIComponent(token)}`;

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/50">
      {children}
    </h3>
  );
}

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-accent/90">
      {children}
    </h4>
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

function TextGroups({ groups, onNavigate }: { groups: TextGroup[]; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.en}>
          <GroupHeader>{lang === "lv" ? g.lv : g.en}</GroupHeader>
          <ul className="space-y-1">
            {g.links.map((l) => (
              <li key={l.en}>
                <Link
                  to={buildCategoryHref(l.cats)}
                  onClick={onNavigate}
                  role="menuitem"
                  className="group inline-flex items-start gap-1.5 text-[12.5px] leading-snug text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  <span>{lang === "lv" ? l.lv : l.en}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
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
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 */}
            <div>
              <ColumnHeader>{t("Apģērbi", "Apparel")}</ColumnHeader>
              <TileGrid tiles={COL1} onNavigate={onNavigate} />
            </div>

            {/* Column 2 */}
            <div>
              <ColumnHeader>{t("Specializētais apģērbs un tekstils", "Workwear, headwear & textiles")}</ColumnHeader>
              <TileGrid tiles={COL2} onNavigate={onNavigate} />
            </div>

            {/* Column 3 */}
            <div>
              <ColumnHeader>{t("Somas un ceļojumi", "Bags & travel")}</ColumnHeader>
              <TextGroups groups={COL3} onNavigate={onNavigate} />
            </div>

            {/* Column 4 */}
            <div>
              <ColumnHeader>{t("Prezentmateriāli un dāvanas", "Promo & gifts")}</ColumnHeader>
              <TextGroups groups={COL4} onNavigate={onNavigate} />
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
