import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import featureImage from "@/assets/megamenu-feature.jpg";

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

type Entry = { lv: string; en: string; cats: string[] };
type Group = {
  lv: string;
  en: string;
  allLv: string;
  allEn: string;
  items: Entry[];
};

const TOPS: Entry[] = [
  { lv: "T-krekli un topi", en: "T-shirts & tops", cats: ["T-shirts", "Tops", "Tees"] },
  { lv: "Polo krekli", en: "Polos", cats: ["Polos", "Polo shirts"] },
  { lv: "Krekli", en: "Shirts", cats: ["Shirts"] },
  { lv: "Hūdiji", en: "Hoodies", cats: ["Hoodies", "Hoodie sweatshirts"] },
  {
    lv: "Džemperi un flīsi",
    en: "Sweatshirts & fleece",
    cats: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"],
  },
];

const OUTERWEAR: Entry[] = [
  { lv: "Virsjakas", en: "Jackets", cats: ["Jackets", "Non Padded Jacket", "Jackets-Vests"] },
  { lv: "Vestes", en: "Bodywarmers", cats: ["Bodywarmers", "Vests"] },
  {
    lv: "Atstarojošais apģērbs",
    en: "Hi-vis clothing",
    cats: ["Safety", "Safety Vests", "Hi-vis"],
  },
];

const BOTTOMS: Entry[] = [
  { lv: "Bikses", en: "Trousers", cats: ["Bottoms", "Trousers-shorts", "Trousers"] },
  { lv: "Šorti", en: "Shorts", cats: ["Shorts", "Shorts & Trousers"] },
  {
    lv: "Sporta apģērbs",
    en: "Sportswear",
    cats: ["Sportswear", "Sports", "Fitness & Sport", "Training Set", "Training pants"],
  },
  { lv: "Zeķes", en: "Socks", cats: ["Socks"] },
];

const WORKWEAR: Entry[] = [
  { lv: "Darba apģērbs", en: "Workwear", cats: ["Workwear", "Coveralls"] },
  { lv: "Darba apavi", en: "Safety footwear", cats: ["Shoes", "Safety Footwear"] },
  { lv: "Cimdi", en: "Gloves", cats: ["Gloves"] },
  { lv: "Priekšauti", en: "Aprons", cats: ["Aprons"] },
];

const HEADWEAR: Entry[] = [
  { lv: "Cepures", en: "Caps & beanies", cats: ["Caps & Hats", "Caps", "Headwear", "Beanies"] },
  { lv: "Šalles", en: "Scarves", cats: ["Scarves"] },
  { lv: "Dvieļi", en: "Towels", cats: ["Towels", "Terry"] },
  { lv: "Pledi", en: "Blankets", cats: ["Blankets", "Fleece Blankets"] },
];

const BAGS: Entry[] = [
  {
    lv: "Auduma somas",
    en: "Tote bags",
    cats: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"],
  },
  { lv: "Mugursomas", en: "Backpacks", cats: ["Backpacks", "Laptop Backpacks"] },
  { lv: "Datoru somas", en: "Laptop bags", cats: ["Laptop & Tablet Bags"] },
  {
    lv: "Biznesa somas",
    en: "Business bags",
    cats: ["Business Bags", "Portfolios", "Conference Bags"],
  },
  {
    lv: "Sporta somas",
    en: "Sports bags",
    cats: ["Sports Bags", "Travel Bags", "Trolleys & Suitcases"],
  },
  { lv: "Jostas somas", en: "Waist bags", cats: ["Waist Bags", "Belt Bags"] },
  { lv: "Aukstumsomas", en: "Cooler bags", cats: ["Cooler Bags"] },
];

const DRINKWARE: Entry[] = [
  {
    lv: "Pudeles un termosi",
    en: "Bottles",
    cats: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"],
  },
  {
    lv: "Krūzes",
    en: "Mugs",
    cats: ["Mugs", "Standard Mugs", "Insulated Mugs", "Travel Mugs"],
  },
  {
    lv: "Glāzes un vīna aksesuāri",
    en: "Glasses & wine",
    cats: ["Glasses", "Bar glass", "Carafes", "Wine Accessories", "Bottle Openers & Accessories"],
  },
];

const PROMO: Entry[] = [
  {
    lv: "Bloknoti un pildspalvas",
    en: "Notebooks & pens",
    cats: [
      "Hard Cover Notebooks",
      "Soft Cover Notebooks",
      "Notepads",
      "Ballpoint Pens",
      "Rollerball Pens",
      "Pencils",
    ],
  },
  { lv: "Austiņas un skaļruņi", en: "Audio", cats: ["Speakers", "Earbuds", "Headphones"] },
  {
    lv: "Lādētāji un USB",
    en: "Chargers & USB",
    cats: [
      "Power Banks",
      "Wireless Charging",
      "Chargers",
      "Cables",
      "USB Flash Drives",
      "USB Hubs",
    ],
  },
  {
    lv: "Lietussargi",
    en: "Umbrellas",
    cats: ["Standard Umbrellas", "Folding Umbrellas", "Golf Umbrellas", "Storm Umbrellas"],
  },
  { lv: "Dāvanu komplekti", en: "Gift sets", cats: ["Gift Sets"] },
  {
    lv: "Biroja piederumi",
    en: "Office accessories",
    cats: ["Office", "Desk Accessories", "Office Stands & Holders", "Sticky Notes"],
  },
];

const COLUMNS: Group[][] = [
  [
    { lv: "Topi", en: "Tops", allLv: "Visi topi", allEn: "All tops", items: TOPS },
    {
      lv: "Virsjakas un vestes",
      en: "Jackets & vests",
      allLv: "Visas virsjakas",
      allEn: "All jackets",
      items: OUTERWEAR,
    },
  ],
  [
    { lv: "Bikses un šorti", en: "Bottoms", allLv: "Visas bikses", allEn: "All bottoms", items: BOTTOMS },
    {
      lv: "Darba apģērbs",
      en: "Workwear",
      allLv: "Viss darba apģērbs",
      allEn: "All workwear",
      items: WORKWEAR,
    },
  ],
  [
    {
      lv: "Cepures un tekstils",
      en: "Headwear & textiles",
      allLv: "Visas cepures",
      allEn: "All headwear",
      items: HEADWEAR,
    },
    {
      lv: "Somas un aksesuāri",
      en: "Bags & accessories",
      allLv: "Visas somas",
      allEn: "All bags & accessories",
      items: BAGS,
    },
  ],
  [
    {
      lv: "Krūzes un pudeles",
      en: "Drinkware",
      allLv: "Visas krūzes un pudeles",
      allEn: "All drinkware",
      items: DRINKWARE,
    },
    {
      lv: "Prezentmateriāli",
      en: "Promo & gifts",
      allLv: "Visi prezentmateriāli",
      allEn: "All promo & gifts",
      items: PROMO,
    },
  ],
];

const buildCategoryHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;
const buildManufacturerHref = (token: string) =>
  `/catalog?source=${encodeURIComponent(token)}`;

function GroupBlock({ group, onNavigate }: { group: Group; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const allCats = Array.from(new Set(group.items.flatMap((i) => i.cats)));
  return (
    <div>
      <h3 className="mb-2.5 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
        {lang === "lv" ? group.lv : group.en}
      </h3>
      <ul className="space-y-1.5">
        {group.items.map((item) => (
          <li key={item.en}>
            <Link
              to={buildCategoryHref(item.cats)}
              onClick={onNavigate}
              role="menuitem"
              className="block text-[12.5px] leading-snug text-primary-foreground/65 transition-colors hover:text-accent"
            >
              {lang === "lv" ? item.lv : item.en}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to={buildCategoryHref(allCats)}
            onClick={onNavigate}
            role="menuitem"
            className="inline-flex items-center gap-1 text-[12.5px] font-bold leading-snug text-primary-foreground transition-colors hover:text-accent"
          >
            {lang === "lv" ? group.allLv : group.allEn}
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </Link>
        </li>
      </ul>
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
      className="overflow-hidden bg-primary text-primary-foreground"
    >
      <div className="flex max-h-[70vh] overflow-y-auto">
        {/* Feature image */}
        <div className="relative hidden w-[210px] shrink-0 lg:block">
          <img
            src={featureImage}
            alt={t("Apdrukāts apģērbs", "Branded apparel")}
            loading="lazy"
            width={640}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-heading text-[11px] font-bold uppercase leading-tight tracking-[0.16em] text-primary-foreground">
              {t("Apdruka jebkurā apjomā", "Branding at any volume")}
            </p>
            <Link
              to="/services"
              onClick={onNavigate}
              role="menuitem"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent hover:text-primary-foreground"
            >
              {t("Pakalpojumi", "Services")}
              <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Text columns */}
        <div className="min-w-0 flex-1 px-6 py-6">
          <div className="grid grid-cols-2 gap-x-7 gap-y-7 md:grid-cols-4">
            {COLUMNS.map((col, i) => (
              <div key={i} className="space-y-6">
                {col.map((g) => (
                  <GroupBlock key={g.en} group={g} onNavigate={onNavigate} />
                ))}
              </div>
            ))}
          </div>

          {/* Manufacturers */}
          <div className="mt-6 border-t border-primary-foreground/10 pt-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
                      ? "font-heading text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent hover:text-primary-foreground"
                      : "font-heading text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-foreground/60 transition-colors hover:text-primary-foreground"
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
        className="group flex items-center justify-between bg-accent px-6 py-3 text-accent-foreground transition-colors hover:bg-accent/90"
      >
        <span className="font-heading text-[13px] font-bold uppercase tracking-[0.24em]">
          {t("Skatīt visus produktus", "Browse all products")}
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
