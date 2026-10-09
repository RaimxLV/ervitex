import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRef } from "react";
import HeroDepthScene from "./HeroDepthScene";

/**
 * Hero — depth-map parallax stack:
 *  1. solid deep-charcoal background
 *  2. WebGL depth-map scene (scroll + pointer parallax)
 *  3. darkening overlay for text legibility
 *  4. text + buttons
 */

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100svh-4rem)] flex items-center overflow-hidden bg-black md:min-h-[calc(100svh-5rem)]"
    >
      {/* ── LAYER 2: depth-map parallax scene ── */}
      <HeroDepthScene className="z-[1]" />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-[2] w-full md:w-[55%] bg-gradient-to-r from-black/90 via-black/60 to-transparent"
      />





      {/* ── LAYER 4: content ── */}
      <div className="container relative z-10 py-12 pointer-events-none sm:py-24">

        <div className="max-w-[min(37rem,86vw)] md:max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-4 flex items-center gap-3 sm:mb-6"
          >
            <div className="h-px w-8 bg-accent" />
            <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
              {lang === "lv" ? "Kopš 2003. gada" : "Since 2003"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-[2.15rem] font-bold leading-[1] text-primary-foreground min-[370px]:text-[2.3rem] sm:text-5xl md:text-7xl lg:text-[5.5rem]"
          >
            <span className="block text-[0.78em] tracking-[-0.01em] text-accent">
              {lang === "lv" ? "Vairumtirdzniecības" : "Wholesale"}
            </span>
            {lang === "lv" ? "Tekstila" : "Textile"}
            <br />
            {lang === "lv" ? "risinājumi" : "Solutions"}
            <br />
            <span className="text-accent">
              {lang === "lv" ? "& industriālā" : "& Industrial"}
            </span>
            <br />
            <span className="text-accent">
              {lang === "lv" ? "apdruka" : "Printing"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-[22rem] text-[0.8rem] leading-[1.65] text-primary-foreground/55 sm:mt-6 sm:text-sm md:max-w-md md:text-base">
            {lang === "lv" ? (
              <>
                <span className="block font-heading font-bold uppercase tracking-wide text-primary-foreground">
                  ERVITEX — JŪSU UZTICAMAIS PARTNERIS PROMO APĢĒRBU UN APDRUKAS PAKALPOJUMOS<br />KOPŠ 2003. GADA
                </span>
                <span className="mt-2 block">
                  Profesionalitāte, pieredze, precizitāte<br />un pārbaudītas tehnoloģijas.
                </span>
              </>
            ) : (
              <>
                <span className="block font-heading font-bold uppercase tracking-wide text-primary-foreground">
                  ERVITEX — YOUR TRUSTED PARTNER IN PROMOTIONAL APPAREL AND PRINTING SERVICES<br />SINCE 2003
                </span>
                <span className="mt-2 block">
                  Professionalism, experience, precision<br />and proven technologies.
                </span>
              </>
            )}
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6 flex flex-col gap-2.5 pointer-events-auto sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 w-full justify-center rounded-none border border-accent bg-transparent px-6 py-3 font-heading text-xs uppercase text-accent hover:bg-accent/15 sm:h-14 sm:w-auto sm:min-w-[220px] sm:px-14 sm:py-4"
              asChild
            >
              <Link to="/catalog">
                {lang === "lv" ? "Skatīt katalogu" : "View Catalog"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full justify-center rounded-none border border-primary-foreground/35 bg-transparent px-6 py-3 font-heading text-xs uppercase text-primary-foreground hover:border-accent hover:bg-primary-foreground/10 sm:h-14 sm:w-auto sm:min-w-[220px] sm:px-14 sm:py-4"
              asChild
            >
              <Link to="/services">
                {lang === "lv" ? "Apdrukas risinājumi" : "Decoration Solutions"}
              </Link>
            </Button>

          </motion.div>

          {/* Stats */}
          <div className="mt-7 grid max-w-[23rem] grid-cols-3 gap-3 border-t border-primary-foreground/10 pt-4 sm:mt-14 sm:flex sm:max-w-none sm:gap-10 sm:pt-7">
            {[
              { value: "28+", label: lang === "lv" ? "Gadi pieredzē" : "Years Experience" },
              { value: "6000+", label: lang === "lv" ? "Produkti" : "Products" },
              { value: "5", label: lang === "lv" ? "Drukas tehnoloģijas" : "Print Technologies" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-heading text-xl font-bold text-accent sm:text-2xl md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] font-medium uppercase text-primary-foreground/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <Mouse className="h-5 w-5 text-primary-foreground/30" strokeWidth={1.2} />
        <motion.div
          className="w-px h-6 bg-primary-foreground/20 origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-accent" />
    </section>
  );
};

export default HeroSection;

