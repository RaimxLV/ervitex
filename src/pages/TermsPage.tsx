import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const TermsPage = () => {
  const { lang } = useLanguage();

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold uppercase md:text-5xl">
            {lang === "lv" ? "Lietošanas noteikumi" : "Terms of Service"}
          </h1>
          <div className="mt-1 h-1 w-16 bg-accent" />
        </div>
      </section>

      <section className="container max-w-3xl py-16 md:py-24">
        <div className="prose prose-sm max-w-none text-foreground prose-headings:font-heading prose-headings:uppercase prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
          {lang === "lv" ? (
            <>
              <p className="text-xs text-muted-foreground/60">Spēkā no: 2025. gada 1. janvāra</p>
              <h2>1. Vispārīgi noteikumi</h2>
              <p>Šī mājaslapa pieder SIA "Ervitex". Lietojot mājaslapu, jūs piekrītat šiem noteikumiem.</p>
              <h2>2. Pakalpojumi</h2>
              <p>Ervitex nodrošina vairumtirdzniecības apģērbu un tekstildruku pakalpojumus. Cenas un pieejamība var mainīties bez iepriekšēja brīdinājuma.</p>
              <h2>3. Cenu pieprasījumi</h2>
              <p>Caur mājaslapu iesniegtie cenu pieprasījumi nav saistoši līgumi. Galīgā cena tiek apstiprināta individuāli.</p>
              <h2>4. Intelektuālais īpašums</h2>
              <p>Viss mājaslapas saturs (teksts, attēli, logotipi) ir SIA "Ervitex" īpašums un ir aizsargāts ar autortiesībām.</p>
              <h2>5. Atbildības ierobežojums</h2>
              <p>Ervitex neuzņemas atbildību par mājaslapas darbības pārtraukumiem vai tehniskām kļūdām.</p>
              <h2>6. Piemērojamie likumi</h2>
              <p>Šie noteikumi tiek regulēti saskaņā ar Latvijas Republikas likumdošanu.</p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground/60">Effective: January 1, 2025</p>
              <h2>1. General</h2>
              <p>This website is owned by SIA "Ervitex". By using this website, you agree to these terms.</p>
              <h2>2. Services</h2>
              <p>Ervitex provides wholesale clothing and textile printing services. Prices and availability may change without prior notice.</p>
              <h2>3. Quote Requests</h2>
              <p>Quote requests submitted through this website are not binding contracts. Final pricing is confirmed individually.</p>
              <h2>4. Intellectual Property</h2>
              <p>All website content (text, images, logos) is the property of SIA "Ervitex" and is protected by copyright.</p>
              <h2>5. Limitation of Liability</h2>
              <p>Ervitex is not liable for website downtime or technical errors.</p>
              <h2>6. Governing Law</h2>
              <p>These terms are governed by the laws of the Republic of Latvia.</p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TermsPage;
