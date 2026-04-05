import { motion } from "framer-motion";
import { Target, Users, Award, Factory } from "lucide-react";
import ervitexStore from "@/assets/ervitex-store.jpg";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.2;

const teamMembers = [
  { name: "Vilnis Lācis", title: { lv: "Valdes priekšsēdētājs", en: "Chairman of the Board" }, email: "vilnis@ervitex.lv", phone: "+371 67543384", phoneLabel: { lv: "Tel", en: "Tel" }, photo: vilnisLacisPhoto },
  { name: "Ēriks Lācis", title: { lv: "Tirdzniecības direktors", en: "Sales Director" }, email: "eriks@ervitex.lv", phone: "+371 29395600", phoneLabel: { lv: "Mob", en: "Mob" }, photo: eriksLacisPhoto },
  { name: "Laura Daukšte", title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" }, email: "laura@ervitex.lv", phone: "+371 26164635", phoneLabel: { lv: "Mob", en: "Mob" }, photo: lauraDaukstePhoto },
  { name: "Ilona Romanovska", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "ilona@ervitex.lv", phone: "+371 29494626", phoneLabel: { lv: "Mob", en: "Mob" }, photo: ilonaRomanovskaPhoto },
  { name: "Santa Zvaigzne", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "santa.k@ervitex.lv", phone: "67436899", phoneLabel: { lv: "Tel", en: "Tel" }, photo: santaZvaigznePhoto },
  { name: "Justīne Strunka", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "justine@ervitex.lv", phone: "29725412", phoneLabel: { lv: "Mob", en: "Mob" }, photo: justineStrunkaPhoto },
  { name: "Evita Ņesterova", title: { lv: "Mazumtirdzniecība", en: "Retail" }, email: "evita@ervitex.lv", phone: "29475227", phoneLabel: { lv: "Tel", en: "Tel" }, photo: null as string | null },
];

const AboutPage = () => {
  const { t, lang } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);

  const openLightbox = (member: typeof teamMembers[0]) => {
    if (member.photo) {
      setSelectedMember(member);
      setLightboxOpen(true);
    }
  };

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-bold uppercase md:text-5xl">{t("about.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/60">{t("about.heroText")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{t("about.storyTitle")}</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.story1")}</p>
              <p>{t("about.story2")}</p>
              <p>{t("about.story3")}</p>
              <p className="font-medium text-foreground/80">
                {lang === "lv"
                  ? "Vairāk nekā 20 gadu pieredze, 3000+ produktu katalogā un 4 augstas veiktspējas drukas tehnoloģijas — sietspiede, DTF, izšūšana un sublimācija."
                  : "Over 20 years of experience, 3,000+ products in our catalog, and 4 high-performance printing technologies — screen printing, DTF, embroidery, and sublimation."}
              </p>
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
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center font-heading text-2xl font-bold uppercase text-foreground"
          >
            {t("about.valuesTitle")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: <Target className="h-6 w-6" strokeWidth={SW} />, title: t("about.precision"), desc: t("about.precisionDesc") },
              { icon: <Users className="h-6 w-6" strokeWidth={SW} />, title: t("about.partnership"), desc: t("about.partnershipDesc") },
              { icon: <Award className="h-6 w-6" strokeWidth={SW} />, title: t("about.quality"), desc: t("about.qualityDesc") },
              { icon: <Factory className="h-6 w-6" strokeWidth={SW} />, title: t("about.capacity"), desc: t("about.capacityDesc") },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto text-accent">{item.icon}</div>
                <h3 className="mt-4 font-heading text-sm font-bold uppercase text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 text-center sm:grid-cols-4"
          >
            {[
              { num: "20+", label: t("stats.years") },
              { num: "500+", label: t("stats.clients") },
              { num: "3000+", label: lang === "lv" ? "Produkti katalogā" : "Products in Catalog" },
              { num: "4", label: lang === "lv" ? "Drukas tehnoloģijas" : "Printing Technologies" },
            ].map((stat, i) => (
              <div key={i}>
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
