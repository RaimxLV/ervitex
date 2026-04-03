import { motion } from "framer-motion";
import { Award, Zap, ShieldCheck, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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
      lv: "Precīzi izpildes termiņi un individuāla apkalpošana katram klientam.",
      en: "Precise deadlines and personalized service for every client.",
    },
  },
];

const ValueCards = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-muted py-20 md:py-28">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
              {lang === "lv" ? "Kāpēc mēs" : "Why Us"}
            </span>
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            {lang === "lv" ? "Mūsu vērtības" : "Our Values"}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-sm border border-border bg-card p-6 transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/5"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 h-[3px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="mt-5 font-heading text-xs font-bold uppercase tracking-[0.2em] text-card-foreground">
                  {v.title[lang]}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {v.desc[lang]}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueCards;
