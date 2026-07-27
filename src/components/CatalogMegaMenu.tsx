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
  { label: "Beechfield Brands", token: "bb" },
  { label: "Malfini", token: "mf" },
  { label: "Prezentmateriāli", token: "pf" },
];

type Tile = { lv: string; en: string; cats: string[]; img?: string };
type TextLink = { lv: string; en: string; cats: string[] };
type TextGroup = { lv: string; en: string; links: TextLink[] };

const img = (key: string) => FALLBACK_IMAGES[key];

// COLUMN 1 — Tops (image tiles)
const COL1: Tile[] = [
  { lv: "T-krekli", en: "T-shirts", cats: ["T-shirts", "Tops"], img: img("t-shirts") },
  { lv: "Polo krekli", en: "Polos", cats: ["Polos", "Polo shirts"], img: img("polos") },
  { lv: "Hūdiji", en: "Hoodies", cats: ["Hoodies", "Hoodie sweatshirts"], img: img("hoodies") },
  { lv: "Džemperi", en: "Sweatshirts", cats: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], img: img("sweatshirts") },
  { lv: "Virsjakas", en: "Jackets", cats: ["Jackets", "Non Padded Jacket", "Jackets-Vests"], img: img("jackets") },
  { lv: "Vestes", en: "Vests", cats: ["Bodywarmers", "Safety Vests"], img: img("vests") },
];

// COLUMN 2 — Apparel, headwear, footwear (image tiles)
const COL2: Tile[] = [
  { lv: "Cepures", en: "Caps & hats", cats: ["Caps & Hats", "Caps", "Headwear", "Beanies"], img: img("caps & hats") },
  { lv: "Darba apģērbs", en: "Workwear", cats: ["Workwear", "Safety"], img: img("workwear") },
  { lv: "Krekli", en: "Shirts", cats: ["Shirts"], img: img("shirts") },
  { lv: "Bikses un šorti", en: "Trousers & shorts", cats: ["Bottoms", "Trousers-shorts", "Shorts & Trousers", "Trousers", "Shorts"], img: img("trousers") },
  { lv: "Apavi", en: "Shoes", cats: ["Shoes", "Safety Footwear"], img: img("shoes") },
  { lv: "Cimdi", en: "Gloves", cats: ["Gloves"], img: img("gloves") },
];

// COLUMN 3 — Bags & textiles (grouped text)
const COL3: TextGroup[] = [
  {
    lv: "Somas un ceļojumi",
    en: "Bags & travel",
    links: [
      { lv: "Somas un mugursomas", en: "Bags & backpacks", cats: ["Bags", "Backpacks", "Travel Bags", "Sports Bags", "Cooler Bags", "Laptop Backpacks"] },
      { lv: "Datora un biznesa somas", en: "Laptop & business bags", cats: ["Laptop & Tablet Bags", "Business Bags", "Portfolios"] },
      { lv: "Iepirkumu maisiņi", en: "Tote bags", cats: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"] },
      { lv: "Ceļojumu aksesuāri", en: "Travel accessories", cats: ["Travel Accessories", "Toiletry Bags"] },
    ],
  },
  {
    lv: "Tekstils",
    en: "Textiles",
    links: [
      { lv: "Priekšauti", en: "Aprons", cats: ["Aprons"] },
      { lv: "Dvieļi", en: "Towels", cats: ["Towels"] },
      { lv: "Sedzas un pledi", en: "Blankets", cats: ["Blankets", "Fleece Blankets"] },
    ],
  },
];

// COLUMN 4 — Promo & souvenirs (grouped text)
const COL4: TextGroup[] = [
  {
    lv: "Dzērienu trauki",
    en: "Drinkware",
    links: [
      {
        lv: "Pudeles, krūzes, glāzes un karafes",
        en: "Bottles, mugs, glasses & carafes",
        cats: [
          "Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles",
          "Mugs", "Insulated Mugs", "Travel Mugs", "Standard Mugs",
          "Glasses", "Carafes",
        ],
      },
    ],
  },
  {
    lv: "Birojs un elektronika",
    en: "Office & electronics",
    links: [
      {
        lv: "Bloknoti un pildspalvas",
        en: "Notebooks & pens",
        cats: [
          "Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads", "Sticky Notes",
          "Ballpoint Pens", "Rollerball Pens", "Fountain Pens", "Other Pens & Writing Accessories", "Pencils",
        ],
      },
      {
        lv: "Ārējie akumulatori, USB, austiņas un skaļruņi",
        en: "Power banks, USB, audio",
        cats: [
          "Power Banks", "Wireless Charging", "Chargers",
          "USB Flash Drives", "USB Hubs",
          "Speakers", "Earbuds", "Headphones",
        ],
      },
      { lv: "Datoru un biroja piederumi", en: "Computer & office accessories", cats: ["Office Stands & Holders", "Office", "Desk Accessories"] },
    ],
  },
  {
    lv: "Suvenīri un citi piederumi",
    en: "Souvenirs & accessories",
    links: [
      { lv: "Lietussargi un dāvanu komplekti", en: "Umbrellas & gift sets", cats: ["Standard Umbrellas", "Folding Umbrellas", "Golf Umbrellas", "Storm Umbrellas", "Gift Sets"] },
      { lv: "Vīna, auto un virtuves piederumi", en: "Wine, car & kitchen", cats: ["Wine Accessories", "Car Accessories", "Serving Boards", "Lunch Boxes", "Kitchen"] },
      { lv: "Sports, spēles, instrumenti, maki", en: "Sports, games, tools, wallets", cats: ["Fitness & Sport", "Sunglasses", "Games", "Multitools", "Tool Sets", "Wallets"] },
      { lv: "Atslēgu piekariņi, personīgā aprūpe, katalogi", en: "Keychains, personal care, catalogs", cats: ["Keychains & Keyrings", "Personal Care", "Catalogs"] },
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
            <div className="mt-1 truncate font-heading text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary-foreground/85 transition-colors group-hover:text-accent">
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
      <div className="max-h-[65vh] overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1 */}
            <div>
              <ColumnHeader>{t("Apģērbi — augšdaļa", "Apparel — tops")}</ColumnHeader>
              <TileGrid tiles={COL1} onNavigate={onNavigate} />
            </div>

            {/* Column 2 */}
            <div>
              <ColumnHeader>{t("Apģērbi, cepures un apavi", "Apparel, headwear & footwear")}</ColumnHeader>
              <TileGrid tiles={COL2} onNavigate={onNavigate} />
            </div>

            {/* Column 3 */}
            <div>
              <ColumnHeader>{t("Somas un tekstils", "Bags & textiles")}</ColumnHeader>
              <TextGroups groups={COL3} onNavigate={onNavigate} />
            </div>

            {/* Column 4 */}
            <div>
              <ColumnHeader>{t("Prezentmateriāli un suvenīri", "Promo & souvenirs")}</ColumnHeader>
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
