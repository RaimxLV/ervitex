import { motion } from "framer-motion";
import { BadgeCheck, Cog, Crosshair, Handshake } from "lucide-react";
import ervitexStore from "@/assets/ervitex-store.jpg";
import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.2;

const AboutPage = () => {
  const { t, lang } = useLanguage();

  return (
    <Layout>
      <PageIntro
        title={t("about.title")}
        subtitle={t("about.heroText")}
        eyebrow={lang === "lv" ? "Uzņēmuma profils" : "Company profile"}
      />

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
              {t("about.storyKicker")}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase text-foreground md:text-3xl [text-wrap:balance]">
              {t("about.storyHeadline")}
            </h2>
            <div className="mt-6 max-w-prose space-y-4 leading-relaxed text-muted-foreground [text-wrap:pretty]">
              <p className="text-lg text-foreground/80">{t("about.story1")}</p>
              <p>{t("about.story2")}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img src={ervitexStore} alt="Ervitex veikals" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-accent" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { title: t("about.highlight1Title"), desc: t("about.highlight1Desc") },
            { title: t("about.highlight2Title"), desc: t("about.highlight2Desc") },
            { title: t("about.highlight3Title"), desc: t("about.highlight3Desc") },
            { title: t("about.highlight4Title"), desc: t("about.highlight4Desc") },
          ].map((item, i) => (
            <div key={i} className="bg-background p-6">
              <div className="h-1 w-8 bg-accent" />
              <h3 className="mt-4 font-heading text-sm font-bold uppercase text-foreground [text-wrap:balance]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid gap-12 md:grid-cols-2"
        >
          <article>
            <h3 className="font-heading text-xl font-bold uppercase text-foreground [text-wrap:balance]">
              {t("about.blockStabilityTitle")}
            </h3>
            <div className="mt-4 space-y-4 max-w-prose leading-relaxed text-muted-foreground [text-wrap:pretty]">
              <p>{t("about.blockStabilityBody1")}</p>
              <p>{t("about.blockStabilityBody2")}</p>
            </div>
          </article>
          <article>
            <h3 className="font-heading text-xl font-bold uppercase text-foreground [text-wrap:balance]">
              {t("about.blockCapacityTitle")}
            </h3>
            <div className="mt-4 space-y-4 max-w-prose leading-relaxed text-muted-foreground [text-wrap:pretty]">
              <p>{t("about.blockCapacityBody1")}</p>
              <p>{t("about.blockCapacityBody2")}</p>
            </div>
          </article>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 border-l-4 border-accent bg-muted p-8 md:p-10"
        >
          <h3 className="font-heading text-xl font-bold uppercase text-foreground [text-wrap:balance]">
            {t("about.blockPartnerTitle")}
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/80 [text-wrap:pretty]">
            {t("about.story3")}
          </p>
        </motion.div>
      </section>


      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl font-bold uppercase text-foreground md:text-4xl"
          >
            {t("about.valuesTitle")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-4 max-w-xl leading-relaxed text-muted-foreground"
          >
            {lang === "lv"
              ? "Precīzs darbs, uzticamas partnerības un pārbaudāma izvēle vairāk nekā 6000 produktu modeļu katalogā."
              : "Precise work, trusted partnerships and a verified selection of more than 6,000 product models."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Crosshair, motionClass: "motion-safe:group-hover:animate-pulse", title: t("about.precision"), desc: t("about.precisionDesc"), stat: "01" },
              { icon: Handshake, motionClass: "group-hover:-translate-y-1", title: t("about.partnership"), desc: t("about.partnershipDesc"), stat: "02" },
              { icon: BadgeCheck, motionClass: "group-hover:-rotate-6 group-hover:scale-110", title: t("about.quality"), desc: t("about.qualityDesc"), stat: "03" },
              { icon: Cog, motionClass: "motion-safe:group-hover:animate-[spin_3s_linear_infinite]", title: t("about.capacity"), desc: t("about.capacityDesc"), stat: "6000+" },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                whileHover={{ y: -4 }}
                className="group relative min-h-[260px] overflow-hidden bg-background p-7 transition-colors duration-500 hover:bg-card"
              >
                <span className="absolute right-5 top-3 font-heading text-5xl font-black text-foreground/[0.045]">{item.stat}</span>
                <div className="relative flex h-11 w-11 items-center justify-center border border-border bg-muted text-accent transition-colors duration-300 group-hover:border-accent/50">
                  <item.icon className={`h-6 w-6 transition-transform duration-500 ${item.motionClass}`} strokeWidth={SW} />
                </div>
                <h3 className="mt-12 font-heading text-sm font-bold uppercase text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
              </motion.article>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 grid gap-px border border-border bg-border text-center sm:grid-cols-4"
          >
            {[
              { num: "20+", label: t("stats.years") },
              { num: "500+", label: t("stats.clients") },
              { num: "6000+", label: lang === "lv" ? "Produktu modeļi" : "Product Models" },
              { num: "4", label: lang === "lv" ? "Drukas tehnoloģijas" : "Printing Technologies" },
            ].map((stat, i) => (
              <div key={i} className="bg-background px-4 py-7">
                <p className="font-heading text-4xl font-bold text-accent">{stat.num}</p>
                <p className="mt-1 text-sm text-muted-foreground uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
