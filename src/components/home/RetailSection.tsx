import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, MousePointerClick, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import teeMockup from "@/assets/tee-oversize.webp";
import printArt1 from "@/assets/print-art-1.webp";
import printArt3 from "@/assets/print-art-3.webp";
import printArt4 from "@/assets/print-art-4.webp";
import printArt5 from "@/assets/print-art-5.webp";

const DESIGNER_URL =
  "https://t-bode.lv/design?utm_source=ervitex.lv&utm_medium=promo_banner&utm_campaign=tbode_designer";

const shirtColors = [
  { name: "Black", lv: "Melns", en: "Black", hex: "#121212", ink: "#ffffff" },
  { name: "Bone", lv: "Balts", en: "White", hex: "#f4f2ed", ink: "#111111" },
  { name: "Red", lv: "Sarkans", en: "Red", hex: "#c8161d", ink: "#ffffff" },
  { name: "Navy", lv: "Tumši zils", en: "Navy", hex: "#1e2a44", ink: "#ffffff" },
  { name: "Sage", lv: "Zaļš", en: "Sage", hex: "#7d8b6a", ink: "#ffffff" },
  { name: "Sand", lv: "Smilšu", en: "Sand", hex: "#d6c3a5", ink: "#111111" },
];

const designs = [printArt3, printArt4, printArt1, printArt5];

const TBodeWordmark = () => (
  <span className="group/logo relative inline-flex select-none items-center gap-[0.15em] overflow-hidden font-heading text-lg font-bold uppercase tracking-[0.28em]">
    <span className="text-accent transition-transform duration-500 ease-out group-hover/logo:translate-x-0 md:-translate-x-0">
      T
    </span>
    <span className="inline-flex max-w-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover/logo:max-w-[9ch] group-hover/logo:opacity-100">
      <span className="whitespace-nowrap">-BODE</span>
    </span>

    <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover/logo:scale-x-100" />
  </span>
);

const RetailSection = () => {
  const { lang } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [colorIndex, setColorIndex] = useState(0);
  const [designIndex, setDesignIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = inView && tabVisible && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setColorIndex((c) => (c + 1) % shirtColors.length);
      setDesignIndex((d) => (d + 1) % designs.length);
    }, 2600);
    return () => clearInterval(id);
  }, [running]);

  const color = shirtColors[colorIndex];
  const design = designs[designIndex];

  const nextDesign = useCallback(() => setDesignIndex((d) => (d + 1) % designs.length), []);

  const highlights = useMemo(
    () => [
      { icon: MousePointerClick, lv: "Dizains tiešsaistē", en: "Design online" },
      { icon: Timer, lv: "2 minūtēs", en: "In 2 minutes" },
      { icon: Sparkles, lv: "No 1 gabala", en: "From 1 piece" },
    ],
    [],
  );

  const maskStyle = {
    WebkitMaskImage: `url(${teeMockup})`,
    maskImage: `url(${teeMockup})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  return (
    <section
      className="promo-banner relative isolate w-full overflow-hidden"
      aria-labelledby="tbode-promo-title"
    >
      {/* Ambient animated glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute -left-32 -top-40 h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl motion-safe:animate-promo-drift"
          style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-a)) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 right-[-10%] h-[30rem] w-[30rem] rounded-full opacity-45 blur-3xl motion-safe:animate-promo-drift-alt"
          style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-b)) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container grid items-center gap-8 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        {/* Copy */}
        <div>
          <TBodeWordmark />

          <h2
            id="tbode-promo-title"
            className="mt-5 max-w-2xl font-heading text-[clamp(1.9rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight"
          >
            {lang === "lv" ? (
              <>
                Tavs dizains.
                <br />
                <span className="text-accent">Tavs krekls.</span> Bez minimuma.
              </>
            ) : (
              <>
                Your design.
                <br />
                <span className="text-accent">Your tee.</span> No minimums.
              </>
            )}
          </h2>

          <p className="mt-5 max-w-lg text-base leading-relaxed opacity-80 sm:text-lg">
            {lang === "lv"
              ? "Oversize krekli un hūdiji ar profesionālu DTF apdruku. Uzliec savu grafiku, tekstu vai foto tiešsaistes konstruktorā un pasūti jau no viena gabala."
              : "Oversize tees and hoodies with professional DTF printing. Drop in your graphic, text or photo in the online builder and order from a single piece."}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {highlights.map((h) => (
              <span key={h.en} className="inline-flex items-center gap-2 text-sm font-medium">
                <h.icon className="h-4 w-4 text-accent" strokeWidth={1.8} aria-hidden />
                {lang === "lv" ? h.lv : h.en}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="promo-cta group h-14 w-full justify-center gap-3 rounded-none border-0 px-8 font-heading text-sm uppercase tracking-[0.15em] text-accent-foreground sm:w-auto"
              >
                <span className="whitespace-nowrap">
                  {lang === "lv" ? "Veidot savu dizainu" : "Create your design"}
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </Button>
            </a>

            <a href="https://t-bode.lv" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full justify-center rounded-none border-white/25 bg-transparent px-8 font-heading text-sm uppercase tracking-[0.15em] text-current transition-colors hover:bg-white/10 sm:w-auto"
              >
                {lang === "lv" ? "T-Bode veikals" : "T-Bode store"}
              </Button>
            </a>
          </div>
        </div>

        {/* Animated oversize tee */}
        <div ref={stageRef} className="relative">
          <div
            className="absolute inset-x-6 inset-y-10 rounded-[50%] bg-accent/15 blur-3xl motion-safe:animate-promo-pulse"
            aria-hidden
          />

          <button
            type="button"
            onClick={nextDesign}
            aria-label={lang === "lv" ? "Rādīt nākamo dizainu" : "Show next design"}
            className="relative mx-auto block aspect-square w-full max-w-[300px] outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-[420px] lg:max-w-[520px]"
          >
            <motion.div
              className="absolute inset-0 isolate"
              animate={reduceMotion ? undefined : { rotate: [-1.4, 1.4, -1.4], y: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={`c-${color.name}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0"
                  style={{ backgroundColor: color.hex, ...maskStyle }}
                />
              </AnimatePresence>

              <img
                src={teeMockup}
                alt={
                  lang === "lv"
                    ? "Oversize T-krekla priekšskatījums ar apdruku"
                    : "Oversize t-shirt preview with print"
                }
                width={900}
                height={900}
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
              />

              {/* Rotating print on the chest */}
              <div
                className="absolute left-1/2 top-[46%] z-10 flex h-[32%] w-[38%] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                aria-hidden
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`d-${designIndex}`}
                    src={design}
                    alt=""
                    width={900}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    initial={{ opacity: 0, scale: 0.8, rotate: -4, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.08, rotate: 3, filter: "blur(6px)" }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="h-full w-full object-contain drop-shadow-sm"
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </button>

          {/* Colour selection */}
          <div
            className="mt-6 flex items-center justify-center gap-3"
            role="group"
            aria-label={lang === "lv" ? "Krekla krāsas izvēle" : "Shirt colour selection"}
          >
            {shirtColors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorIndex(i)}
                aria-label={lang === "lv" ? c.lv : c.en}
                aria-pressed={i === colorIndex}
                className={`h-7 w-7 rounded-full border border-white/30 transition-all duration-300 hover:scale-110 ${
                  i === colorIndex ? "scale-110 ring-2 ring-accent ring-offset-2 ring-offset-transparent" : "opacity-70"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RetailSection;
