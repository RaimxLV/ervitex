import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

import tshirtsImg from "@/assets/bento/tshirts-action.jpg";
import poloImg from "@/assets/bento/polo-action.jpg";
import jacketsImg from "@/assets/bento/jackets-action.jpg";
import workwearImg from "@/assets/bento/workwear-action.jpg";
import sportswearImg from "@/assets/bento/sportswear-action.jpg";
import hoodiesImg from "@/assets/bento/hoodies-action.jpg";
import capsImg from "@/assets/bento/caps-action.jpg";
import bagsImg from "@/assets/bento/bags-action.jpg";
import drinkwareImg from "@/assets/bento/drinkware-action.jpg";
import promoImg from "@/assets/bento/promo-action.jpg";
import newArrivalsImg from "@/assets/bento/new-arrivals.jpg";
import bestsellersImg from "@/assets/bento/bestsellers.jpg";

interface Tile {
  id: string;
  lv: string;
  en: string;
  image: string;
  link: string;
  highlight?: boolean;
}

const cat = (cats: string[]) => `/catalog?category=${encodeURIComponent(cats.join(","))}`;

const TILES: Tile[] = [
  { id: "tshirts", lv: "T-krekli", en: "T-shirts", image: tshirtsImg, link: cat(["T-shirts", "Tops", "Tees"]) },
  { id: "polo", lv: "Polo krekli", en: "Polos", image: poloImg, link: cat(["Polos", "Polo shirts"]) },
  {
    id: "hoodies",
    lv: "Hūdiji un džemperi",
    en: "Hoodies & sweats",
    image: hoodiesImg,
    link: cat(["Hoodies", "Hoodie sweatshirts", "Sweaters", "Sweatshirts", "Crew neck sweatshirts", "Fleece"]),
  },
  { id: "jackets", lv: "Virsjakas", en: "Jackets", image: jacketsImg, link: cat(["Jackets", "Non Padded Jacket", "Jackets-Vests"]) },
  { id: "workwear", lv: "Darba apģērbs", en: "Workwear", image: workwearImg, link: cat(["Workwear", "Coveralls"]) },
  {
    id: "sport",
    lv: "Sporta apģērbs",
    en: "Sportswear",
    image: sportswearImg,
    link: cat(["Sportswear", "Sports", "Fitness & Sport", "Training Set"]),
  },
  { id: "caps", lv: "Cepures", en: "Caps & beanies", image: capsImg, link: cat(["Caps & Hats", "Caps", "Headwear", "Beanies"]) },
  {
    id: "bags",
    lv: "Somas",
    en: "Bags",
    image: bagsImg,
    link: cat(["Tote Bags", "Shopping & Tote Bags", "Backpacks", "Laptop Backpacks", "Sports Bags"]),
  },
  {
    id: "drinkware",
    lv: "Krūzes un pudeles",
    en: "Drinkware",
    image: drinkwareImg,
    link: cat(["Bottles", "Water Bottles", "Insulated Bottles", "Mugs", "Travel Mugs"]),
  },
  {
    id: "promo",
    lv: "Prezentmateriāli",
    en: "Promo & gifts",
    image: promoImg,
    link: cat(["Hard Cover Notebooks", "Soft Cover Notebooks", "Ballpoint Pens", "Standard Umbrellas", "Folding Umbrellas", "Gift Sets"]),
  },
  { id: "new", lv: "Jaunumi", en: "New arrivals", image: newArrivalsImg, link: "/catalog?sort=newest", highlight: true },
  { id: "best", lv: "Populārākie", en: "Best sellers", image: bestsellersImg, link: "/catalog?sort=name-asc" },
];

const BentoCategories = () => {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-10"
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="h-px w-8 bg-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {t("Kategorijas", "Categories")}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            {t("Produktu katalogs", "Product catalog")}
          </h2>
        </motion.div>

        {/* Printful-style grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {/* Promo card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative col-span-2 flex flex-col items-start justify-center overflow-hidden rounded-2xl bg-primary p-7 md:row-span-2 md:p-12"
          >
            <div className="relative z-10">
              <h3 className="mb-4 font-heading text-2xl font-bold leading-tight text-primary-foreground md:mb-6 md:text-[2.75rem]">
                {t("Padariet šos apģērbus", "Make these items")}
                <br />
                {t("par savējiem", "your own")}
              </h3>
              <p className="mb-7 max-w-xs text-sm text-primary-foreground/60 md:mb-10 md:text-lg">
                {t(
                  "Izvēlieties no vairāk nekā 10 000 premium kvalitātes tekstila un prezentmateriālu vienībām.",
                  "Choose from 10,000+ premium textile and promo products.",
                )}
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-heading text-xs font-bold uppercase tracking-wider text-accent-foreground transition-colors hover:bg-accent/90 md:px-8 md:py-4 md:text-sm"
              >
                {t("Izpētīt visu katalogu", "Explore all products")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
            </div>
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" />
          </motion.div>

          {/* Category tiles */}
          {TILES.map((tile, i) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
            >
              <Link
                to={tile.link}
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-muted transition-shadow hover:shadow-xl hover:shadow-foreground/5"
              >
                <img
                  src={tile.image}
                  alt={tile[lang]}
                  width={640}
                  height={640}
                  loading={i < 4 ? "eager" : "lazy"}
                  fetchPriority={i < 4 ? "high" : "low"}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className={`absolute bottom-3 left-3 rounded-lg border px-2.5 py-1.5 shadow-sm md:bottom-4 md:left-4 md:px-3 ${
                    tile.highlight
                      ? "border-accent bg-accent"
                      : "border-border bg-card"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide md:text-[11px] ${
                      tile.highlight ? "text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    {tile[lang]}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoCategories;
