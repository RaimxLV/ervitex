import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import heroDuo from "@/assets/tbode-hero-duo.webp";
import tbodeLogo from "@/assets/tbode-logo.webp";
import printA from "@/assets/print-x1.webp";
import printB from "@/assets/print-x2.webp";
import printC from "@/assets/print-x3.webp";
import printD from "@/assets/print-x4.webp";
import printE from "@/assets/print-x5.webp";
import printF from "@/assets/print-x6.webp";
import printG from "@/assets/print-x7.webp";

const DESIGNER_URL = "https://t-bode.lv/design";

const designs = [printA, printB, printC, printD, printE, printF, printG];

const HERO_LQIP =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAASACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwC7ZvDLnEiHFNuL6BdSitBNEI2BEnXcG7DNc/bTyovy4cE/dUnFU5lJvypLZZwT681nymjkdpK832v7LC43BA+5lwOuMZ9aWMTvlZZEVkPII7VBJMW0tmKMxK4wTz6ZrDe7nAJ/eADqSDUOLZSkirZng/Wmtzfg9/NT+VFFamZI8jjVGAdgN57/AOzVieR9jLvbHpmiiofQtdT/2Q==";


/**
 * The original T-Bode logo (unaltered artwork) with a true RGB-split neon glitch treatment.
 * The R / G / B layers are masked copies of the very same file — no re-drawn wordmark.
 */
const rgbLayer = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  WebkitMaskImage: `url(${tbodeLogo})`,
  maskImage: `url(${tbodeLogo})`,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  mixBlendMode: "screen",
});

const GlitchLogo = ({ className }: { className?: string }) => (
  <div className={`relative ${className ?? ""}`} aria-hidden>
    {/* R */}
    <span
      className="glitch-layer-b absolute inset-0 block"
      style={{ ...rgbLayer("#FF1E4D"), opacity: 0.85 }}
    />
    {/* G */}
    <span
      className="glitch-layer-slice absolute inset-0 block"
      style={{ ...rgbLayer("#39FF6A"), opacity: 0.5 }}
    />
    {/* B */}
    <span
      className="glitch-layer-a absolute inset-0 block"
      style={{ ...rgbLayer("#00E5FF"), opacity: 0.85 }}
    />
    <img
      src={tbodeLogo}
      alt="T-Bode"
      className="glitch-layer-main relative h-full w-full object-contain"
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
 * Designs are mounted progressively (`ready` = how many may load) so the banner
 * paints fast and later artwork streams in during idle time.
 */
const BackPrint = ({
  index,
  x,
  y,
  w,
  h,
  rotate,
  opacity,
  ready,
}: {
  index: number;
  x: string;
  y: string;
  w: string;
  h: string;
  rotate: number;
  opacity: number;
  ready: number;
}) => (
  <div
    className="pointer-events-none absolute"
    style={{ left: x, top: y, width: w, height: h, transform: `translate(-50%,-50%) rotate(${rotate}deg)` }}
    aria-hidden
  >
    {designs.map((src, i) => {
      const load = i < ready || i === index;
      return load ? (
        <img
          key={src}
          src={src}
          alt=""
          width={480}
          height={480}
          decoding="async"
          fetchPriority={i === 0 ? "high" : "low"}
          style={{ opacity: i === index ? opacity : 0 }}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : null;
    })}
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

  // Stream the artwork in during idle time so the banner paints immediately.
  const [ready, setReady] = useState(2);
  useEffect(() => {
    if (ready >= designs.length) return;
    const id = window.setTimeout(() => setReady((r) => Math.min(r + 1, designs.length)), 250);
    return () => window.clearTimeout(id);
  }, [ready]);


  // Random, independent switching for each model (never the same design at once).
  useEffect(() => {
    if (!running) return;
    const pool = Math.max(2, ready);
    const pick = (current: number, other: number) => {
      let n = current;
      let guard = 0;
      while ((n === current || n === other) && guard++ < 20) n = Math.floor(Math.random() * pool);
      return n;
    };
    const idA = setInterval(() => setIndexA((a) => pick(a, indexB)), 2000);
    // Same 2s cadence for the woman, but offset by 1s so they never switch together.
    let idB = 0;
    const offset = window.setTimeout(() => {
      idB = window.setInterval(() => setIndexB((b) => pick(b, indexA)), 2000);
    }, 1000);
    return () => {
      clearInterval(idA);
      window.clearTimeout(offset);
      clearInterval(idB);
    };
  }, [running, indexA, indexB, ready]);


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
        <div
          className="absolute left-0 top-0 w-full aspect-[1920/1088] bg-cover bg-top sm:h-full sm:w-auto sm:min-w-full sm:translate-x-0"
          style={{ backgroundImage: `url(${HERO_LQIP})` }}
        >
          <img
            src={heroDuo}
            alt={
              lang === "lv"
                ? "Jaunieši oversize T-kreklos ar mainīgu apdrukas dizainu"
                : "Young people in oversize tees with changing print designs"
            }
            width={1920}
            height={1088}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {/* Man — black tee */}
          <BackPrint ready={ready} index={indexA} x="38.2%" y="52%" w="14.5%" h="21%" rotate={-1} opacity={0.97} />
          {/* Woman — off-white tee */}
          <BackPrint ready={ready} index={indexB} x="61.5%" y="57%" w="13.5%" h="19.5%" rotate={1.5} opacity={0.94} />
        </div>

        {/* Lighter cinematic gradients for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent sm:bg-gradient-to-l sm:from-black/75 sm:via-black/35 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 sm:from-black/50 sm:via-transparent sm:to-black/20" />

        {/* 25° glitchy neon T-Bode watermark across the whole banner (original logo artwork) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
          <GlitchLogo className="h-[37%] w-[168%] max-w-none rotate-[-25deg] opacity-[0.3] drop-shadow-[0_0_30px_rgba(0,229,255,0.35)]" />
        </div>

        {/* Random glitch sparks */}
        <GlitchSparks />
      </div>

      <div className="container relative flex flex-col justify-center pb-16 pt-[calc(56.7vw+1.5rem)] sm:min-h-[600px] sm:py-28 sm:pt-28 lg:min-h-[680px]">
        <div className="max-w-2xl">
          <h2
            id="tbode-promo-title"
            className="font-heading text-[clamp(2.2rem,5.4vw,4.4rem)] font-extrabold uppercase leading-[0.95] tracking-tight"
          >
            {lang === "lv" ? (
              <>
                Nepieciešams <span className="whitespace-nowrap text-accent">T-krekls</span> vai{" "}
                <span className="whitespace-nowrap">hūdijs</span> dāvanai?
              </>
            ) : (
              <>
                Need a <span className="whitespace-nowrap text-accent">T-shirt</span> or{" "}
                <span className="whitespace-nowrap">hoodie</span> as a gift?
              </>
            )}
          </h2>

          <p className="mt-8 max-w-2xl text-xl font-bold leading-snug tracking-tight sm:text-2xl lg:text-[1.75rem]">
            {lang === "lv" ? (
              <>
                Izveido savu dizainu{" "}
                <span className="font-extrabold uppercase text-accent drop-shadow-[0_0_18px_hsl(var(--accent)/0.6)]">
                  ONLINE
                </span>{" "}
                un saņem 1–2 dienās jebkurā pakomātā visā LATVIJĀ.
              </>
            ) : (
              <>
                Create your design{" "}
                <span className="font-extrabold uppercase text-accent drop-shadow-[0_0_18px_hsl(var(--accent)/0.6)]">
                  ONLINE
                </span>{" "}
                and get it in 1–2 days to any parcel locker in Latvia.
              </>
            )}
          </p>

          <div className="mt-12">
            <a href={DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
              <Button
                size="lg"
                className="promo-cta group h-16 w-full justify-center gap-4 rounded-none border-0 px-12 font-heading text-base font-bold uppercase tracking-[0.15em] text-accent-foreground transition-transform duration-300 motion-safe:animate-promo-pulse-cta hover:scale-[1.04] sm:h-[4.25rem] sm:w-auto sm:text-lg"
              >
                <span className="whitespace-nowrap">
                  {lang === "lv" ? "Izveidot dizainu" : "Create your design"}
                </span>
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-2"
                  strokeWidth={2.5}
                  aria-hidden
                />
              </Button>
            </a>
          </div>

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
