import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import imgTshirt from "@/assets/menu/tshirt.jpg";
import imgHoodie from "@/assets/menu/hoodie.jpg";
import imgPolo from "@/assets/menu/polo.jpg";
import imgJacket from "@/assets/menu/jacket.jpg";
import imgCap from "@/assets/menu/cap.jpg";
import imgWorkwear from "@/assets/menu/workwear.jpg";
import imgSport from "@/assets/menu/sweater.jpg";
import imgShirt from "@/assets/menu/shirt.jpg";

interface MegaMenuProps {
  onNavigate?: () => void;
}

type Tile = {
  label_lv: string;
  label_en: string;
  categories: string[];
  image: string;
};

type TextLink = {
  label_lv: string;
  label_en: string;
  categories: string[];
};

const COL1: Tile[] = [
  { label_lv: "T-krekli", label_en: "T-shirts", categories: ["t-krekli"], image: imgTshirt },
  { label_lv: "Hūdiji un džemperi", label_en: "Hoodies & sweaters", categories: ["dzemperi", "adijumi"], image: imgHoodie },
  { label_lv: "Polo krekli", label_en: "Polos", categories: ["polo-krekli"], image: imgPolo },
  { label_lv: "Virsjakas un vestes", label_en: "Jackets & vests", categories: ["virsjakas", "vestes", "flisa-jakas"], image: imgJacket },
];

const COL2: Tile[] = [
  { label_lv: "Cepures", label_en: "Caps & hats", categories: ["cepures"], image: imgCap },
  { label_lv: "Darba apģērbs", label_en: "Workwear", categories: ["darba-apgerbi", "darba-apavi"], image: imgWorkwear },
  { label_lv: "Sporta apģērbs", label_en: "Sportswear", categories: ["sportam"], image: imgSport },
  { label_lv: "Krekli, bikses un šorti", label_en: "Shirts, trousers & shorts", categories: ["pletkrekli", "bikses", "termovela"], image: imgShirt },
];

const COL3: TextLink[] = [
  { label_lv: "Auduma iepirkumu maisiņi", label_en: "Tote bags", categories: ["audumu-maisini"] },
  { label_lv: "Mugursomas un datoru somas", label_en: "Backpacks & laptop bags", categories: ["somas"] },
  { label_lv: "Priekšauti", label_en: "Aprons", categories: ["priekšauti", "priekšauti"] },
  { label_lv: "Dvieļi un pledi", label_en: "Towels & blankets", categories: ["dvieli", "pledi"] },
  { label_lv: "Cimdi, šalles un citi aksesuāri", label_en: "Gloves, scarves & accessories", categories: ["cimdi", "sales", "aksesuari"] },
];

const COL4: TextLink[] = [
  { label_lv: "Krūzes un pudeles", label_en: "Mugs & bottles", categories: ["kruzes", "pudeles"] },
  { label_lv: "Lietussargi", label_en: "Umbrellas", categories: ["lietussargi"] },
  { label_lv: "Bloknoti un pildspalvas", label_en: "Notebooks & pens", categories: ["bloknoti", "pildspalvas"] },
  { label_lv: "Auto un biroja piederumi", label_en: "Car & office", categories: ["auto", "birojs"] },
  { label_lv: "Dāvanu komplekti", label_en: "Gift sets", categories: ["davanu-komplekti"] },
  { label_lv: "Atslēgu piekariņi un sīkumi", label_en: "Keychains & small gifts", categories: ["atslegu-piekarini", "sikumi"] },
];

const buildHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-px w-6 bg-accent" />
      <h3 className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary-foreground/60">
        {children}
      </h3>
    </div>
  );
}

function TileCard({ tile, onNavigate }: { tile: Tile; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const title = lang === "lv" ? tile.label_lv : tile.label_en;
  return (
    <Link
      to={buildHref(tile.categories)}
      onClick={onNavigate}
      role="menuitem"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-sm bg-primary-foreground/5">
        <div className="aspect-[4/3]">
          <img
            src={tile.image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="truncate font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground/85 transition-colors group-hover:text-accent">
          {title}
        </span>
      </div>
    </Link>
  );
}

function TextItem({ item, onNavigate }: { item: TextLink; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  return (
    <li>
      <Link
        to={buildHref(item.categories)}
        onClick={onNavigate}
        role="menuitem"
        className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary-foreground/75 transition-colors hover:text-accent"
      >
        <span>{lang === "lv" ? item.label_lv : item.label_en}</span>
        <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </Link>
    </li>
  );
}

export default function CatalogMegaMenu({ onNavigate }: MegaMenuProps) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  return (
    <div
      role="menu"
      aria-label={t("Kataloga izvēlne", "Catalog menu")}
      className="max-h-[70vh] overflow-y-auto bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Apparel top priority */}
          <div>
            <SectionTitle>{t("Apģērbi", "Apparel")}</SectionTitle>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {COL1.map((tile) => (
                <TileCard key={tile.label_en} tile={tile} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* Column 2 — Apparel & headwear medium */}
          <div>
            <SectionTitle>{t("Apģērbi un cepures", "Apparel & headwear")}</SectionTitle>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {COL2.map((tile) => (
                <TileCard key={tile.label_en} tile={tile} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* Column 3 — Bags & textiles */}
          <div>
            <SectionTitle>{t("Somas un tekstils", "Bags & textiles")}</SectionTitle>
            <ul className="space-y-2.5">
              {COL3.map((item) => (
                <TextItem key={item.label_en} item={item} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>

          {/* Column 4 — Promo & gifts */}
          <div>
            <SectionTitle>{t("Prezentmateriāli un dāvanas", "Promo & gifts")}</SectionTitle>
            <ul className="space-y-2.5">
              {COL4.map((item) => (
                <TextItem key={item.label_en} item={item} onNavigate={onNavigate} />
              ))}
            </ul>
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
