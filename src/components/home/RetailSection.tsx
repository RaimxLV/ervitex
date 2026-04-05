import { motion } from "framer-motion";
import { Store, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import ModernGallery, { type GallerySlide } from "@/components/ModernGallery";
import tbodeStore from "@/assets/tbode-store.jpg";
import tbodeMugs from "@/assets/tbode-mugs.jpg";
import tbodeLatvija from "@/assets/tbode-latvija.jpg";
import tbodeBottles from "@/assets/tbode-bottles.jpg";
import tbodeApparel from "@/assets/tbode-apparel.jpg";
import tbodeSouvenirs from "@/assets/tbode-souvenirs.jpg";

const RetailSection = () => {
  const { lang } = useLanguage();

  const slides: GallerySlide[] = [
    { src: tbodeStore, caption: "T-Bode — T/C Akropole" },
    { src: tbodeApparel, caption: lang === "lv" ? "Latvija kolekcija" : "Latvija Collection" },
    { src: tbodeMugs, caption: lang === "lv" ? "Krūzes un aksesuāri" : "Mugs & Accessories" },
    { src: tbodeLatvija, caption: lang === "lv" ? "Suvenīri un dāvanas" : "Souvenirs & Gifts" },
    { src: tbodeBottles, caption: lang === "lv" ? "Termokrūzes" : "Travel Mugs" },
    { src: tbodeSouvenirs, caption: lang === "lv" ? "Unikālie suvenīri" : "Unique Souvenirs" },
  ];

  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase text-accent">
              {lang === "lv" ? "Mazumtirdzniecība" : "Retail"}
            </span>
            <div className="h-px w-10 bg-accent" />
          </div>

          <h2 className="font-heading text-2xl font-bold uppercase text-foreground md:text-3xl">
            T-Shirt Store By T-Bode
          </h2>

          <div className="mt-6 flex justify-center">
            <Store className="h-8 w-8 text-accent/60" strokeWidth={1.2} />
          </div>

          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed md:text-lg">
            <p>
              {lang === "lv"
                ? "Ervitex — Jūsu partneris gan industriāla mēroga projektos, gan individuālos pasūtījumos."
                : "Ervitex — your partner for both industrial-scale projects and individual orders."}
            </p>
            <p>
              {lang === "lv"
                ? "Papildus vairumtirdzniecības servisam, mūsu mazumtirdzniecības tīklā «T-Shirt Store By T-Bode» piedāvājam tūlītēju apdruku un plašu gatavās produkcijas klāstu lielākajos Rīgas tirdzniecības centros."
                : "Beyond wholesale, our retail chain «T-Shirt Store By T-Bode» offers same-day custom printing and a wide selection of ready-made products across major Riga shopping centres."}
            </p>
            <ul className="mx-auto max-w-md space-y-1.5 text-left text-sm md:text-base">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {lang === "lv"
                  ? "Vīriešu, sieviešu un bērnu t-krekli, džemperi un aksesuāri"
                  : "Men's, women's, and children's t-shirts, sweaters, and accessories"}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {lang === "lv"
                  ? "Apdruka vienā vai vairākos eksemplāros — tās pašas dienas laikā"
                  : "Single or multi-copy printing — same-day turnaround"}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {lang === "lv"
                  ? "Suvenīrlīnija ar Latvijas simboliku"
                  : "Souvenir line featuring Latvian symbols"}
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase"
              >
                <Store className="mr-2 h-4 w-4" strokeWidth={1.2} />
                {lang === "lv" ? "Mūsu veikalu adreses" : "Find our stores"}
              </Button>
            </Link>
            <a href="https://www.t-bode.lv" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="font-heading text-xs uppercase border-accent/30 text-accent hover:bg-accent/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" strokeWidth={1.2} />
                www.t-bode.lv
              </Button>
            </a>
          </div>
          <div className="mt-10">
            <ModernGallery slides={slides} aspectRatio="16/9" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RetailSection;
