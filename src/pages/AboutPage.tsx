import { motion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, Leaf, Printer, ShieldCheck, Shirt, UsersRound } from "lucide-react";
import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import AbandonedStoryScene from "@/components/about/AbandonedStoryScene";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.5;

const AboutPage = () => {
  const { t, lang } = useLanguage();

  return (
    <Layout>
      <PageIntro
        title={t("about.title")}
        subtitle={t("about.heroText")}
        eyebrow={lang === "lv" ? "Uzņēmuma profils" : "Company profile"}
      />

      <AbandonedStoryScene>
        <div className="container pb-20 pt-20 text-foreground md:pb-24 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground [text-wrap:balance] md:text-6xl">
              {t("about.storyHeadline")}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/70 [text-wrap:pretty]">
              {t("about.story1")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {[
              { icon: Shirt, title: t("about.highlight1Title"), desc: t("about.highlight1Desc"), tile: "bg-glow-sky/15", accent: "text-glow-sky", tileHover: "group-hover:bg-glow-sky/25" },
              { icon: UsersRound, title: t("about.highlight2Title"), desc: t("about.highlight2Desc"), tile: "bg-glow-teal/15", accent: "text-glow-teal", tileHover: "group-hover:bg-glow-teal/25" },
              { icon: Leaf, title: t("about.highlight3Title"), desc: t("about.highlight3Desc"), tile: "bg-glow-lime/15", accent: "text-glow-lime", tileHover: "group-hover:bg-glow-lime/25" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center border border-foreground/10 bg-background/70 p-10 text-center backdrop-blur-md transition-colors duration-300 hover:border-foreground/25 hover:bg-background/90"
              >
                <div className={`flex h-20 w-20 items-center justify-center rounded-md transition-colors duration-300 ${item.tile} ${item.accent} ${item.tileHover}`}>
                  <item.icon className="h-10 w-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={SW} />
                </div>
                <h3 className="mt-7 font-heading text-xl font-semibold text-foreground [text-wrap:balance]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-foreground/60 [text-wrap:pretty]">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-16 grid gap-6 md:grid-cols-2"
          >
            <div className="border border-foreground/10 border-l-2 border-l-foreground/45 bg-background/70 p-8 backdrop-blur-md md:p-10">
              <h3 className="font-heading text-2xl font-bold text-foreground [text-wrap:balance]">
                {t("about.blockStabilityTitle")}
              </h3>
              <p className="mt-5 font-light leading-relaxed text-foreground/75 [text-wrap:pretty]">
                {t("about.blockStabilityBody1")}
              </p>
            </div>
            <div className="border border-foreground/10 border-l-2 border-l-foreground/45 bg-background/70 p-8 backdrop-blur-md md:p-10">
              <h3 className="font-heading text-2xl font-bold text-foreground [text-wrap:balance]">
                {t("about.blockCapacityTitle")}
              </h3>
              <p className="mt-5 font-light leading-relaxed text-foreground/75 [text-wrap:pretty]">
                {t("about.blockCapacityBody1")}
              </p>
            </div>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="about-quote-block w-full px-6 py-16 text-center md:py-20"
        >
          <h3 className="font-heading text-2xl font-light italic tracking-wide text-primary-foreground/90 md:text-4xl">
            {t("about.blockPartnerTitle")}
          </h3>
          <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-primary-foreground/70 [text-wrap:pretty]">
            {t("about.story3")}
          </p>
        </motion.div>
      </AbandonedStoryScene>

      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl"
          >
            {t("about.valuesTitle")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: BriefcaseBusiness, title: t("about.precision"), desc: t("about.precisionDesc"), surface: "bg-value-blue-soft", accent: "text-value-blue", tileHover: "group-hover:bg-value-blue/15" },
              { icon: Printer, title: t("about.partnership"), desc: t("about.partnershipDesc"), surface: "bg-value-cyan-soft", accent: "text-value-cyan", tileHover: "group-hover:bg-value-cyan/15" },
              { icon: BadgeCheck, title: t("about.quality"), desc: t("about.qualityDesc"), surface: "bg-value-emerald-soft", accent: "text-value-emerald", tileHover: "group-hover:bg-value-emerald/15" },
              { icon: ShieldCheck, title: t("about.capacity"), desc: t("about.capacityDesc"), surface: "bg-value-slate-soft", accent: "text-value-slate", tileHover: "group-hover:bg-value-slate/15" },
            ].map((item, i) => {
              const [lead, detail] = item.desc.split("\n\n");

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: i * 0.09 }}
                  whileHover={{ y: -6 }}
                  className="group flex min-h-[390px] flex-col border border-border bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md transition-colors duration-300 ${item.surface} ${item.accent} ${item.tileHover}`}>
                    <item.icon className="h-6 w-6" strokeWidth={SW} />
                  </div>
                  <h3 className="mt-7 font-heading text-lg font-bold uppercase text-foreground">{item.title}</h3>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-foreground/80">{lead}</p>
                  {detail && <p className="mt-3 text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]">{detail}</p>}
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
