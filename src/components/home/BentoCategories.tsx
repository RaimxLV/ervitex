import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface BentoCategory {
  id: string;
  name: Record<"lv" | "en", string>;
  image: string;
  span: string; // tailwind col/row span classes
}

const bentoCategories: BentoCategory[] = [
  {
    id: "tshirts",
    name: { lv: "T-krekli", en: "T-Shirts" },
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
  },
  {
    id: "polo",
    name: { lv: "Polo krekli", en: "Polo Shirts" },
    image: "https://images.unsplash.com/photo-1625910513413-5fc42e2e9ac0?w=600&q=80",
    span: "col-span-1 row-span-1",
  },
  {
    id: "jackets",
    name: { lv: "Virsjakas", en: "Jackets" },
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    span: "col-span-1 row-span-1",
  },
  {
    id: "workwear",
    name: { lv: "Darba apģērbs", en: "Workwear" },
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    span: "col-span-2 row-span-1 md:col-span-1 md:row-span-1",
  },
  {
    id: "accessories",
    name: { lv: "Aksesuāri", en: "Accessories" },
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    span: "col-span-2 row-span-1 md:col-span-1 md:row-span-1",
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
          viewport={{ once: true }}
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {bentoCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cat.span}
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
                  <h3 className="font-heading text-base font-bold uppercase tracking-wider text-background md:text-lg">
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
