import { useState } from "react";
import { motion } from "framer-motion";
import { MousePointerClick, Zap, Shirt, ArrowRight, Sparkles, Palette, Type, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const DESIGNER_URL = "https://t-bode.lv/design";

const shirtColors = [
  { name: "Black", hex: "#111111", ink: "#ffffff" },
  { name: "White", hex: "#f4f4f4", ink: "#111111" },
  { name: "Red", hex: "#d11a1a", ink: "#ffffff" },
  { name: "Navy", hex: "#1f2b48", ink: "#ffffff" },
  { name: "Sand", hex: "#d9c7a7", ink: "#111111" },
];

const printOptions = [
  { icon: Type, lv: "TAVS TEKSTS", en: "YOUR TEXT" },
  { icon: Sparkles, lv: "LOGO", en: "LOGO" },
  { icon: ImageIcon, lv: "FOTO", en: "PHOTO" },
];

const TShirtMockup = ({ color, ink, label }: { color: string; ink: string; label: string }) => (
  <svg viewBox="0 0 320 340" className="h-full w-full drop-shadow-2xl" role="img" aria-label={`T-krekls ${color}`}>
    <path
      d="M110 26 L80 40 L26 74 L52 128 L82 112 L82 314 Q160 328 238 314 L238 112 L268 128 L294 74 L240 40 L210 26 Q160 62 110 26 Z"
      fill={color}
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="2"
    />
    <path d="M110 26 Q160 62 210 26" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="3" />
    <rect x="104" y="150" width="112" height="86" rx="2" fill="none" stroke={ink} strokeOpacity="0.35" strokeDasharray="5 5" />
    <text
      x="160"
      y="200"
      textAnchor="middle"
      fill={ink}
      fontSize="17"
      fontWeight="700"
      letterSpacing="1.5"
      fontFamily="'Space Grotesk', sans-serif"
    >
      {label}
    </text>
  </svg>
);

const RetailSection = () => {
  const { lang } = useLanguage();
  const [colorIdx, setColorIdx] = useState(0);
  const [printIdx, setPrintIdx] = useState(0);
  const color = shirtColors[colorIdx];

  const benefits = [
    {
      icon: MousePointerClick,
      lv: "Drag & Drop tiešsaistes dizaina konstruktors",
      en: "Drag & drop online design builder",
    },
    {
      icon: Zap,
      lv: "Ātra DTF apdruka un piegāde no 1 gabala",
      en: "Fast DTF printing & delivery from 1 piece",
    },
    {
      icon: Shirt,
      lv: "Premium kvalitātes T-krekli un hūdiji",
      en: "Premium quality t-shirts & hoodies",
    },
  ];

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="promo-banner relative isolate overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
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
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--promo-fg)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--promo-fg)) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-14">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
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
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-accent">
                      <b.icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="opacity-90">{lang === "lv" ? b.lv : b.en}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a href={DESIGNER_URL} target="_blank" rel="noopener noreferrer" className="block sm:inline-block">
                  <Button
                    size="lg"
                    className="promo-cta group h-auto w-full min-w-0 whitespace-normal rounded-xl border-0 px-6 py-4 font-heading text-xs uppercase tracking-wider text-accent-foreground transition-all duration-300 hover:scale-[1.02] sm:w-auto sm:text-sm"
                  >
                    <Palette className="mr-2 h-4 w-4 shrink-0" strokeWidth={1.8} />
                    {lang === "lv" ? "Atvērt dizaina konstruktoru" : "Open the design builder"}
                    <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
                  </Button>
                </a>
                <p className="mt-3 text-[11px] uppercase tracking-wider opacity-50">t-bode.lv/design</p>
              </div>
            </div>

            {/* Interactive preview */}
            <div className="relative">
              <div className="absolute inset-6 rounded-3xl bg-accent/20 blur-3xl animate-promo-pulse" aria-hidden />
              <motion.div
                whileHover={{ y: -6, rotate: -0.6 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-7"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
                  <span className="ml-2 font-heading text-[10px] font-bold uppercase tracking-widest opacity-50">
                    {lang === "lv" ? "Dizaina priekšskatījums" : "Design preview"}
                  </span>
                </div>

                <motion.div
                  key={`${colorIdx}-${printIdx}`}
                  initial={{ scale: 0.96, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mx-auto h-52 w-full max-w-[260px] sm:h-64"
                >
                  <TShirtMockup
                    color={color.hex}
                    ink={color.ink}
                    label={lang === "lv" ? printOptions[printIdx].lv : printOptions[printIdx].en}
                  />
                </motion.div>

                <div className="mt-5 space-y-4">
                  <div>
                    <span className="font-heading text-[10px] font-bold uppercase tracking-widest opacity-50">
                      {lang === "lv" ? "Krāsa" : "Colour"}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2.5">
                      {shirtColors.map((c, i) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setColorIdx(i)}
                          aria-label={c.name}
                          aria-pressed={i === colorIdx}
                          className={`h-9 w-9 rounded-full border transition-transform hover:scale-110 ${
                            i === colorIdx ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-transparent" : "border-white/20"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-[10px] font-bold uppercase tracking-widest opacity-50">
                      {lang === "lv" ? "Apdruka" : "Print"}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {printOptions.map((p, i) => (
                        <button
                          key={p.en}
                          type="button"
                          onClick={() => setPrintIdx(i)}
                          aria-pressed={i === printIdx}
                          className={`flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-2 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            i === printIdx
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-white/15 opacity-70 hover:border-white/40 hover:opacity-100"
                          }`}
                        >
                          <p.icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                          {lang === "lv" ? p.lv : p.en}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating stickers */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-1 -top-3 rounded-full border border-white/15 bg-accent px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-lg sm:-right-3"
              >
                {lang === "lv" ? "No 1 gab." : "From 1 pc."}
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-3 -left-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm sm:-left-3"
              >
                DTF PRINT
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RetailSection;
