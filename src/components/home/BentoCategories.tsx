import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

import tshirtsImg from "@/assets/bento/tshirts-action.jpg";
import poloImg from "@/assets/bento/polo-action.jpg";
import jacketsImg from "@/assets/bento/jackets-action.jpg";
import workwearImg from "@/assets/bento/workwear-action.jpg";
import sportswearImg from "@/assets/bento/sportswear-action.jpg";
import hoodiesImg from "@/assets/bento/hoodies-action.jpg";
import capsImg from "@/assets/bento/caps-action.jpg";
import bagsImg from "@/assets/bento/bags-action.jpg";
import newArrivalsImg from "@/assets/bento/new-arrivals.jpg";
import bestsellersImg from "@/assets/bento/bestsellers.jpg";

interface BentoItem {
  id: string;
  name: Record<"lv" | "en", string>;
  image: string;
  gridArea: string;
  link: string;
  icon?: React.ReactNode;
}

const bentoItems: BentoItem[] = [
  {
    id: "t-krekli",
    name: { lv: "T-KREKLI", en: "T-SHIRTS" },
    image: tshirtsImg,
    gridArea: "tshirts",
    link: "/catalog?category=t-krekli",
  },
  {
    id: "polo-krekli",
    name: { lv: "POLO KREKLI", en: "POLO SHIRTS" },
    image: poloImg,
    gridArea: "polo",
    link: "/catalog?category=polo-krekli",
  },
  {
    id: "virsjakas",
    name: { lv: "VIRSJAKAS", en: "JACKETS" },
    image: jacketsImg,
    gridArea: "jackets",
    link: "/catalog?category=virsjakas",
  },
  {
    id: "darba-apgerbi",
    name: { lv: "DARBA APĢĒRBS", en: "WORKWEAR" },
    image: workwearImg,
    gridArea: "workwear",
    link: "/catalog?category=darba-apgerbi",
  },
  {
    id: "sportam",
    name: { lv: "SPORTA APĢĒRBS", en: "SPORTSWEAR" },
    image: sportswearImg,
    gridArea: "sport",
    link: "/catalog?category=sportam",
  },
  {
    id: "dzemperi",
    name: { lv: "DŽEMPERI & HŪDIJI", en: "HOODIES & SWEATSHIRTS" },
    image: hoodiesImg,
    gridArea: "hoodies",
    link: "/catalog?category=dzemperi",
  },
  {
    id: "cepures",
    name: { lv: "CEPURES", en: "CAPS & HEADWEAR" },
    image: capsImg,
    gridArea: "caps",
    link: "/catalog?category=cepures",
  },
  {
    id: "somas",
    name: { lv: "SOMAS", en: "BAGS & TOTES" },
    image: bagsImg,
    gridArea: "bags",
    link: "/catalog?category=somas",
  },
  {
    id: "jaunumi",
    name: { lv: "JAUNUMI", en: "NEW ARRIVALS" },
    image: newArrivalsImg,
    gridArea: "new",
    link: "/catalog?sort=newest",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "popularakie",
    name: { lv: "POPULĀRĀKIE", en: "BEST SELLERS" },
    image: bestsellersImg,
    gridArea: "best",
    link: "/catalog?sort=popular",
    icon: <TrendingUp className="h-4 w-4" />,
  },
];

const scrollingTextLv = "TEKSTILA APDRUKA  ·  IZŠŪŠANA  ·  B2B SERVISS  ·  SUBLIMĀCIJA  ·  VAIRUMTIRDZNIECĪBA  ·  ";
const scrollingTextEn = "TEXTILE PRINTING  ·  EMBROIDERY  ·  B2B SERVICE  ·  SUBLIMATION  ·  WHOLESALE  ·  ";

const BentoCategories = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              {lang === "lv" ? "Kategorijas" : "Categories"}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {lang === "lv" ? "Produktu katalogs" : "Product Catalog"}
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {lang === "lv"
              ? "Izpētiet mūsu plašo tekstila sortimentu — no ikdienas apģērba līdz profesionālam darba ekipējumam."
              : "Explore our extensive textile range — from everyday wear to professional workwear."}
          </p>
        </motion.div>

        {/* Bento Grid - Desktop uses grid-template-areas, mobile uses simple 2-col */}
        <div
          className="grid grid-cols-2 gap-2.5 md:gap-3"
          style={{
            gridTemplateRows: "repeat(5, 200px)",
            gridTemplateAreas: `
              "tshirts tshirts"
              "polo jackets"
              "workwear workwear"
              "sport hoodies"
              "caps bags"
            `,
          }}
        >
          {/* Mobile: first 8 items in simple bento */}
          {bentoItems.slice(0, 8).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              style={{ gridArea: item.gridArea }}
              className="block md:hidden"
            >
              <BentoCard item={item} lang={lang} />
            </motion.div>
          ))}
        </div>

        {/* Desktop Bento - larger, asymmetric layout */}
        <div
          className="hidden md:grid gap-3"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "240px 240px 240px 200px",
            gridTemplateAreas: `
              "tshirts tshirts polo jackets"
              "workwear workwear sport sport"
              "hoodies caps bags bags"
              "new new best best"
            `,
          }}
        >
          {bentoItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              style={{ gridArea: item.gridArea }}
            >
              <BentoCard item={item} lang={lang} />
            </motion.div>
          ))}
        </div>

        {/* Mobile: New Arrivals & Best Sellers row */}
        <div className="grid grid-cols-2 gap-2.5 mt-2.5 md:hidden">
          {bentoItems.slice(8).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="h-[160px]"
            >
              <BentoCard item={item} lang={lang} />
            </motion.div>
          ))}
        </div>

        {/* Scrolling Banner */}
        <div className="mt-10 overflow-hidden border-y border-border/40 py-4">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="font-heading text-lg font-black uppercase tracking-[0.15em] text-muted-foreground/30 md:text-2xl"
              >
                {scrollingText}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex justify-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-sm font-bold uppercase tracking-wider px-10 py-6 rounded-sm"
          >
            <Link to="/catalog">
              {lang === "lv" ? "PARĀDĪT VISU KATALOGU" : "VIEW FULL CATALOG"}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const BentoCard = ({ item, lang }: { item: BentoItem; lang: "lv" | "en" }) => (
  <Link
    to={item.link}
    className="group relative block h-full w-full overflow-hidden rounded-lg bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_hsl(var(--accent)/0.4)]"
  >
    <img
      src={item.image}
      alt={item.name[lang]}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent transition-all duration-500 group-hover:from-foreground/90" />

    {/* Accent line bottom */}
    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent transition-all duration-500 group-hover:w-full rounded-b-lg" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
      <div className="flex items-center gap-2">
        {item.icon && (
          <span className="text-accent">{item.icon}</span>
        )}
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-background md:text-sm lg:text-base">
          {item.name[lang]}
        </h3>
      </div>
    </div>

    {/* Arrow */}
    <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-background/10 text-background/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground">
      <ArrowUpRight className="h-3.5 w-3.5" />
    </div>
  </Link>
);

export default BentoCategories;
