import { motion } from "framer-motion";
import { Target, Users, Award, Factory } from "lucide-react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide md:text-5xl">{t("about.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/60">{t("about.heroText")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">{t("about.storyTitle")}</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.story1")}</p>
              <p>{t("about.story2")}</p>
              <p>{t("about.story3")}</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" alt="Textile production" className="rounded-sm" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
          </motion.div>
        </div>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.h2 {...fadeUp} className="text-center font-heading text-2xl font-black uppercase tracking-wide text-foreground">
            {t("about.valuesTitle")}
          </motion.h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Target className="h-8 w-8" />, title: t("about.precision"), desc: t("about.precisionDesc") },
              { icon: <Users className="h-8 w-8" />, title: t("about.partnership"), desc: t("about.partnershipDesc") },
              { icon: <Award className="h-8 w-8" />, title: t("about.quality"), desc: t("about.qualityDesc") },
              { icon: <Factory className="h-8 w-8" />, title: t("about.capacity"), desc: t("about.capacityDesc") },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-accent/10 text-accent">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-heading text-sm font-bold uppercase tracking-wider text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-8 text-center sm:grid-cols-4">
          {[
            { num: "20+", label: t("stats.years") },
            { num: "500+", label: t("stats.clients") },
            { num: "1M+", label: t("stats.items") },
            { num: "50+", label: t("stats.products") },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <p className="font-heading text-4xl font-black text-accent">{stat.num}</p>
              <p className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
