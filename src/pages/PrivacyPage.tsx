import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const PrivacyPage = () => {
  const { lang } = useLanguage();

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold uppercase md:text-5xl">
            {lang === "lv" ? "Privātuma politika" : "Privacy Policy"}
          </h1>
          <div className="mt-1 h-1 w-16 bg-accent" />
        </div>
      </section>

      <section className="container max-w-3xl py-16 md:py-24">
        <div className="prose prose-sm max-w-none text-foreground prose-headings:font-heading prose-headings:uppercase prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
          {lang === "lv" ? (
            <>
              <p className="text-xs text-muted-foreground/60">Spēkā no: 2025. gada 1. janvāra</p>
              <h2>1. Pārzinis</h2>
              <p>SIA "Ervitex", reģ. nr. LV40002074377, Braslas iela 29, Rīga, LV-1084, Latvija. E-pasts: <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a></p>
              <h2>2. Kādus datus mēs apkopojam</h2>
              <ul>
                <li><strong>Kontaktinformācija</strong> — vārds, e-pasts, tālrunis, uzņēmums, ko jūs norādāt saziņas vai cenu pieprasījumu formās.</li>
                <li><strong>Tehniskie dati</strong> — IP adrese, pārlūkprogrammas tips, apmeklējuma laiks (tīmekļa servera žurnāli).</li>
                <li><strong>Sīkdatnes</strong> — tikai tehniski nepieciešamās sīkdatnes sesijas uzturēšanai.</li>
              </ul>
              <h2>3. Datu apstrādes mērķi</h2>
              <ul>
                <li>Atbildēt uz jūsu pieprasījumiem un piedāvāt cenas.</li>
                <li>Nodrošināt mājaslapas tehnisku darbību un drošību.</li>
              </ul>
              <h2>4. Datu glabāšana</h2>
              <p>Kontaktformu dati tiek glabāti līdz pieprasījuma izpildei, bet ne ilgāk par 2 gadiem. Tehniskie žurnāli tiek dzēsti pēc 90 dienām.</p>
              <h2>5. Jūsu tiesības</h2>
              <p>Jums ir tiesības pieprasīt piekļuvi saviem datiem, labot tos, dzēst vai ierobežot to apstrādi, rakstot uz <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a>.</p>
              <h2>6. Kontakti</h2>
              <p>Jautājumu gadījumā sazinieties ar mums: <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a> vai +371 29475227.</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground/60">Effective: January 1, 2025</p>
              <h2>1. Data Controller</h2>
              <p>SIA "Ervitex", reg. no. LV40002074377, Braslas street 29, Riga, LV-1084, Latvia. Email: <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a></p>
              <h2>2. Data We Collect</h2>
              <ul>
                <li><strong>Contact information</strong> — name, email, phone, company provided through contact or quote request forms.</li>
                <li><strong>Technical data</strong> — IP address, browser type, visit time (web server logs).</li>
                <li><strong>Cookies</strong> — only technically necessary cookies for session management.</li>
              </ul>
              <h2>3. Purpose of Processing</h2>
              <ul>
                <li>Respond to your inquiries and provide quotes.</li>
                <li>Ensure technical operation and security of the website.</li>
              </ul>
              <h2>4. Data Retention</h2>
              <p>Contact form data is stored until the request is fulfilled, but no longer than 2 years. Technical logs are deleted after 90 days.</p>
              <h2>5. Your Rights</h2>
              <p>You have the right to access, correct, delete, or restrict processing of your data by writing to <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a>.</p>
              <h2>6. Contact</h2>
              <p>For questions, contact us: <a href="mailto:birojs@ervitex.lv" className="text-accent hover:text-accent/80">birojs@ervitex.lv</a> or +371 29475227.</p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPage;
