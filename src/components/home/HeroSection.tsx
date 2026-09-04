import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";
import TrailMask from "./TrailMask";

import collageImg from "@/assets/hero/collage-hero.jpg";

/**
 * Hero — strict 4-layer stack:
 *  1. solid deep-charcoal background
 *  2. static subject image (collage)
 *  3. interactive trailing blob mask that reveals layer 2
 *  4. text + buttons (blend-difference, fully clickable)
 */

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setInteractive(fine && !reduced);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax for the subject image
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-[hsl(0_0%_7%)]"
    >
      {/* ── LAYER 2: static subject image ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-[1] will-change-transform"
      >
        <img
          src={collageImg}
          alt=""
          aria-hidden="true"
          width={1024}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ opacity: interactive ? 0.1 : 1 }}
        />
      </motion.div>

      {/* ── LAYER 3: interactive trailing mask reveal ── */}
      <TrailMask src={collageImg} className="z-[2]" />

      {/* ── LAYER 4: content ── */}
      <div className="container relative z-10 py-20 sm:py-24 pointer-events-none">

        <div className="max-w-[min(37rem,86vw)] md:max-w-3xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="h-px w-10 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase text-accent tracking-wide">
              {lang === "lv" ? "Kopš 2003. gada" : "Since 2003"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-[2.55rem] font-bold leading-[0.98] text-primary-foreground mix-blend-difference sm:text-5xl md:text-7xl lg:text-[5.5rem]"
          >
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
          <p className="mt-6 max-w-[22rem] text-sm leading-relaxed text-primary-foreground/55 mix-blend-difference md:max-w-md md:text-base">
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
            className="mt-8 flex flex-col gap-3 pointer-events-auto sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase rounded-none px-8 py-4 h-14 w-full justify-center shadow-[0_0_30px_hsl(var(--accent)/0.3)] sm:w-auto sm:min-w-[220px] sm:px-14"
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
              className="border border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-accent hover:text-accent font-heading text-xs uppercase rounded-none px-8 py-4 h-14 w-full justify-center sm:w-auto sm:min-w-[220px] sm:px-14"
              asChild
            >
              <Link to="/services">
                {lang === "lv" ? "Mūsu pakalpojumi" : "Our Services"}
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mt-10 grid max-w-[23rem] grid-cols-3 gap-4 border-t border-primary-foreground/10 pt-6 mix-blend-difference sm:mt-14 sm:flex sm:max-w-none sm:gap-10 sm:pt-7">
            {[
              { value: "20+", label: lang === "lv" ? "Gadi pieredzē" : "Years Experience" },
              { value: "3000+", label: lang === "lv" ? "Produkti" : "Products" },
              { value: "4", label: lang === "lv" ? "Drukas tehnoloģijas" : "Print Technologies" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-heading text-2xl font-bold text-accent md:text-3xl">
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
