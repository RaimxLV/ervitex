import { motion } from "framer-motion";
import { Store, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

const RetailSection = () => {
  const { lang } = useLanguage();

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
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              {lang === "lv" ? "Mazumtirdzniecība" : "Retail"}
            </span>
            <div className="h-px w-10 bg-accent" />
          </div>

          <h2 className="font-heading text-2xl font-black uppercase tracking-[-0.02em] text-foreground md:text-3xl">
            {lang === "lv" ? "T-Shirt Store By T-Bode" : "T-Shirt Store By T-Bode"}
          </h2>

          <div className="mt-6 flex justify-center">
            <Store className="h-10 w-10 text-accent/60" />
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed md:text-lg">
            {lang === "lv"
              ? "SIA Ervitex nodrošina ne tikai vairumtirdzniecības un rūpnieciskās apdrukas pakalpojumus, bet arī t-kreklu apdruku vienā eksemplārā. Mūsu mazumtirdzniecības veikalos \"T-Shirt Store By T-Bode\" varat iegādāties vīriešu, sieviešu un bērnu t-kreklus, džemperus un dažādus aksesuārus, kā arī pasūtīt apdruku vienā vai vairākos eksemplāros tās pašas dienas laikā. Piedāvājumā ir arī suvenīrlīnija ar Latvijas simboliku. Pasūtījumus var veikt arī internetā www.t-bode.lv."
              : "SIA Ervitex provides not only wholesale and industrial printing services, but also single-copy t-shirt printing. In our retail stores \"T-Shirt Store By T-Bode\" you can purchase men's, women's, and children's t-shirts, sweaters, and various accessories, as well as order prints in one or more copies on the same day. We also offer a souvenir line with Latvian symbols. Orders can also be placed online at www.t-bode.lv."}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest"
              >
                <Store className="mr-2 h-4 w-4" />
                {lang === "lv" ? "Mūsu veikalus var atrast šeit" : "Find our stores here"}
              </Button>
            </Link>
            <a href="https://www.t-bode.lv" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="font-heading text-xs uppercase tracking-widest border-accent/30 text-accent hover:bg-accent/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                www.t-bode.lv
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RetailSection;
