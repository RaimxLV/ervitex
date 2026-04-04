import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Users, Award, Factory, Mail, Phone, X } from "lucide-react";
import ervitexStore from "@/assets/ervitex-store.jpg";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import lauraDaukstePhoto from "@/assets/team/laura-daukste.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const teamMembers = [
  {
    name: "Vilnis Lācis",
    title: { lv: "Valdes priekšsēdētājs", en: "Chairman of the Board" },
    email: "vilnis@ervitex.lv",
    phone: "+371 67543384",
    phoneLabel: { lv: "Tel", en: "Tel" },
    photo: null as string | null,
  },
  {
    name: "Ēriks Lācis",
    title: { lv: "Tirdzniecības direktors", en: "Sales Director" },
    email: "eriks@ervitex.lv",
    phone: "+371 29395600",
    phoneLabel: { lv: "Mob", en: "Mob" },
    photo: null as string | null,
  },
  {
    name: "Laura Daukšte",
    title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" },
    email: "laura@ervitex.lv",
    phone: "+371 26164635",
    phoneLabel: { lv: "Mob", en: "Mob" },
    photo: lauraDaukstePhoto,
  },
  {
    name: "Ilona Romanovska",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "ilona@ervitex.lv",
    phone: "+371 29494626",
    phoneLabel: { lv: "Mob", en: "Mob" },
    photo: null as string | null,
  },
  {
    name: "Santa Zvaigzne",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "santa.k@ervitex.lv",
    phone: "67436899",
    phoneLabel: { lv: "Tel", en: "Tel" },
    photo: null as string | null,
  },
  {
    name: "Justīne Strunka",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "justine@ervitex.lv",
    phone: "29725412",
    phoneLabel: { lv: "Mob", en: "Mob" },
    photo: null as string | null,
  },
  {
    name: "Evita Ņesterova",
    title: { lv: "Mazumtirdzniecība", en: "Retail" },
    email: "evita@ervitex.lv",
    phone: "29475227",
    phoneLabel: { lv: "Tel", en: "Tel" },
    photo: null as string | null,
  },
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
            <img src={ervitexStore} alt="Ervitex veikals" className="rounded-sm" />
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

      {/* Team Section */}
      <section className="container py-16 md:py-24">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">{t("team.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("team.subtitle")}</p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group rounded-sm border border-border bg-card p-6 transition-all hover:border-accent/40 hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                {/* Photo or Initials Fallback */}
                <div
                  className={`relative h-24 w-24 overflow-hidden rounded-full border-2 border-muted ${member.photo ? "cursor-pointer" : ""}`}
                  onClick={() => openLightbox(member)}
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent/10 text-accent font-heading text-xl font-bold">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs text-accent font-medium">{member.title[lang]}</p>
                <div className="mt-4 w-full space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </a>
                  <a
                    href={`tel:${member.phone.replace(/\s/g, "")}`}
                    className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {member.phoneLabel[lang]}: {member.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-none [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>{selectedMember?.name}</DialogTitle>
          </VisuallyHidden>
          {selectedMember?.photo && (
            <div className="relative">
              <img
                src={selectedMember.photo}
                alt={selectedMember.name}
                className="w-full rounded-lg object-cover"
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                  {selectedMember.name}
                </p>
                <p className="text-xs text-white/80">{selectedMember.title[lang]}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <section className="bg-muted py-16 md:py-24">
        <div className="container">
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
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
