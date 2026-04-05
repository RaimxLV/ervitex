import { motion } from "framer-motion";
import { Award, Zap, ShieldCheck, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.2;

const values = [
  {
    icon: Award,
    title: { lv: "Pieredze", en: "Experience" },
    desc: {
      lv: "Vairāk nekā 20 gadi nozarē — mēs saprotam tekstila un drukas specifiku līdz detaļām.",
      en: "Over 20 years in the industry — we understand textile and print specifics down to the finest detail.",
    },
  },
  {
    icon: Zap,
    title: { lv: "Tehnoloģijas", en: "Technologies" },
    desc: {
      lv: "Sietspiede, DTF, izšūšana un sublimācija. Mēs piemeklējam labāko risinājumu Jūsu idejai.",
      en: "Screen printing, DTF, embroidery, and sublimation. We match the best solution to your vision.",
    },
  },
  {
    icon: ShieldCheck,
    title: { lv: "Kvalitāte", en: "Quality" },
    desc: {
      lv: "Izmantojam tikai pasaules vadošo zīmolu tekstilu un industriālas klases krāsas.",
      en: "We use only world-leading brand textiles and industrial-grade inks.",
    },
  },
  {
    icon: CheckCircle,
    title: { lv: "Stabilitāte", en: "Reliability" },
    desc: {
      lv: "Precīzi izpildes termiņi un individuāla pieeja katram klientam.",
      en: "Precise deadlines and a tailored approach for every client.",
    },
  },
];

const ValueCards = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container">
        {/* Section header — single container animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase text-accent">
              {lang === "lv" ? "Kāpēc mēs" : "Why Us"}
            </span>
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="font-heading text-3xl font-bold uppercase text-foreground md:text-5xl">
            {lang === "lv" ? "Mūsu vērtības" : "Our Values"}
          </h2>
        </motion.div>

        {/* Cards — single container animation, no per-card animations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="group relative overflow-hidden border border-border bg-card p-6 transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/5"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />

                <Icon className="h-6 w-6 text-accent" strokeWidth={SW} />

                <h3 className="mt-5 font-heading text-sm font-bold uppercase text-card-foreground">
                  {v.title[lang]}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {v.desc[lang]}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueCards;
