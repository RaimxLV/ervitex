import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointerClick, Zap, Shirt, ArrowRight, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import teeMockup from "@/assets/tee-mockup.png";
import printArt1 from "@/assets/print-art-1.png";
import printArt2 from "@/assets/print-art-2.png";

const DESIGNER_URL = "https://t-bode.lv/design";

const shirtColors = [
  { name: "Black", hex: "#141414", ink: "#ffffff" },
  { name: "White", hex: "#f2f2f2", ink: "#111111" },
  { name: "Red", hex: "#d11a1a", ink: "#ffffff" },
  { name: "Navy", hex: "#1f2b48", ink: "#ffffff" },
  { name: "Sand", hex: "#d9c7a7", ink: "#111111" },
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const color = shirtColors[step % shirtColors.length];
  const design = designs[step % designs.length];

  const benefits = [
    { icon: MousePointerClick, lv: "Drag & Drop tiešsaistes dizaina konstruktors", en: "Drag & drop online design builder" },
    { icon: Zap, lv: "Ātra DTF apdruka un piegāde no 1 gabala", en: "Fast DTF printing & delivery from 1 piece" },
    { icon: Shirt, lv: "Premium kvalitātes T-krekli un hūdiji", en: "Premium quality t-shirts & hoodies" },
  ];

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="promo-banner relative isolate overflow-hidden rounded-2xl shadow-2xl"
        >
          {/* Ambient animated glows */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40 animate-promo-drift"
              style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-a)) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-28 right-0 h-80 w-80 rounded-full blur-3xl opacity-40 animate-promo-drift-alt"
              style={{ background: "radial-gradient(circle, hsl(var(--promo-glow-b)) 0%, transparent 70%)" }}
            />
          </div>

          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-14">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
                <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                {lang === "lv" ? "T-Bode · no 1 gabala" : "T-Bode · from 1 piece"}
              </span>

              <h2 className="mt-5 font-heading text-2xl font-bold uppercase leading-tight sm:text-3xl lg:text-4xl">
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

              <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-80 sm:text-base">
                {lang === "lv"
                  ? "Negaidi atbildi no projekta vadītāja — izveido savu unikālo dizainu 2 minūtēs mūsu online konstruktorā!"
                  : "No need to wait for a project manager — create your unique design in 2 minutes in our online builder!"}
              </p>

              <ul className="mt-7 space-y-3">
                {benefits.map((b) => (
                  <li key={b.en} className="flex items-start gap-3 text-sm sm:text-base">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                      <b.icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="opacity-90">{lang === "lv" ? b.lv : b.en}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-start gap-3">
                <a href={DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="promo-cta group h-12 w-full justify-center gap-2 rounded-xl border-0 px-6 font-heading text-xs uppercase tracking-wider text-accent-foreground transition-transform duration-300 hover:scale-[1.02] sm:w-auto sm:text-sm"
                  >
                    <Palette className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                    <span className="truncate">
                      {lang === "lv" ? "Atvērt konstruktoru" : "Open the builder"}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
                  </Button>
                </a>
                <p className="text-[11px] uppercase tracking-wider opacity-50">t-bode.lv/design</p>
              </div>
            </div>

            {/* Animated realistic shirt */}
            <div className="relative">
              <div className="absolute inset-8 rounded-full bg-accent/20 blur-3xl animate-promo-pulse" aria-hidden />

              <div className="relative mx-auto aspect-square w-full max-w-[420px]">
                {/* Colour layer masked to shirt silhouette */}
                <motion.div
                  key={`c-${color.name}`}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
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
                {/* Fabric shading */}
                <img
                  src={teeMockup}
                  alt={lang === "lv" ? "T-krekla priekšskatījums" : "T-shirt preview"}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                />

                {/* Rotating design on the chest */}
                <div className="absolute left-1/2 top-[42%] flex h-[26%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`d-${step}`}
                      initial={{ opacity: 0, scale: 0.8, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -8 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="flex h-full w-full items-center justify-center"
                    >
                      {design.kind === "image" ? (
                        <img
                          src={design.src}
                          alt=""
                          width={768}
                          height={768}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span
                          className="text-center font-heading text-[clamp(0.65rem,2.2vw,1rem)] font-bold uppercase leading-tight tracking-widest"
                          style={{ color: color.ink }}
                        >
                          {lang === "lv" ? design.lv : design.en}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Colour dots */}
              <div className="mt-4 flex items-center justify-center gap-2.5">
                {shirtColors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setStep(i)}
                    aria-label={c.name}
                    aria-pressed={c.name === color.name}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      c.name === color.name ? "ring-2 ring-accent ring-offset-2 ring-offset-transparent" : "opacity-70"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="mt-3 text-center font-heading text-[10px] font-bold uppercase tracking-widest opacity-50">
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
