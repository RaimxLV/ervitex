import { useState } from "react";
import { motion } from "framer-motion";
import { Store, ExternalLink, Wand2, Shirt, Palette, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import ModernGallery, { type GallerySlide } from "@/components/ModernGallery";
import tbodeStore from "@/assets/tbode-store.jpg";
import tbodeMugs from "@/assets/tbode-mugs.jpg";
import tbodeLatvija from "@/assets/tbode-latvija.jpg";
import tbodeBottles from "@/assets/tbode-bottles.jpg";
import tbodeApparel from "@/assets/tbode-apparel.jpg";
import tbodeSouvenirs from "@/assets/tbode-souvenirs.jpg";

const TBODE_URL = "https://www.t-bode.lv";

const shirtColors = [
  { name: "Black", hex: "#111111", ink: "#ffffff" },
  { name: "White", hex: "#f4f4f4", ink: "#111111" },
  { name: "Red", hex: "#d11a1a", ink: "#ffffff" },
  { name: "Sage", hex: "#9fb8a4", ink: "#111111" },
  { name: "Navy", hex: "#1f2b48", ink: "#ffffff" },
  { name: "Sand", hex: "#d9c7a7", ink: "#111111" },
];

const printOptions = [
  { lv: "TAVS TEKSTS", en: "YOUR TEXT" },
  { lv: "LOGO", en: "LOGO" },
  { lv: "FOTO", en: "PHOTO" },
];

const TShirtMockup = ({ color, ink, label }: { color: string; ink: string; label: string }) => (
  <svg viewBox="0 0 320 340" className="h-full w-full" role="img" aria-label={`T-krekls ${color}`}>
    <path
      d="M110 26 L80 40 L26 74 L52 128 L82 112 L82 314 Q160 328 238 314 L238 112 L268 128 L294 74 L240 40 L210 26 Q160 62 110 26 Z"
      fill={color}
      stroke="rgba(0,0,0,0.18)"
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

  const slides: GallerySlide[] = [
    { src: tbodeStore, caption: "T-Bode — T/C Akropole" },
    { src: tbodeApparel, caption: lang === "lv" ? "Latvija kolekcija" : "Latvija Collection" },
    { src: tbodeMugs, caption: lang === "lv" ? "Krūzes un aksesuāri" : "Mugs & Accessories" },
    { src: tbodeLatvija, caption: lang === "lv" ? "Suvenīri un dāvanas" : "Souvenirs & Gifts" },
    { src: tbodeBottles, caption: lang === "lv" ? "Termokrūzes" : "Travel Mugs" },
    { src: tbodeSouvenirs, caption: lang === "lv" ? "Unikālie suvenīri" : "Unique Souvenirs" },
  ];

  const perks = [
    {
      icon: Wand2,
      lv: "Dizainu izveido pats online",
      en: "Design it yourself online",
    },
    {
      icon: Shirt,
      lv: "No 1 gabala — bez minimālā pasūtījuma",
      en: "From 1 piece — no minimum order",
    },
    {
      icon: Truck,
      lv: "Apdruka tās pašas dienas laikā",
      en: "Same-day printing",
    },
  ];

  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
              {lang === "lv" ? "Mazumtirdzniecība · 1 gabals" : "Retail · single piece"}
            </span>
            <div className="h-px w-10 bg-accent" />
          </div>
          <h2 className="font-heading text-2xl font-bold uppercase text-foreground md:text-3xl">
            {lang === "lv" ? "Vajag tikai vienu kreklu ar savu dizainu?" : "Need just one shirt with your own design?"}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {lang === "lv"
              ? "Lielos projektus vadām mēs. Individuāliem un maziem pasūtījumiem izveido dizainu pats — mūsu mazumtirdzniecības zīmola T‑Bode online konstruktorā."
              : "We manage large projects. For single and small orders, design it yourself in the online configurator of our retail brand T‑Bode."}
          </p>
        </motion.div>

        {/* Interactive banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 overflow-hidden rounded-sm border border-border bg-primary text-primary-foreground shadow-xl"
        >
          <div className="grid gap-0 md:grid-cols-2">
            {/* Live mockup */}
            <div className="relative flex flex-col items-center justify-center gap-6 bg-primary-foreground/[0.04] p-6 md:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <motion.div
                key={`${colorIdx}-${printIdx}`}
                initial={{ scale: 0.96, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative h-56 w-full max-w-[280px] md:h-72"
              >
                <TShirtMockup
                  color={color.hex}
                  ink={color.ink}
                  label={lang === "lv" ? printOptions[printIdx].lv : printOptions[printIdx].en}
                />
              </motion.div>

              <div className="relative w-full max-w-[320px] space-y-4">
                <div>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50">
                    {lang === "lv" ? "Krāsa" : "Colour"}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shirtColors.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColorIdx(i)}
                        aria-label={c.name}
                        aria-pressed={i === colorIdx}
                        className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                          i === colorIdx
                            ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-primary"
                            : "border-primary-foreground/25"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50">
                    {lang === "lv" ? "Apdruka" : "Print"}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {printOptions.map((p, i) => (
                      <button
                        key={p.en}
                        type="button"
                        onClick={() => setPrintIdx(i)}
                        aria-pressed={i === printIdx}
                        className={`flex items-center gap-1.5 border px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          i === printIdx
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-primary-foreground/20 text-primary-foreground/70 hover:border-primary-foreground/50"
                        }`}
                      >
                        <Palette className="h-3 w-3" strokeWidth={1.5} />
                        {lang === "lv" ? p.lv : p.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Message + CTA */}
            <div className="flex flex-col justify-center gap-6 border-t border-primary-foreground/10 p-6 md:border-l md:border-t-0 md:p-10">
              <div>
                <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-accent">
                  T‑Shirt Store By T‑Bode
                </span>
                <h3 className="mt-2 font-heading text-2xl font-bold uppercase leading-tight md:text-3xl">
                  {lang === "lv" ? (
                    <>
                      Personalizē kreklu
                      <br />
                      <span className="text-accent">online — 2 minūtēs</span>
                    </>
                  ) : (
                    <>
                      Personalise your shirt
                      <br />
                      <span className="text-accent">online — in 2 minutes</span>
                    </>
                  )}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70 md:text-base">
                  {lang === "lv"
                    ? "Izvēlies modeli un krāsu, augšuplādē savu bildi vai tekstu un redzi cenu uzreiz. Nav jāgaida piedāvājums."
                    : "Pick a model and colour, upload your image or text and see the price instantly. No need to wait for a quote."}
                </p>
              </div>

              <ul className="space-y-2.5">
                {perks.map((p) => (
                  <li key={p.en} className="flex items-start gap-3 text-sm text-primary-foreground/80">
                    <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                    {lang === "lv" ? p.lv : p.en}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={TBODE_URL} target="_blank" rel="noopener noreferrer" className="sm:flex-1">
                  <Button
                    size="lg"
                    className="group h-auto w-full min-w-0 whitespace-normal bg-accent px-5 py-3 font-heading text-xs uppercase tracking-wider text-accent-foreground hover:bg-accent/90"
                  >
                    <Wand2 className="mr-2 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {lang === "lv" ? "Personalizēt kreklu" : "Personalise a shirt"}
                    <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                  </Button>
                </a>
                <a href={TBODE_URL} target="_blank" rel="noopener noreferrer" className="sm:flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto w-full min-w-0 whitespace-normal border-primary-foreground/25 bg-transparent px-5 py-3 font-heading text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    www.t-bode.lv
                  </Button>
                </a>
              </div>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/60 transition-colors hover:text-accent"
              >
                <Store className="h-4 w-4" strokeWidth={1.5} />
                {lang === "lv" ? "Mūsu veikalu adreses" : "Find our stores"}
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-10">
          <ModernGallery slides={slides} aspectRatio="16/9" />
        </div>
      </div>
    </section>
  );
};

export default RetailSection;
