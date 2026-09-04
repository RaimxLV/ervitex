import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCallback, useEffect, useRef, useState } from "react";
import HeroLayoutEditor from "./HeroLayoutEditor";
import { DEFAULT_HERO_LAYOUT, HeroLayout, HeroPos, heroPosStyle, loadHeroLayout } from "./heroLayout";
import FluidCanvas from "./FluidCanvas";


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
  id: string;
  src: string;
  mobileSrc: string;
  alt: string;
  /** tailwind position + size classes used below md (desktop comes from heroLayout) */
  className: string;
  /** extra visual classes on the image */
  imgClassName?: string;
  /** repel strength & direction multiplier (x, y) */
  push: [number, number];
  /** idle float duration */
  float: number;
  delay?: number;
};

const items: Item[] = [
  {
    id: "jacket",
    src: jacketImg,
    mobileSrc: jacketImgSm,
    alt: "",
    className: "right-[-38%] top-[8%] w-[72vw] max-w-[620px] sm:right-[-10%] sm:w-[62vw]",
    push: [-46, -26],
    float: 9,
    delay: 0.15,
  },
  {
    id: "pants",
    src: pantsImg,
    mobileSrc: pantsImgSm,
    alt: "",
    className: "right-[-36%] bottom-[-2%] w-[72vw] max-w-[645px] sm:right-[-12%] sm:w-[64vw]",
    push: [34, 22],
    float: 11,
    delay: 0.3,
  },
  {
    id: "hoodie",
    src: hoodieImg,
    mobileSrc: hoodieImgSm,
    alt: "",
    className: "right-[-8%] top-[40%] w-[52vw] max-w-[540px] sm:right-[18%] sm:top-[28%] sm:w-[54vw]",
    imgClassName: "brightness-125",
    push: [-28, 34],
    float: 8,
    delay: 0.45,
  },
  {
    id: "tee",
    src: teesImg,
    mobileSrc: teesImgSm,
    alt: "",
    className: "right-[-18%] bottom-[12%] w-[52vw] max-w-[600px] sm:right-[2%] sm:bottom-[20%] sm:w-[52vw]",
    push: [26, -18],
    float: 10,
    delay: 0.6,
  },
  {
    id: "sneaker",
    src: sneakerImg,
    mobileSrc: sneakerImgSm,
    alt: "",
    className: "right-[43%] bottom-[18%] w-[24vw] max-w-[300px] hidden lg:block",
    push: [-20, -30],
    float: 7,
    delay: 0.75,
  },
];


const springCfg = { stiffness: 60, damping: 18, mass: 0.6 };

const HeroSection = () => {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const editMode = new URLSearchParams(location.search).has("hero-edit");

  const [layout, setLayout] = useState<HeroLayout>(() => loadHeroLayout());
  const [selected, setSelected] = useState<string | null>("hoodie");
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
            className="absolute right-[-34%] bottom-[-4%] w-[100vw] max-w-[1100px] select-none sm:right-[-14%] sm:w-[86vw] md:right-[-6%] md:bottom-[-6%] md:w-[72vw]"
          />
        </picture>
      </motion.div>

      {/* ── Layer 4: garments that flee the cursor ── */}
      <motion.div
        style={{ y: editMode ? 0 : itemsY }}
        className={`absolute inset-0 will-change-transform ${editMode ? "z-[60]" : "pointer-events-none"}`}
      >
        {items.map((item) => (
          <ParallaxItem
            key={item.id}
            item={item}
            mx={mx}
            my={my}
            pos={isDesktop ? layout[item.id] : undefined}
            editMode={editMode}
            selected={selected === item.id}
            onSelect={() => setSelected(item.id)}
            onDrag={(right, y) =>
              setLayout((prev) => ({ ...prev, [item.id]: { ...prev[item.id], right, y } }))
            }
            sectionRef={sectionRef}
          />
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
            "linear-gradient(to right, hsl(var(--primary) / 0.94) 0%, hsl(var(--primary) / 0.82) 38%, hsl(var(--primary) / 0.42) 66%, transparent 86%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.58) 36%, hsl(var(--primary) / 0.9) 86%, hsl(var(--primary) / 0.98) 100%)",
        }}
      />

      {/* ── Scroll-driven fade-to-black ── */}
      <motion.div
        style={{ opacity: darkOverlayOpacity }}
        className="absolute inset-0 bg-primary pointer-events-none"
      />

      {/* ── Interactive fluid / oil-paint layer (desktop pointer only) ── */}
      <FluidCanvas className="z-[5] opacity-[0.55] mix-blend-screen [filter:grayscale(0.9)_contrast(1.45)_brightness(0.95)]" />

      {/* ── Content ── */}
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

      {editMode && (
        <HeroLayoutEditor layout={layout} setLayout={setLayout} selected={selected} setSelected={setSelected} />
      )}
    </section>
  );
};

type MV = ReturnType<typeof useSpring>;

const ParallaxItem = ({
  item,
  mx,
  my,
  pos,
  editMode,
  selected,
  onSelect,
  onDrag,
  sectionRef,
}: {
  item: Item;
  mx: MV;
  my: MV;
  pos?: HeroPos;
  editMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onDrag: (right: number, y: number) => void;
  sectionRef: React.RefObject<HTMLElement>;
}) => {
  const x = useTransform(mx, (v) => (editMode ? 0 : v * item.push[0]));
  const y = useTransform(my, (v) => (editMode ? 0 : v * item.push[1]));
  const rotate = (pos ?? DEFAULT_HERO_LAYOUT[item.id]).rotate;

  const startDrag = (e: React.PointerEvent) => {
    if (!editMode || !pos) return;
    e.preventDefault();
    onSelect();
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offX = e.clientX - el.left;
    const offY = e.clientY - el.top;

    const move = (ev: PointerEvent) => {
      const left = ev.clientX - offX - rect.left;
      const top = ev.clientY - offY - rect.top;
      const right = ((rect.width - left - el.width) / rect.width) * 100;
      const yPct =
        pos.anchor === "top"
          ? (top / rect.height) * 100
          : ((rect.height - top - el.height) / rect.height) * 100;
      onDrag(Math.round(right * 10) / 10, Math.round(yPct * 10) / 10);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <motion.div
      onPointerDown={startDrag}
      style={{ x, y, ...(pos ? heroPosStyle(pos) : {}) }}
      className={`absolute ${pos ? "" : item.className} will-change-transform ${
        editMode ? `cursor-grab ${selected ? "outline outline-2 outline-accent" : "outline-dashed outline-1 outline-white/30"}` : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: item.delay ?? 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <picture>
          <source srcSet={item.mobileSrc} media="(max-width: 767px)" />
          <motion.img
            src={item.src}
            alt={item.alt}
            aria-hidden="true"
            width={900}
            height={900}
            decoding="async"
            loading="eager"
            fetchPriority="high"
            draggable={false}
            className={`h-auto w-full select-none drop-shadow-[0_35px_60px_rgba(0,0,0,0.65)] ${item.imgClassName ?? ""}`}
            style={{ rotate }}
            animate={editMode ? { y: 0 } : { y: [0, -14, 0] }}
            transition={editMode ? { duration: 0 } : { duration: item.float, repeat: Infinity, ease: "easeInOut" }}
          />
        </picture>
      </motion.div>
    </motion.div>
  );
};


export default HeroSection;
