import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, MousePointerClick, Timer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import heroDuo from "@/assets/tbode-hero-duo.jpg";
import tbodeLogo from "@/assets/tbode-logo.webp";
import printA from "@/assets/print-x1.webp";
import printB from "@/assets/print-x2.webp";
import printC from "@/assets/print-x3.webp";
import printD from "@/assets/print-x4.webp";
import printE from "@/assets/print-x5.webp";
import printF from "@/assets/print-x6.webp";
import printG from "@/assets/print-x7.webp";

const DESIGNER_URL =
  "https://t-bode.lv/design?utm_source=ervitex.lv&utm_medium=promo_banner&utm_campaign=tbode_designer";

const designs = [printA, printB, printC, printD, printE, printF, printG];

/**
 * The original T-Bode logo (unaltered artwork) with an RGB-split neon glitch treatment.
 * Layers are copies of the same file — no re-drawn / interpreted wordmark.
 */
const GlitchLogo = ({ className }: { className?: string }) => (
  <div className={`relative ${className ?? ""}`} aria-hidden>
    <img
      src={tbodeLogo}
      alt=""
      className="glitch-layer-a absolute inset-0 h-full w-full object-contain mix-blend-screen"
      style={{ filter: "drop-shadow(0 0 6px #00E5FF)", opacity: 0.7 }}
      loading="lazy"
      decoding="async"
    />
    <img
      src={tbodeLogo}
      alt=""
      className="glitch-layer-b absolute inset-0 h-full w-full object-contain mix-blend-screen"
      style={{ filter: "drop-shadow(0 0 6px #FF1E4D)", opacity: 0.7 }}
      loading="lazy"
      decoding="async"
    />
    <img
      src={tbodeLogo}
      alt="T-Bode"
      className="glitch-layer-main relative h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
    <img
      src={tbodeLogo}
      alt=""
      className="glitch-layer-slice absolute inset-0 h-full w-full object-contain"
      style={{ opacity: 0.45 }}
      loading="lazy"
      decoding="async"
    />
  </div>
);

/** Random glitch sparks — small crosses and circles flickering at random spots. */
const GlitchSparks = () => {
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        top: `${8 + Math.random() * 84}%`,
        size: 8 + Math.random() * 18,
        delay: Math.random() * 6,
        duration: 2.4 + Math.random() * 3,
        cross: i % 2 === 0,
        color: i % 3 === 0 ? "#FF1E4D" : i % 3 === 1 ? "#00E5FF" : "#FFFFFF",
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute motion-safe:animate-glitch-spark"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <svg viewBox="0 0 20 20" className="h-full w-full" style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}>
            {s.cross ? (
              <g stroke={s.color} strokeWidth={1.6}>
                <line x1={2} y1={10} x2={18} y2={10} />
                <line x1={10} y1={2} x2={10} y2={18} />
              </g>
            ) : (
              <circle cx={10} cy={10} r={7} fill="none" stroke={s.color} strokeWidth={1.6} />
            )}
          </svg>
        </span>
      ))}
    </div>
  );
};



/**
 * Print rendered on a model's back, positioned in % of the photo.
 * All designs are mounted at once (hard switch, no fade) so swapping is instant
 * and no image has to be fetched mid-animation.
 */
const BackPrint = ({
  index,
  x,
  y,
  w,
  h,
  rotate,
  opacity,
  eager,
}: {
  index: number;
  x: string;
  y: string;
  w: string;
  h: string;
  rotate: number;
  opacity: number;
  eager: boolean;
}) => (
  <div
    className="pointer-events-none absolute"
    style={{ left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rotate}deg)` }}
    aria-hidden
  >
    {designs.map((src, i) => (
      <img
        key={src}
        src={eager || i === index ? src : undefined}
        data-src={src}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ opacity: i === index ? opacity : 0 }}
        className="absolute inset-0 h-full w-full object-contain"
      />
    ))}
  </div>
);



const RetailSection = () => {
  const { lang } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(3);
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

  // Random, independent switching for each model (never the same design at once).
  useEffect(() => {
    if (!running) return;
    const pick = (current: number, other: number) => {
      let n = current;
      let guard = 0;
      while ((n === current || n === other) && guard++ < 20) n = Math.floor(Math.random() * designs.length);
      return n;
    };
    const idA = setInterval(() => setIndexA((a) => pick(a, indexB)), 2000 + Math.random() * 900);
    const idB = setInterval(() => setIndexB((b) => pick(b, indexA)), 2600 + Math.random() * 900);
    return () => {
      clearInterval(idA);
      clearInterval(idB);
    };
  }, [running, indexA, indexB]);

  const next = useCallback(() => {
    setIndexA((a) => (a + 1) % designs.length);
    setIndexB((b) => (b + 2) % designs.length);
  }, []);


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
        <div className="absolute top-1/2 h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 aspect-[1920/1088] left-[34%] sm:left-1/2 lg:left-[66%]">
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
          <BackPrint eager={inView} index={index} x="33.5%" y="55%" w="23%" h="33%" rotate={-1.5} opacity={0.97} />
          {/* Woman — off-white tee (smaller, placed on the flat upper back to avoid fabric folds) */}
          <BackPrint
            eager={inView}
            index={(index + 3) % designs.length}
            x="63.5%"
            y="59%"
            w="15%"
            h="21%"
            rotate={2}
            opacity={0.92}
          />
        </div>

        {/* Lighter cinematic gradients for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* 25° glitchy neon T-Bode watermark across the whole banner (original logo artwork) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
          <GlitchLogo className="h-[46%] w-[210%] max-w-none rotate-[-25deg] opacity-[0.3] drop-shadow-[0_0_30px_rgba(0,229,255,0.35)]" />
        </div>

        {/* Random glitch sparks */}
        <GlitchSparks />
      </div>

      <div className="container relative flex min-h-[660px] flex-col justify-start py-14 sm:min-h-[640px] sm:justify-center sm:py-24 lg:min-h-[720px]">
        <div className="max-w-2xl">


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
