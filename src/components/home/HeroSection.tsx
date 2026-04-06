import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useRef } from "react";
import heroModels from "@/assets/hero-models.jpg";

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax — background moves slower (0.2 factor)
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  // Aggressive fade-to-black on scroll
  const darkOverlayOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-primary"
    >
      {/* ── Layer 1: Single background image with parallax ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Desktop: models positioned to the right */}
        <div className="hidden md:block absolute inset-0">
          <img
            src={heroModels}
            alt=""
            width={1920}
            height={1080}
            className="absolute top-0 right-0 h-full w-[75%] object-cover object-[center_15%] opacity-45"
          />
        </div>

        {/* Mobile: models below text area, centered */}
        <div className="md:hidden absolute inset-0">
          <img
            src={heroModels}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover object-[center_15%] opacity-30"
          />
        </div>
      </motion.div>

      {/* ── Layer 2: Atmosphere — light leaks ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right warm accent light leak */}
        <div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.6), transparent 70%)" }}
        />
        {/* Bottom-left subtle white light leak */}
        <div
          className="absolute -bottom-[15%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(0 0% 100% / 0.4), transparent 70%)" }}
        />
        {/* Center-right accent glow */}
        <div
          className="absolute top-[30%] right-[5%] w-[30%] h-[40%] rounded-full opacity-15 blur-[80px]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.3), transparent 60%)" }}
        />
      </div>

      {/* ── Gradient mask for text readability (left side) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--primary)) 5%, hsl(var(--primary) / 0.85) 25%, hsl(var(--primary) / 0.4) 50%, transparent 75%)",
        }}
      />

      {/* ── Scroll-driven aggressive fade-to-black ── */}
      <motion.div
        style={{ opacity: darkOverlayOpacity }}
        className="absolute inset-0 bg-primary pointer-events-none"
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
