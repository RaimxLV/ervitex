import { MapPin, Mail, Phone, Building2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SectionHeading from "./SectionHeading";
import origoPhoto from "@/assets/stores/Origo.webp";
import dominaPhoto from "@/assets/stores/Domina.webp";
import alfaPhoto from "@/assets/stores/Alfa.webp";
import acropolePhoto from "@/assets/stores/Acropole.webp";

const stores = [
  { name: "Akropole Alfa", street: "Brīvības gatve 372", zip: "Rīga, LV-1006", email: "alfa@t-bode.lv", phone: "+371 25486124", image: alfaPhoto },
  { name: "T/C Origo", street: "Stacijas laukums 2", zip: "Rīga, LV-1050", email: "origo@t-bode.lv", phone: "+371 28603383", image: origoPhoto },
  { name: "T/C Domina", street: "Ieriķu iela 3", zip: "Rīga, LV-1084", email: "domina@t-bode.lv", phone: "+371 67130030", image: dominaPhoto },
  { name: "T/C Akropole", street: "Maskavas iela 257", zip: "Rīga, LV-1019", email: "akropole@t-bode.lv", phone: "+371 20219844", image: acropolePhoto },
];

const linkCls = "flex items-center gap-2.5 text-sm text-foreground/80 transition-colors hover:text-accent";
const iconCls = "h-4 w-4 shrink-0 text-accent";

const StoreLocations = () => {
  const { lang } = useLanguage();
  const tel = lang === "lv" ? "Tālr." : "Tel.";

  return (
    <section className="section-dark border-t border-border bg-background py-12 md:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="T-Bode"
          title={lang === "lv" ? "T-Bode birojs un veikali" : "T-Bode office and stores"}
          subtitle={lang === "lv" ? "\n" : "T-Shirt Store by T-Bode retail in Riga"}
        />

        {/* Office */}
        <div className="mb-5 grid gap-4 border border-border bg-card p-5 sm:mb-6 sm:grid-cols-[auto_1fr_auto] sm:items-center md:p-7">
          <div className="flex h-12 w-12 items-center justify-center bg-foreground text-background">
            <Building2 className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold uppercase text-foreground">
              {lang === "lv" ? "T-Bode birojs" : "T-Bode office"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Braslas iela 29, Rīga, LV-1084</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <a href="mailto:info@t-bode.lv" className={linkCls}><Mail className={iconCls} strokeWidth={1.5} />info@t-bode.lv</a>
            <a href="tel:+37129475227" className={linkCls}><Phone className={iconCls} strokeWidth={1.5} />{tel} +371 29475227</a>
          </div>
        </div>

        {/* Stores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {stores.map((s) => (
            <article key={s.email} className="group flex flex-col border border-border bg-card transition-colors hover:border-accent/50">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={s.image} alt={`T-Bode ${s.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
              <div className="flex grow flex-col p-4 md:p-5">
                <h3 className="font-heading text-base font-bold uppercase text-foreground">{s.name}</h3>
                <p className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                  <MapPin className={`${iconCls} mt-0.5`} strokeWidth={1.5} />
                  <span>{s.street}<br />{s.zip}</span>
                </p>
                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <a href={`mailto:${s.email}`} className={linkCls}><Mail className={iconCls} strokeWidth={1.5} />{s.email}</a>
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className={linkCls}><Phone className={iconCls} strokeWidth={1.5} />{s.phone}</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreLocations;
