import { motion } from "framer-motion";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.6;

const techs = [
  { lv: "Sietspiede", en: "Screen printing" },
  { lv: "DTF druka", en: "DTF printing" },
  { lv: "Izšūšana", en: "Embroidery" },
  { lv: "Sublimācija", en: "Sublimation" },
];

const brands = ["STANLEY/STELLA", "MALFINI", "CLIQUE"];

const ValueCards = () => {
  const { lang } = useLanguage();
  const isLv = lang === "lv";

  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center lg:mb-16 lg:text-left"
        >
          <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
            <div className="h-[2px] w-8 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {isLv ? "Kāpēc mēs" : "Why us"}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {isLv ? "Mūsu " : "Our "}
            <span className="text-accent">{isLv ? "vērtības" : "values"}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-6 lg:grid-cols-12"
        >
          {/* Pieredze — anchor */}
          <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden border-b-4 border-accent bg-card p-8 shadow-xl md:col-span-6 md:p-10 lg:col-span-7 lg:min-h-[400px]">
            <div className="pointer-events-none absolute -right-10 -top-16 select-none opacity-[0.04]">
              <span className="font-heading text-[220px] font-bold leading-none text-foreground lg:text-[300px]">
                20
              </span>
            </div>
            <div className="relative">
              <div className="mb-8 flex h-12 w-12 items-center justify-center bg-accent">
                <ShieldCheck className="h-6 w-6 text-accent-foreground" strokeWidth={SW} />
              </div>
              <h3 className="mb-4 font-heading text-2xl font-bold uppercase text-card-foreground md:text-3xl">
                {isLv ? "Pieredze" : "Experience"}
              </h3>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                {isLv ? (
                  <>
                    Vairāk nekā <span className="font-bold text-card-foreground">20 gadi nozarē</span> — mēs
                    saprotam tekstila un drukas specifiku līdz detaļām. Desmitgadēs uzkrātās zināšanas
                    garantē rezultātu.
                  </>
                ) : (
                  <>
                    More than <span className="font-bold text-card-foreground">20 years in the industry</span> —
                    we understand textile and print specifics down to the finest detail. Decades of
                    know-how guarantee the result.
                  </>
                )}
              </p>
            </div>
            <div className="relative mt-8 flex gap-10 border-t border-border pt-8 md:gap-12">
              <div>
                <div className="font-heading text-3xl font-bold text-accent md:text-4xl">20+</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isLv ? "Gadu pieredze" : "Years of experience"}
                </div>
              </div>
              <div>
                <div className="font-heading text-3xl font-bold text-card-foreground md:text-4xl">5k+</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isLv ? "Realizēti projekti" : "Completed projects"}
                </div>
              </div>
            </div>
          </div>

          {/* Stabilitāte — dark */}
          <div className="flex flex-col justify-between bg-foreground p-8 md:col-span-3 md:p-10 lg:col-span-5">
            <div>
              <Clock className="mb-6 h-8 w-8 text-accent" strokeWidth={SW} />
              <h3 className="mb-4 font-heading text-xl font-bold uppercase text-background md:text-2xl">
                {isLv ? "Stabilitāte" : "Reliability"}
              </h3>
              <p className="leading-relaxed text-background/60">
                {isLv
                  ? "Precīzi izpildes termiņi un individuāla pieeja katram klientam. Mēs esam partneris, uz kuru var paļauties arī steidzamos projektos."
                  : "Precise deadlines and a tailored approach for every client. A partner you can rely on even on rush projects."}
              </p>
            </div>
            <div className="mt-8">
              <span className="inline-block border border-background/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-background">
                {isLv ? "100% termiņu izpilde" : "100% on-time delivery"}
              </span>
            </div>
          </div>

          {/* Tehnoloģijas */}
          <div className="flex flex-col justify-between bg-secondary p-8 md:col-span-3 md:p-10 lg:col-span-4">
            <div>
              <h3 className="mb-6 flex items-center gap-3 font-heading text-lg font-bold uppercase text-foreground md:text-xl">
                {isLv ? "Tehnoloģijas" : "Technologies"}
                <span className="h-1 w-6 bg-accent" />
              </h3>
              <ul className="space-y-4">
                {techs.map((t) => (
                  <li key={t.en} className="group flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="font-medium text-foreground transition-transform group-hover:translate-x-1">
                      {t[lang]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {isLv
                ? "Mēs piemeklējam labāko risinājumu Jūsu idejai."
                : "We match the best solution to your idea."}
            </p>
          </div>

          {/* Kvalitāte */}
          <div className="flex flex-col gap-8 border border-border bg-card p-8 md:col-span-6 md:flex-row md:gap-10 md:p-10 lg:col-span-8">
            <div className="flex-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-accent">
                <Sparkles className="h-6 w-6 text-accent" strokeWidth={SW} />
              </div>
              <h3 className="mb-4 font-heading text-xl font-bold uppercase text-card-foreground md:text-2xl">
                {isLv ? "Kvalitāte" : "Quality"}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {isLv
                  ? "Izmantojam tikai pasaules vadošo zīmolu tekstilu un industriālās klases krāsas, kas nodrošina krāsu noturību gadiem ilgi."
                  : "We use only world-leading textile brands and industrial-grade inks that keep colours vivid for years."}
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center border-l-4 border-border bg-muted p-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {isLv ? "Oficiālais dīleris" : "Official dealer"}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 opacity-70 transition-opacity hover:opacity-100">
                {brands.map((b) => (
                  <span
                    key={b}
                    className="font-heading text-base font-bold tracking-tighter text-foreground md:text-xl"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueCards;
