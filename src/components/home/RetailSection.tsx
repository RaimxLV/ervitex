import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, MousePointerClick, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import heroDuo from "@/assets/tbode-hero-duo.jpg";
import printArt1 from "@/assets/print-art-1.webp";
import printArt3 from "@/assets/print-art-3.webp";
import printArt4 from "@/assets/print-art-4.webp";
import printArt5 from "@/assets/print-art-5.webp";

const DESIGNER_URL =
  "https://t-bode.lv/design?utm_source=ervitex.lv&utm_medium=promo_banner&utm_campaign=tbode_designer";

const designs = [printArt3, printArt4, printArt1, printArt5];

const TBodeWordmark = () => (
  <span className="group/logo relative inline-flex select-none items-center gap-[0.15em] overflow-hidden font-heading text-lg font-bold uppercase tracking-[0.28em]">
    <span className="text-accent">T</span>
    <span className="inline-flex max-w-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover/logo:max-w-[9ch] group-hover/logo:opacity-100">
      <span className="whitespace-nowrap">-BODE</span>
    </span>
    <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover/logo:scale-x-100" />
  </span>
);

/** Print rendered on a model's back, positioned in % of the photo. */
const BackPrint = ({
  index,
  x,
  y,
  w,
  h,
  rotate,
  blend,
  opacity,
}: {
  index: number;
  x: string;
  y: string;
  w: string;
  h: string;
  rotate: number;
  blend: string;
  opacity: number;
}) => (
  <div
    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
    style={{ left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rotate}deg)` }}
    aria-hidden
  >
    <AnimatePresence mode="wait">
      <motion.img
        key={`p-${index}`}
        src={designs[index]}
        alt=""
        loading="lazy"
        decoding="async"
        initial={{ opacity: 0, scale: 0.82, filter: "blur(8px)" }}
        animate={{ opacity, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="h-full w-full object-contain"
        style={{ mixBlendMode: blend as React.CSSProperties["mixBlendMode"] }}
      />
    </AnimatePresence>
  </div>
);

const RetailSection = () => {
  const { lang } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = inView && tabVisible && !reduceMotion && !paused;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % designs.length), 2800);
    return () => clearInterval(id);
  }, [running]);

  const next = useCallback(() => setIndex((i) => (i + 1) % designs.length), []);

  const highlights = useMemo(
    () => [
      { icon: MousePointerClick, lv: "Dizains tiešsaistē", en: "Design online" },
      { icon: Timer, lv: "2 minūtēs", en: "In 2 minutes" },
      { icon: Sparkles, lv: "No 1 gabala", en: "From 1 piece" },
    ],
    [],
  );

  const ticker = lang === "lv" ? "OVERSIZE  •  DTF APDRUKA  •  NO 1 GABALA  •  T-BODE" : "OVERSIZE  •  DTF PRINT  •  FROM 1 PIECE  •  T-BODE";

  return (
    <section
      className="promo-banner relative isolate w-full overflow-hidden"
      aria-labelledby="tbode-promo-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Photo layer with interactive prints */}
      <div ref={stageRef} className="absolute inset-0 -z-10" aria-hidden={false}>
        <div className="absolute left-1/2 top-1/2 h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 aspect-[1920/1088] lg:left-[66%]">
          <img
            src={heroDuo}
            alt={
              lang === "lv"
                ? "Jaunieši oversize T-kreklos ar mainīgu apdrukas dizainu"
                : "Young people in oversize tees with changing print designs"
            }
            width={1920}
            height={1088}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {/* Man — black tee */}
          <BackPrint index={index} x="33.5%" y="55%" w="23%" h="33%" rotate={-1.5} blend="screen" opacity={1} />
          {/* Woman — off-white tee */}
          <BackPrint index={(index + 1) % designs.length} x="63.5%" y="64%" w="19%" h="28%" rotate={2} blend="multiply" opacity={1} />
        </div>

        {/* Cinematic gradients for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
      </div>

      <div className="container relative flex min-h-[560px] flex-col justify-center py-16 sm:min-h-[640px] sm:py-24 lg:min-h-[720px]">
        <div className="max-w-2xl">
          <TBodeWordmark />

          <h2
            id="tbode-promo-title"
            className="mt-6 font-heading text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[0.9] tracking-tight"
          >
            {lang === "lv" ? (
              <>
                Oversize.
                <br />
                <span className="text-accent">Tavs dizains.</span>
                <br />
                Bez minimuma.
              </>
            ) : (
              <>
                Oversize.
                <br />
                <span className="text-accent">Your design.</span>
                <br />
                No minimums.
              </>
            )}
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed opacity-85 sm:text-lg">
            {lang === "lv"
              ? "Profesionāla DTF apdruka uz oversize krekliem un hūdijiem. Uzliec savu grafiku tiešsaistes konstruktorā un pasūti jau no viena gabala."
              : "Professional DTF printing on oversize tees and hoodies. Drop your graphic into the online builder and order from a single piece."}
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {highlights.map((h) => (
              <span key={h.en} className="inline-flex items-center gap-2 text-sm font-medium">
                <h.icon className="h-4 w-4 text-accent" strokeWidth={1.8} aria-hidden />
                {lang === "lv" ? h.lv : h.en}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={next}
              className="h-14 w-full justify-center rounded-none border-white/30 bg-white/5 px-8 font-heading text-sm uppercase tracking-[0.15em] text-current backdrop-blur-sm transition-colors hover:bg-white/15 sm:w-auto"
            >
              {lang === "lv" ? "Mainīt apdruku" : "Switch the print"}
            </Button>
          </div>

          <a
            href="https://t-bode.lv"
            target="_blank"
            rel="noopener noreferrer"
            className="story-link mt-6 inline-block text-sm uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
          >
            {lang === "lv" ? "T-Bode veikals" : "T-Bode store"}
          </a>
        </div>
      </div>

      {/* Vertical side label */}
      <span
        className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rotate-180 font-heading text-[0.7rem] uppercase tracking-[0.45em] opacity-60 lg:block"
        style={{ writingMode: "vertical-rl" }}
        aria-hidden
      >
        {lang === "lv" ? "Drukāts Latvijā" : "Printed in Latvia"}
      </span>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-white/10 bg-accent py-2.5" aria-hidden>
        <div className="flex w-max motion-safe:animate-promo-ticker">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="whitespace-nowrap px-6 font-heading text-xs uppercase tracking-[0.3em] text-accent-foreground sm:text-sm"
            >
              {ticker}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RetailSection;
