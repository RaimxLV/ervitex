import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRef } from "react";
import heroModel1 from "@/assets/hero-model-1.jpg";
import heroModel2 from "@/assets/hero-model-2.jpg";

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollY } = useScroll();

  // Layer 1: slow parallax (0.2 factor)
  const bgY = useTransform(scrollY, [0, 800], [0, 160]);

  // Layer 3: scroll-driven darkness overlay (fully black at 400px)
  const darkOverlayOpacity = useTransform(scrollY, [0, 400], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-primary"
    >
      {/* ── Layer 1: Deep Background — parallax images ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Model 1 — left side, asymmetric */}
        <div className="absolute left-[-5%] top-[5%] w-[55%] h-[90%] md:left-[2%] md:w-[40%]">
          <img
            src={heroModel1}
            alt=""
            width={1080}
            height={1920}
            className="w-full h-full object-cover object-top opacity-60"
          />
        </div>

        {/* Model 2 — right side, offset */}
        <div className="absolute right-[-8%] top-[10%] w-[50%] h-[85%] md:right-[5%] md:w-[35%]">
          <img
            src={heroModel2}
            alt=""
            width={1080}
            height={1920}
            loading="lazy"
            className="w-full h-full object-cover object-top opacity-40 md:opacity-50"
          />
        </div>
      </motion.div>

      {/* ── Layer 2: Radial gradient mask ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 30% 50%, transparent 15%, hsl(var(--primary)) 85%)",
        }}
      />

      {/* ── Layer 3: Scroll-driven darkness overlay ── */}
      <motion.div
        style={{ opacity: darkOverlayOpacity }}
        className="absolute inset-0 bg-primary pointer-events-none"
      />

      {/* ── Light leaks ── */}
      <div
        className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none opacity-20 md:opacity-30"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.4), transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[250px] h-[250px] pointer-events-none opacity-15 md:opacity-20"
        style={{
          background:
            "radial-gradient(circle at 100% 100%, hsl(0 0% 100% / 0.15), transparent 60%)",
        }}
      />

      {/* ── Content ── */}
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl">
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
            className="font-heading text-4xl font-bold leading-[0.95] text-primary-foreground sm:text-5xl md:text-7xl lg:text-[5.5rem]"
            style={{ letterSpacing: "-0.04em" }}
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
          <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/50 md:text-base">
            {lang === "lv"
              ? "Ervitex — Jūsu partneris tekstila apstrādē kopš 2003. gada. Profesionāla pieredze, precizitāte un pārbaudītas tehnoloģijas."
              : "Ervitex — Your textile partner since 2003. Professional expertise, precision, and proven technologies."}
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase rounded-none px-14 py-4 h-14 min-w-[220px] justify-center shadow-[0_0_30px_hsl(var(--accent)/0.3)]"
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
              className="border border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:border-accent hover:text-accent font-heading text-xs uppercase rounded-none px-14 py-4 h-14 min-w-[220px] justify-center"
              asChild
            >
              <Link to="/services">
                {lang === "lv" ? "Mūsu pakalpojumi" : "Our Services"}
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mt-14 flex gap-10 border-t border-primary-foreground/10 pt-7">
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
