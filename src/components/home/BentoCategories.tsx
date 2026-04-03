import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface BentoCategory {
  id: string;
  name: Record<"lv" | "en", string>;
  image: string;
  className: string;
}

const bentoCategories: BentoCategory[] = [
  {
    id: "tshirts",
    name: { lv: "T-krekli", en: "T-Shirts" },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: "polo",
    name: { lv: "Polo krekli", en: "Polo Shirts" },
    image: "https://images.unsplash.com/photo-1507679799987-c73b4177fea2?w=600&q=80",
    className: "",
  },
  {
    id: "jackets",
    name: { lv: "Virsjakas", en: "Jackets" },
    image: "https://images.unsplash.com/photo-1605908502334-1e0d20441e4c?w=600&q=80",
    className: "",
  },
  {
    id: "workwear",
    name: { lv: "Darba apģērbs", en: "Workwear" },
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    className: "md:col-span-2",
  },
  {
    id: "sweaters",
    name: { lv: "Džemperi & Hūdiji", en: "Sweatshirts & Hoodies" },
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    className: "",
  },
  {
    id: "sportswear",
    name: { lv: "Sporta apģērbs", en: "Sportswear" },
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    className: "",
  },
  {
    id: "caps",
    name: { lv: "Cepures", en: "Caps & Headwear" },
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80",
    className: "",
  },
  {
    id: "bags",
    name: { lv: "Somas", en: "Bags & Totes" },
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c5?w=600&q=80",
    className: "",
  },
];

const BentoCategories = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
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

        {/* Bento grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {bentoCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={cat.className}
            >
              <Link
                to={`/catalog?category=${cat.id}`}
                className="group relative block h-full w-full overflow-hidden rounded-sm"
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name[lang]}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10 transition-all duration-500 group-hover:from-foreground/90" />

                {/* Accent line bottom */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-background md:text-base lg:text-lg">
                    {cat.name[lang]}
                  </h3>
                </div>

                {/* Arrow icon */}
                <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-background/10 text-background/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground">
                  <ArrowUpRight className="h-4 w-4" />
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
