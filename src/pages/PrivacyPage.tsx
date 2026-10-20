import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/i18n/LanguageContext";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: { lead?: string; text: string }[];
  afterBullets?: string[];
};

const SECTIONS_LV: Section[] = [
  {
    title: "Pārzinis",
    paragraphs: ['SIA "Ervitex", reģ. nr. 40002074377, Braslas iela 29, Rīga, LV-1084, Latvija. E-pasts: birojs@ervitex.lv'],
  },
  {
    title: "Kādus datus mēs apkopojam",
    bullets: [
      { lead: "Kontaktinformācija", text: "vārds, e-pasts, tālrunis, uzņēmums, ko jūs norādāt saziņas vai cenu pieprasījumu formās." },
      { lead: "Tehniskie dati", text: "IP adrese, pārlūkprogrammas tips, apmeklējuma laiks (tīmekļa servera žurnāli)." },
      { id: "cookies", lead: "Sīkdatnes", text: "tikai tehniski nepieciešamās sīkdatnes sesijas uzturēšanai." },
    ],
  },
  {
    title: "Datu apstrādes mērķi",
    paragraphs: [
      "Nodrošināt uzņēmuma rīcībā nonākušo fizisko personu datu aizsardzību un izmantošanu atbilstoši spēkā esošiem normatīvajiem aktiem un sniegt fiziskajai personai – datu subjektam – informāciju par personas datu apstrādes nolūku, apjomu, aizsardzību un apstrādes termiņu datu iegūšanas laikā un apstrādājot datu subjekta personas datus.",
    ],
  },
  {
    title: "Darbības apjoms",
    paragraphs: [
      'Privātuma politiku piemēro privātuma un personas datu aizsardzības nodrošināšanai attiecībā uz:',
    ],
    bullets: [
      { text: 'fiziskajām personām – sadarbības partneriem, darbiniekiem, kā arī trešajām personām, kuras saistībā ar pakalpojumu sniegšanu saņem vai nodod SIA "Ervitex" jebkādu informāciju (tajā skaitā kontaktpersonas, maksātāji u.c.);' },
      { text: 'SIA "Ervitex" uzturētās mājaslapas lietotājiem.' },
    ],
    afterBullets: [
      'SIA "Ervitex" rūpējas par personu privātumu un personas datu aizsardzību, ievēro personu tiesības uz personas datu apstrādes likumību saskaņā ar Eiropas Parlamenta un Padomes 27.04.2016. Regulu 2016/679 par fizisko personu aizsardzību attiecībā uz personas datu apstrādi un šādu datu brīvu apriti un citiem normatīvajiem aktiem privātuma un datu apstrādes jomā.',
      "Privātuma politika attiecināma uz datu apstrādi neatkarīgi no tā, kādā formā dati iesniegti, iegūti un tiek apstrādāti.",
    ],
  },
  {
    title: "Datu glabāšana",
    paragraphs: [
      "Kontaktformu dati tiek glabāti līdz pieprasījuma izpildei, bet ne ilgāk par 2 gadiem. Tehniskie žurnāli tiek dzēsti pēc 90 dienām.",
    ],
  },
  {
    title: "Jūsu tiesības",
    paragraphs: [
      "Jums ir tiesības pieprasīt piekļuvi saviem datiem, labot tos, pieprasīt tos dzēst vai ierobežot to apstrādi, rakstot uz birojs@ervitex.lv.",
    ],
  },
  {
    title: "Kontakti",
    paragraphs: ["Jautājumu gadījumā sazinieties ar mums: birojs@ervitex.lv vai +371 29475227."],
  },
];

const SECTIONS_EN: Section[] = [
  {
    title: "Data Controller",
    paragraphs: ['SIA "Ervitex", reg. no. 40002074377, Braslas street 29, Riga, LV-1084, Latvia. Email: birojs@ervitex.lv'],
  },
  {
    title: "Data We Collect",
    bullets: [
      { lead: "Contact information", text: "name, email, phone, company provided through contact or quote request forms." },
      { lead: "Technical data", text: "IP address, browser type, visit time (web server logs)." },
      { id: "cookies", lead: "Cookies", text: "only technically necessary cookies for session management." },
    ],
  },
  {
    title: "Purpose of Processing",
    paragraphs: [
      "To ensure the protection and use of personal data received by the company in accordance with the laws in force, and to inform the data subject about the purpose, scope, protection and retention period of personal data processing when the data is obtained and processed.",
    ],
  },
  {
    title: "Scope",
    paragraphs: ["This privacy policy applies to privacy and personal data protection in relation to:"],
    bullets: [
      { text: 'individuals – cooperation partners, employees, and third parties who receive or transfer any information to SIA "Ervitex" in connection with the provision of services (including contact persons, payers, etc.);' },
      { text: 'users of the website maintained by SIA "Ervitex".' },
    ],
    afterBullets: [
      'SIA "Ervitex" cares for personal privacy and data protection in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and other laws in the field of privacy and data processing.',
      "This privacy policy applies to data processing regardless of the form in which the data is submitted, obtained or processed.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "Contact form data is stored until the request is fulfilled, but no longer than 2 years. Technical logs are deleted after 90 days.",
    ],
  },
  {
    title: "Your Rights",
    paragraphs: [
      "You have the right to request access to your data, correct it, request its deletion or restrict its processing by writing to birojs@ervitex.lv.",
    ],
  },
  {
    title: "Contact",
    paragraphs: ["For questions, contact us: birojs@ervitex.lv or +371 29475227."],
  },
];

const EmailText = ({ text }: { text: string }) => {
  const parts = text.split("birojs@ervitex.lv");
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <a href="mailto:birojs@ervitex.lv" className="text-accent transition-colors hover:text-accent/80">
        birojs@ervitex.lv
      </a>
      {parts.slice(1).join("birojs@ervitex.lv")}
    </>
  );
};

const PrivacyPage = () => {
  const { lang } = useLanguage();
  const sections = lang === "lv" ? SECTIONS_LV : SECTIONS_EN;

  return (
    <Layout>
      <PageIntro
        title={lang === "lv" ? "Privātuma politika" : "Privacy Policy"}
        eyebrow={lang === "lv" ? "Juridiskā informācija" : "Legal information"}
      />

      <section className="container max-w-3xl py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
          {lang === "lv" ? "Spēkā no: 2025. gada 1. janvāra" : "Effective: January 1, 2025"}
        </p>

        <ol className="mt-10">
          {sections.map((section, i) => (
            <li
              key={section.title}
              className="grid gap-3 border-t border-border/60 py-8 last:border-b sm:grid-cols-[3.5rem_1fr] sm:gap-6"
            >
              <span className="font-heading text-sm font-bold tracking-widest text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                  {section.title}
                </h2>
                {section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-muted-foreground">
                    <EmailText text={p} />
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground marker:text-accent">
                    {section.bullets.map((b) => (
                      <li key={b.text.slice(0, 32)}>
                        {b.lead && <strong className="text-foreground">{b.lead}</strong>}
                        {b.lead ? " — " : ""}
                        {b.text}
                      </li>
                    ))}
                  </ul>
                )}
                {section.afterBullets?.map((p) => (
                  <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-muted-foreground">
                    <EmailText text={p} />
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
