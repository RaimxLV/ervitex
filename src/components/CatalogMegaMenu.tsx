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
import imgPants from "@/assets/menu/pants.jpg";
import imgShorts from "@/assets/menu/shorts.jpg";
import imgVest from "@/assets/menu/vest.jpg";
import imgShirt from "@/assets/menu/shirt.jpg";
import imgWorkwear from "@/assets/menu/workwear.jpg";
import imgApron from "@/assets/menu/apron.jpg";
import imgGloves from "@/assets/menu/gloves.jpg";
import imgTowel from "@/assets/menu/towel.jpg";
import imgLaptopBag from "@/assets/menu/laptopbag.jpg";
import imgBusinessBag from "@/assets/menu/businessbag.jpg";
import imgTravelAcc from "@/assets/menu/travelacc.jpg";
import imgTote from "@/assets/menu/tote.jpg";
import imgMug from "@/assets/menu/mug.jpg";
import imgNotebook from "@/assets/menu/notebook.jpg";
import imgHeadphones from "@/assets/menu/headphones.jpg";
import imgUmbrella from "@/assets/menu/umbrella.jpg";
import imgKeychain from "@/assets/menu/keychain.jpg";

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

// Validēts pret DB kategorijām (private.catalog_items_mv)
const APPAREL_TILES: TileItem[] = [
  { lv: "T-krekli", en: "T-shirts", categories: ["T-shirts", "Tops"], image: imgTshirt },
  { lv: "Polo krekli", en: "Polos", categories: ["Polos", "Polo shirts"], image: imgPolo },
  { lv: "Hūdiji", en: "Hoodies", categories: ["Hoodies", "Hoodie sweatshirts"], image: imgHoodie },
  { lv: "Džemperi", en: "Sweatshirts", categories: ["Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"], image: imgSweater },
  { lv: "Virsjakas", en: "Jackets", categories: ["Jackets", "Non Padded Jacket", "Jackets-Vests"], image: imgJacket },
  { lv: "Vestes", en: "Vests", categories: ["Bodywarmers", "Safety Vests"], image: imgVest },
  { lv: "Krekli", en: "Shirts", categories: ["Shirts"], image: imgShirt },
  { lv: "Bikses", en: "Trousers", categories: ["Bottoms", "Trousers-shorts", "Shorts & Trousers"], image: imgPants },
  { lv: "Šorti", en: "Shorts", categories: ["Shorts"], image: imgShorts },
  { lv: "Darba apģērbs", en: "Workwear", categories: ["Workwear", "Safety"], image: imgWorkwear },
  { lv: "Apavi", en: "Shoes", categories: ["Shoes", "Safety Footwear"], image: imgShoes },
  { lv: "Cepures", en: "Caps & hats", categories: ["Caps & Hats", "Caps", "Headwear", "Beanies"], image: imgCap },
  { lv: "Cimdi", en: "Gloves", categories: ["Gloves"], image: imgGloves },
  { lv: "Priekšauti", en: "Aprons", categories: ["Aprons"], image: imgApron },
  { lv: "Dvieļi", en: "Towels", categories: ["Towels"], image: imgTowel },
];

const BAG_TILES: TileItem[] = [
  { lv: "Somas", en: "Bags", categories: ["Bags", "Travel Bags", "Sports Bags", "Cooler Bags"], image: imgBag },
  { lv: "Mugursomas", en: "Backpacks", categories: ["Backpacks", "Laptop Backpacks"], image: imgBackpack },
  { lv: "Datora somas", en: "Laptop bags", categories: ["Laptop & Tablet Bags"], image: imgLaptopBag },
  { lv: "Biznesa somas", en: "Business bags", categories: ["Business Bags", "Portfolios"], image: imgBusinessBag },
  { lv: "Ceļojumu aksesuāri", en: "Travel accessories", categories: ["Travel Accessories", "Toiletry Bags"], image: imgTravelAcc },
  { lv: "Iepirkumu maisiņi", en: "Tote bags", categories: ["Tote Bags", "Shopping & Tote Bags", "Drawstring Bags"], image: imgTote },
];

const PROMO_TILES: TileItem[] = [
  { lv: "Pudeles", en: "Bottles", categories: ["Bottles", "Water Bottles", "Sports Bottles", "Insulated Bottles"], image: imgBottle },
  { lv: "Krūzes", en: "Mugs", categories: ["Mugs", "Insulated Mugs", "Travel Mugs", "Standard Mugs"], image: imgMug },
  { lv: "Bloknoti", en: "Notebooks", categories: ["Hard Cover Notebooks", "Soft Cover Notebooks", "Notepads", "Sticky Notes"], image: imgNotebook },
  { lv: "Austiņas un skaļruņi", en: "Audio", categories: ["Speakers", "Earbuds"], image: imgHeadphones },
  { lv: "Lietussargi", en: "Umbrellas", categories: ["Standard Umbrellas", "Folding Umbrellas", "Golf Umbrellas", "Storm Umbrellas"], image: imgUmbrella },
  { lv: "Atslēgu piekariņi", en: "Keychains", categories: ["Keychains & Keyrings"], image: imgKeychain },
];

// Papildu kategorijas — teksta saraksts
const PROMO_LINKS: Item[] = [
  { lv: "Pildspalvas", en: "Pens", categories: ["Ballpoint Pens", "Rollerball Pens", "Fountain Pens", "Other Pens & Writing Accessories", "Pencils"] },
  { lv: "Ārējie akumulatori", en: "Power banks", categories: ["Power Banks", "Wireless Charging", "Chargers"] },
  { lv: "USB atmiņas", en: "USB drives", categories: ["USB Flash Drives", "USB Hubs"] },
  { lv: "Pārtikas trauki", en: "Lunch boxes", categories: ["Lunch Boxes"] },
  { lv: "Sports un fitness", en: "Sports & fitness", categories: ["Fitness & Sport"] },
  { lv: "Instrumenti", en: "Tools", categories: ["Multitools", "Tool Sets"] },
  { lv: "Biroja piederumi", en: "Office", categories: ["Office", "Stands & Holders"] },
  { lv: "Dāvanu komplekti", en: "Gift sets", categories: ["Gift Sets", "Sets"] },
  { lv: "Datoru aksesuāri", en: "Computer accessories", categories: ["Computer Accessories", "Cables"] },
  { lv: "Auto aksesuāri", en: "Car accessories", categories: ["Car Accessories"] },
  { lv: "Sedzas un pledi", en: "Blankets", categories: ["Blankets"] },
  { lv: "Saulesbrilles", en: "Sunglasses", categories: ["Sunglasses"] },
  { lv: "Maki", en: "Wallets", categories: ["Wallets & Card Wallets"] },
  { lv: "Personīgā aprūpe", en: "Personal care", categories: ["Personal Care", "Lip Balms"] },
  { lv: "Vīna aksesuāri", en: "Wine accessories", categories: ["Wine Accessories", "Bottle Openers & Accessories"] },
  { lv: "Servēšanas dēlīši", en: "Serving boards", categories: ["Serving Boards & Sets", "Serving tool"] },
  { lv: "Glāzes un karafes", en: "Glasses & carafes", categories: ["Glasses & Carafes", "Bar glass"] },
  { lv: "Lampas", en: "Lamps", categories: ["Lamps"] },
  { lv: "Krāsošanas komplekti", en: "Colouring sets", categories: ["Colouring Sets"] },
  { lv: "Iekštelpu spēles", en: "Indoor games", categories: ["Indoor Games"] },
  { lv: "Katalogi", en: "Catalogues", categories: ["Catalogues"] },
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-px w-6 bg-accent" />
      <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/60">
        {children}
      </h3>
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
      className="group block"
    >
      <div className="relative overflow-hidden rounded-sm bg-primary-foreground/5">
        <div className="aspect-square">
          <img
            src={item.image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <span className="truncate font-heading text-[10.5px] font-semibold uppercase tracking-[0.1em] text-primary-foreground/85 transition-colors group-hover:text-accent">
          {title}
        </span>
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
        {/* Apģērbi */}
        <SectionTitle>{t("Apģērbi", "Apparel")}</SectionTitle>
        <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-15">
          {APPAREL_TILES.map((item) => (
            <CategoryTile key={item.en} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Somas un ceļojumi */}
        <div className="mt-7 border-t border-primary-foreground/10 pt-5">
          <SectionTitle>{t("Somas un ceļojumi", "Bags & travel")}</SectionTitle>
          <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {BAG_TILES.map((item) => (
              <CategoryTile key={item.en} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        {/* Prezentmateriāli */}
        <div className="mt-7 border-t border-primary-foreground/10 pt-5">
          <SectionTitle>{t("Prezentmateriāli", "Promo products")}</SectionTitle>
          <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {PROMO_TILES.map((item) => (
              <CategoryTile key={item.en} item={item} onNavigate={onNavigate} />
            ))}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {PROMO_LINKS.map((item) => (
              <li key={item.en}>
                <Link
                  to={buildCategoryHref(item.categories)}
                  onClick={onNavigate}
                  role="menuitem"
                  className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  <span>{lang === "lv" ? item.lv : item.en}</span>
                  <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
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
