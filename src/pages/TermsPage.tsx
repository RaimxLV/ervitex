import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/i18n/LanguageContext";

type Section = { title: string; body: string };

const SECTIONS_LV: Section[] = [
  {
    title: "Vispārīgi noteikumi",
    body: 'Šī mājaslapa ir SIA "Ervitex" īpašums. Lietojot mājaslapu, jūs piekrītat šiem noteikumiem.',
  },
  {
    title: "Apdrukas risinājumi",
    body: 'SIA "Ervitex" nodrošina vairumtirdzniecības apģērbu un tekstildruku pakalpojumus. Cenas un pieejamība var mainīties bez iepriekšēja brīdinājuma.',
  },
  {
    title: "Cenu pieprasījumi",
    body: "Izmantojot mājaslapu iesniegtie cenu pieprasījumi nav saistoši līgumi. Galīgā cena tiek apstiprināta individuāli.",
  },
  {
    title: "Intelektuālais īpašums",
    body: 'Viss mājaslapas saturs (teksts, attēli, logotipi) ir SIA "Ervitex" īpašums un ir aizsargāts ar autortiesībām.',
  },
  {
    title: "Atbildības ierobežojums",
    body: 'SIA "Ervitex" neuzņemas atbildību par mājaslapas darbības pārtraukumiem vai tehniskām kļūdām.',
  },
  {
    title: "Piemērojamie normatīvie akti",
    body: "Šie noteikumi tiek regulēti saskaņā ar Latvijas Republikas spēkā esošiem normatīvajiem aktiem.",
  },
];

const SECTIONS_EN: Section[] = [
  {
    title: "General",
    body: 'This website is the property of SIA "Ervitex". By using this website, you agree to these terms.',
  },
  {
    title: "Printing services",
    body: 'SIA "Ervitex" provides wholesale clothing and textile printing services. Prices and availability may change without prior notice.',
  },
  {
    title: "Quote requests",
    body: "Quote requests submitted using this website are not binding contracts. Final pricing is confirmed individually.",
  },
  {
    title: "Intellectual property",
    body: 'All website content (text, images, logos) is the property of SIA "Ervitex" and is protected by copyright.',
  },
  {
    title: "Limitation of liability",
    body: 'SIA "Ervitex" is not liable for website downtime or technical errors.',
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws in force in the Republic of Latvia.",
  },
];

const TermsPage = () => {
  const { lang } = useLanguage();
  const sections = lang === "lv" ? SECTIONS_LV : SECTIONS_EN;

  return (
    <Layout>
      <PageIntro
        title={lang === "lv" ? "Lietošanas noteikumi" : "Terms of Service"}
        eyebrow={lang === "lv" ? "Juridiskā informācija" : "Legal information"}
      />

      <section className="container max-w-3xl py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
          {lang === "lv" ? "Spēkā no: 2025. gada 1. janvāra" : "Effective: January 1, 2025"}
        </p>

        <ol className="mt-10 space-y-0">
          {sections.map((section, i) => (
            <li
              key={section.title}
              className="group grid gap-3 border-t border-border/60 py-8 last:border-b sm:grid-cols-[3.5rem_1fr] sm:gap-6"
            >
              <span className="font-heading text-sm font-bold tracking-widest text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                  {section.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
};

export default TermsPage;
