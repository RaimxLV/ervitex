import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCallback, useRef } from "react";

import bgLayer from "@/assets/hero/layer-bg.jpg";
import rockLayer from "@/assets/hero/layer-rock-hero.webp";
import rockLayerSm from "@/assets/hero/layer-rock-hero-sm.webp";
import jacketImg from "@/assets/hero/jacket-hero.webp";
import jacketImgSm from "@/assets/hero/jacket-hero-sm.webp";
import hoodieImg from "@/assets/hero/hoodie-hero.webp";
import hoodieImgSm from "@/assets/hero/hoodie-hero-sm.webp";
import pantsImg from "@/assets/hero/pants-hero.webp";
import pantsImgSm from "@/assets/hero/pants-hero-sm.webp";
import sneakerImg from "@/assets/hero/sneaker-hero.webp";
import sneakerImgSm from "@/assets/hero/sneaker-hero-sm.webp";
import teesImg from "@/assets/hero/tee-oversized-hero.webp";
import teesImgSm from "@/assets/hero/tee-oversized-hero-sm.webp";

/**
 * Multi-layer parallax hero.
 * Depth is built from 5 stacked layers (backdrop -> haze -> rock -> garments -> dust).
 * Garments drift away from the cursor, each with its own direction and strength.
 */

type Item = {
  src: string;
  mobileSrc: string;
  alt: string;
  /** tailwind position + size classes */
  className: string;
  /** repel strength & direction multiplier (x, y) */
  push: [number, number];
  /** idle float duration */
  float: number;
  rotate?: number;
  delay?: number;
};

const items: Item[] = [
  {
    src: jacketImg,
    mobileSrc: jacketImgSm,
    alt: "",
    className: "right-[-28%] top-[5%] w-[86vw] max-w-[620px] sm:right-[-10%] sm:w-[62vw] md:right-[6%] md:top-[8%] md:w-[34vw]",
    push: [-46, -26],
    float: 9,
    rotate: -3,
    delay: 0.15,
  },
  {
    src: pantsImg,
    mobileSrc: pantsImgSm,
    alt: "",
    className: "right-[-30%] bottom-[1%] w-[86vw] max-w-[645px] sm:right-[-12%] sm:w-[64vw] md:right-[2%] md:bottom-[2%] md:w-[36vw]",
    push: [34, 22],
    float: 11,
    rotate: 4,
    delay: 0.3,
  },
  {
    src: hoodieImg,
    mobileSrc: hoodieImgSm,
    alt: "",
    className: "right-[10%] top-[28%] w-[70vw] max-w-[540px] brightness-125 sm:right-[18%] sm:w-[54vw] md:right-[27%] md:top-[30%] md:w-[30vw]",
    push: [-28, 34],
    float: 8,
    rotate: -6,
    delay: 0.45,
  },
  {
    src: teesImg,
    mobileSrc: teesImgSm,
    alt: "",
    className: "right-[-12%] bottom-[20%] w-[70vw] max-w-[600px] sm:right-[2%] sm:w-[52vw] md:right-[24%] md:bottom-[4%] md:w-[32vw]",
    push: [26, -18],
    float: 10,
    rotate: 3,
    delay: 0.6,
  },
  {
    src: sneakerImg,
    mobileSrc: sneakerImgSm,
    alt: "",
    className: "right-[43%] bottom-[18%] w-[24vw] max-w-[300px] md:w-[17vw] hidden lg:block",
    push: [-20, -30],
    float: 7,
    rotate: 8,
    delay: 0.75,
  },

];

const springCfg = { stiffness: 60, damping: 18, mass: 0.6 };

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  // Normalized pointer position (-0.5 .. 0.5)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const mx = useSpring(px, springCfg);
  const my = useSpring(py, springCfg);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - r.left) / r.width - 0.5);
      py.set((e.clientY - r.top) / r.height - 0.5);
    },
    [px, py],
  );

  const handleLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scroll parallax per depth
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const rockY = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const itemsY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const darkOverlayOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Layer drifts driven by pointer (background moves with, objects move away)
  const bgX = useTransform(mx, (v) => v * 70);
  const bgYm = useTransform(my, (v) => v * 48);
  const hazeX = useTransform(mx, (v) => v * -60);
  const hazeY = useTransform(my, (v) => v * -40);
  const rockX = useTransform(mx, (v) => v * -34);
  const rockYm = useTransform(my, (v) => v * -20);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-primary"
    >
      {/* ── Layer 1: industrial backdrop ── */}
      <motion.div style={{ y: bgY, x: bgX, translateY: bgYm }} className="absolute -inset-16 will-change-transform">
        <motion.img
          src={bgLayer}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-100 brightness-[1.55] contrast-[0.95] saturate-[0.9]"
          animate={{ scale: [1.04, 1.1, 1.04], x: [0, -22, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-primary/15" />
      </motion.div>

      {/* ── Layer 2: atmosphere / light leaks ── */}
      <motion.div
        style={{ x: hazeX, y: hazeY }}
        className="absolute -inset-10 pointer-events-none will-change-transform"
      >
        <div
          className="absolute top-[6%] right-[12%] h-[62%] w-[55%] rounded-full opacity-[0.22] blur-[130px]"
          style={{ background: "radial-gradient(circle, hsl(84 90% 55% / 0.75), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[4%] right-[6%] h-[45%] w-[40%] rounded-full opacity-25 blur-[110px]"
          style={{ background: "radial-gradient(circle, hsl(84 80% 45% / 0.5), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[-8%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(0 0% 100% / 0.4), transparent 70%)" }}
        />
      </motion.div>

      {/* ── Layer 3: floating rock platform ── */}
      <motion.div
        style={{ y: rockY, x: rockX, translateY: rockYm }}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <picture>
          <source srcSet={rockLayerSm} media="(max-width: 767px)" />
          <motion.img
            src={rockLayer}
            alt=""
            aria-hidden="true"
            width={1200}
            height={800}
            decoding="async"
            loading="eager"
            fetchPriority="high"
            initial={false}
            animate={{ opacity: 0.95, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-[-38%] bottom-[-5%] w-[120vw] max-w-[1100px] select-none sm:right-[-14%] sm:w-[86vw] md:right-[-6%] md:bottom-[-6%] md:w-[72vw]"
          />
        </picture>
      </motion.div>

      {/* ── Layer 4: garments that flee the cursor ── */}
      <motion.div style={{ y: itemsY }} className="absolute inset-0 pointer-events-none will-change-transform">
        {items.map((item, i) => (
          <ParallaxItem key={i} item={item} mx={mx} my={my} />
        ))}
      </motion.div>

      {/* ── Layer 5: drifting dust sparks ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-accent"
            style={{
              left: `${45 + ((i * 37) % 55)}%`,
              top: `${8 + ((i * 53) % 84)}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              filter: "blur(0.5px)",
            }}
            animate={{ y: [0, -28, 0], opacity: [0, 0.7, 0] }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Readability gradient (left) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--primary) / 0.92) 0%, hsl(var(--primary) / 0.75) 26%, hsl(var(--primary) / 0.3) 52%, transparent 72%)",
        }}
      />

      {/* ── Scroll-driven fade-to-black ── */}
      <motion.div
        style={{ opacity: darkOverlayOpacity }}
        className="absolute inset-0 bg-primary pointer-events-none"
      />

      {/* ── Content ── */}
       <div className="container relative z-10 py-20 sm:py-24">
        <div className="max-w-[min(42rem,86vw)] md:max-w-3xl">
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
            className="font-heading text-[2.75rem] font-bold leading-[0.95] text-primary-foreground sm:text-5xl md:text-7xl lg:text-[5.5rem]"
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
          <p className="mt-6 max-w-[22rem] text-sm leading-relaxed text-primary-foreground/55 md:max-w-md md:text-base">
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
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
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
          <div className="mt-10 grid max-w-[23rem] grid-cols-3 gap-4 border-t border-primary-foreground/10 pt-6 sm:mt-14 sm:flex sm:max-w-none sm:gap-10 sm:pt-7">
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

type MV = ReturnType<typeof useSpring>;

const ParallaxItem = ({ item, mx, my }: { item: Item; mx: MV; my: MV }) => {
  const x = useTransform(mx, (v) => v * item.push[0]);
  const y = useTransform(my, (v) => v * item.push[1]);

  return (
    <motion.div style={{ x, y }} className={`absolute ${item.className} will-change-transform`}>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: item.delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={item.src}
          alt={item.alt}
          aria-hidden="true"
          width={1024}
          height={1024}
          decoding="async"
          className="h-auto w-full select-none drop-shadow-[0_35px_60px_rgba(0,0,0,0.65)]"
          style={{ rotate: item.rotate ?? 0 }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: item.float, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
