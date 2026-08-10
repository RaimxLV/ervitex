import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MousePointerClick, Zap, Shirt, ArrowRight, Sparkles, Palette, Pause, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import teeMockup from "@/assets/tee-mockup.webp";
import printArt1 from "@/assets/print-art-1.webp";
import printArt2 from "@/assets/print-art-2.webp";

const DESIGNER_URL =
  "https://t-bode.lv/design?utm_source=ervitex.lv&utm_medium=promo_banner&utm_campaign=tbode_designer";

const shirtColors = [
  { name: "Black", lv: "Melns", en: "Black", hex: "#141414", ink: "#ffffff" },
  { name: "White", lv: "Balts", en: "White", hex: "#f2f2f2", ink: "#111111" },
  { name: "Red", lv: "Sarkans", en: "Red", hex: "#d11a1a", ink: "#ffffff" },
  { name: "Navy", lv: "Tumši zils", en: "Navy", hex: "#1f2b48", ink: "#ffffff" },
  { name: "Sand", lv: "Smilšu", en: "Sand", hex: "#d9c7a7", ink: "#111111" },
];

type Design =
  | { kind: "text"; lv: string; en: string }
  | { kind: "image"; src: string; lv: string; en: string };

const designs: Design[] = [
  { kind: "text", lv: "TAVS TEKSTS", en: "YOUR TEXT" },
  { kind: "image", src: printArt1, lv: "TAVA BILDE", en: "YOUR PHOTO" },
  { kind: "text", lv: "TAVS LOGO", en: "YOUR LOGO" },
  { kind: "image", src: printArt2, lv: "TAVS DIZAINS", en: "YOUR DESIGN" },
];

const RetailSection = () => {
  const { lang } = useLanguage();
  const reduceMotion = useReducedMotion();

  const [colorIndex, setColorIndex] = useState(0);
  const [designIndex, setDesignIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = inView && tabVisible && !paused && !reduceMotion;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setColorIndex((c) => (c + 1) % shirtColors.length);
      setDesignIndex((d) => (d + 1) % designs.length);
    }, 3200);
    return () => clearInterval(id);
  }, [running]);

  const color = shirtColors[colorIndex];
  const design = designs[designIndex];

  const nextDesign = useCallback(() => setDesignIndex((d) => (d + 1) % designs.length), []);

  const benefits = useMemo(
    () => [
      {
        icon: MousePointerClick,
        lv: "Drag & drop tiešsaistes dizaina konstruktors",
        en: "Drag & drop online design builder",
      },
      {
        icon: Zap,
        lv: "Ātra DTF apdruka un piegāde no 1 gabala",
        en: "Fast DTF printing & delivery from 1 piece",
      },
      { icon: Shirt, lv: "Premium kvalitātes T-krekli un hūdiji", en: "Premium quality t-shirts & hoodies" },
    ],
    [],
  );

  const openInNewTab = lang === "lv" ? "(atveras jaunā logā)" : "(opens in a new tab)";

  return (
    <section className="py-10 md:py-16" aria-labelledby="tbode-promo-title">
      <div className="container">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="promo-banner relative isolate overflow-hidden rounded-2xl shadow-2xl"
        >
          {/* Ambient animated glows */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
            <div
              className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40 motion-safe:animate-promo-drift"
              style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-a)) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-28 right-0 h-80 w-80 rounded-full blur-3xl opacity-40 motion-safe:animate-promo-drift-alt"
              style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-b)) 0%, transparent 70%)" }}
            />
          </div>

          <div className="grid items-center gap-5 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:p-14">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
                <Sparkles className="h-3 w-3" strokeWidth={1.8} aria-hidden />
                {lang === "lv" ? "T-Bode · apdruka no 1 gabala" : "T-Bode · printing from 1 piece"}
              </span>

              <h2
                id="tbode-promo-title"
                className="mt-4 font-heading text-2xl font-bold uppercase leading-tight sm:text-3xl lg:text-4xl"
              >
                {lang === "lv" ? (
                  <>
                    Vajadzīgs tikai <span className="text-accent">1 krekliņš</span> vai dāvana ar savu apdruku?
                  </>
                ) : (
                  <>
                    Need just <span className="text-accent">1 shirt</span> or a gift with your own print?
                  </>
                )}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90 sm:text-base">
                {lang === "lv"
                  ? "Negaidi atbildi no projekta vadītāja — izveido savu unikālo dizainu 2 minūtēs mūsu tiešsaistes konstruktorā."
                  : "No need to wait for a project manager — create your unique design in 2 minutes in our online builder."}
              </p>

              <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                {benefits.map((b) => (
                  <li key={b.en} className="flex items-start gap-3 text-sm sm:text-base">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-accent">
                      <b.icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="opacity-95">{lang === "lv" ? b.lv : b.en}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <a
                  href={DESIGNER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="promo-cta group h-12 w-full justify-center gap-2 rounded-xl border-0 px-6 font-heading text-xs uppercase tracking-wider text-accent-foreground transition-transform duration-300 hover:scale-[1.02] sm:w-auto sm:text-sm"
                  >
                    <Palette className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
                    <span className="whitespace-nowrap">
                      {lang === "lv" ? "Atvērt konstruktoru" : "Open the builder"}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                    <span className="sr-only">{openInNewTab}</span>
                  </Button>
                </a>

                <a
                  href="https://t-bode.lv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full justify-center gap-2 rounded-xl border-white/30 bg-white/5 px-6 font-heading text-xs uppercase tracking-wider text-current hover:bg-white/15 sm:w-auto sm:text-sm"
                  >
                    <span className="whitespace-nowrap">{lang === "lv" ? "Uzzināt vairāk" : "Learn more"}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden />
                    <span className="sr-only">{openInNewTab}</span>
                  </Button>
                </a>
              </div>

              <p className="mt-3 text-xs uppercase tracking-wider opacity-80">
                {lang === "lv"
                  ? "Bez minimālā pasūtījuma · Apdruka Rīgā · t-bode.lv"
                  : "No minimum order · Printed in Riga · t-bode.lv"}
              </p>
            </div>

            {/* Animated realistic shirt */}
            <div
              ref={stageRef}
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              <div
                className="absolute inset-10 rounded-full bg-accent/20 blur-3xl motion-safe:animate-promo-pulse"
                aria-hidden
              />

              <button
                type="button"
                onClick={nextDesign}
                aria-label={lang === "lv" ? "Rādīt nākamo dizainu" : "Show next design"}
                className="relative mx-auto block aspect-square w-full max-w-[230px] cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-[360px] lg:max-w-[440px]"
              >
                {/* Shirt body: colour + fabric shading in an isolated blend group */}
                <motion.div
                  className="absolute inset-0 isolate"
                  animate={reduceMotion ? undefined : { rotate: [-1.2, 1.2, -1.2], y: [0, -6, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div
                    className="absolute inset-0 bg-white/5"
                    style={{
                      WebkitMaskImage: `url(${teeMockup})`,
                      maskImage: `url(${teeMockup})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={`c-${color.name}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0"
                      style={{
                        backgroundColor: color.hex,
                        WebkitMaskImage: `url(${teeMockup})`,
                        maskImage: `url(${teeMockup})`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                      }}
                    />
                  </AnimatePresence>
                  <img
                    src={teeMockup}
                    alt={lang === "lv" ? "T-krekla priekšskatījums ar apdruku" : "T-shirt preview with print"}
                    width={768}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                  />

                  {/* Rotating design on the chest */}
                  <div
                    className="absolute left-1/2 top-[44%] z-10 flex h-[30%] w-[40%] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    aria-hidden
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`d-${designIndex}`}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -8 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="flex h-full w-full items-center justify-center"
                      >
                        {design.kind === "image" ? (
                          <img
                            src={design.src}
                            alt=""
                            width={768}
                            height={768}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span
                            className="text-center font-heading text-[clamp(0.6rem,2vw,1rem)] font-bold uppercase leading-tight tracking-widest"
                            style={{ color: color.ink }}
                          >
                            {lang === "lv" ? design.lv : design.en}
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </button>

              {/* Colour dots + playback control */}
              <div
                className="mt-4 flex items-center justify-center gap-2.5"
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
                    className={`h-8 w-8 rounded-full border border-white/40 transition-transform hover:scale-110 ${
                      i === colorIndex ? "ring-2 ring-accent ring-offset-2 ring-offset-transparent" : "opacity-80"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={
                    paused
                      ? lang === "lv"
                        ? "Atsākt animāciju"
                        : "Resume animation"
                      : lang === "lv"
                        ? "Apturēt animāciju"
                        : "Pause animation"
                  }
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 transition-colors hover:bg-white/20"
                >
                  {paused ? (
                    <Play className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  ) : (
                    <Pause className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  )}
                </button>
              </div>

              <p className="mt-3 text-center font-heading text-[10px] font-bold uppercase tracking-widest opacity-80">
                {lang === "lv" ? "Teksts · Logo · Foto · DTF apdruka" : "Text · Logo · Photo · DTF print"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RetailSection;
