import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const brands = [
  "Malfini", "Clique", "James & Nicholson", "Fruit of the Loom",
  "Gildan", "B&C", "Russell", "SOL'S", "Stedman", "Bella+Canvas",
];

const TrustedBrands = () => {
  const { lang } = useLanguage();

  return (
    <section className="border-y border-border bg-background py-14 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              {lang === "lv" ? "Partneri" : "Partners"}
            </span>
            <div className="h-px w-10 bg-accent" />
          </div>
          <h2 className="font-heading text-xl font-black uppercase tracking-[-0.02em] text-foreground md:text-2xl">
            {lang === "lv" ? "Uzticami zīmoli" : "Trusted Brands"}
          </h2>
        </motion.div>

        {/* Scrolling brand logos (text-based, monochrome) */}
        <div className="overflow-hidden">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {[...Array(3)].map((_, setIdx) => (
              <div key={setIdx} className="flex shrink-0">
                {brands.map((brand, i) => (
                  <div
                    key={`${setIdx}-${i}`}
                    className="mx-6 flex items-center md:mx-10"
                  >
                    <span className="font-heading text-lg font-bold uppercase tracking-wider text-muted-foreground/40 transition-colors duration-300 hover:text-foreground md:text-xl">
                      {brand}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBrands;
