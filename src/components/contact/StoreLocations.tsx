import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Store as StoreIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import origoPhoto from "@/assets/stores/Origo.jpg";
import dominaPhoto from "@/assets/stores/Domina.jpg";
import alfaPhoto from "@/assets/stores/Alfa.jpg";
import acropolePhoto from "@/assets/stores/Acropole.jpg";

const stores = [
  {
    name: "T/C ORIGO",
    address: "Stacijas laukums 2, Rīga LV-1050",
    email: "origo@t-bode.lv",
    phone: "+371 28603383",
    image: origoPhoto,
  },
  {
    name: "T/C DOMINA",
    address: "Ieriķu iela 3, Rīga LV-1084",
    email: "domina@t-bode.lv",
    phone: "+371 67130030",
    image: dominaPhoto,
  },
  {
    name: "AKROPOLE RĪGA | ALFA",
    address: "Brīvības gatve 372, Rīga LV-1006",
    email: "alfa@t-bode.lv",
    phone: "+371 25486124",
    image: alfaPhoto,
  },
  {
    name: "T/C AKROPOLE",
    address: "Maskavas iela 257, Rīga LV-1019",
    email: "akropole@t-bode.lv",
    phone: "+371 20219844",
    image: acropolePhoto,
  },
];

const StoreLocations = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-background py-10 md:py-14">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="font-heading text-[10px] font-bold uppercase tracking-widest text-accent/80">
            T-Bode
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold uppercase text-foreground/90">
            {lang === "lv" ? "Mūsu Veikali" : "Our Stores"}
          </h2>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            {lang === "lv"
              ? "T-Shirt Store By T-Bode mazumtirdzniecības vietas Rīgā"
              : "T-Shirt Store By T-Bode retail locations in Riga"}
          </p>
        </motion.div>

        {/* T-Bode birojs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 flex flex-col gap-4 border border-accent/30 bg-card p-5 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <StoreIcon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase text-foreground">
                T-Bode {lang === "lv" ? "birojs" : "Office"}
              </h3>
              <p className="mt-1 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                Braslas iela 29, Rīga, LV-1084
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <a
              href="mailto:info@t-bode.lv"
              className="flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-3 w-3 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
              info@t-bode.lv
            </a>
            <a
              href="tel:+37129475227"
              className="flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-accent"
            >
              <Phone className="h-3 w-3 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
              {lang === "lv" ? "Tālr." : "Tel."}: +371 29475227
            </a>
          </div>
        </motion.div>

        {/* Store cards grid */}

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {stores.map((store, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={store.image}
                  alt={`${store.name} T-Bode veikals`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <StoreIcon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
                  <h3 className="font-heading text-xs font-bold uppercase text-foreground">
                    {store.name}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground/60" strokeWidth={1.5} />
                    <span>{store.address}</span>
                  </div>
                  <a
                    href={`mailto:${store.email}`}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                    {store.email}
                  </a>
                  <a
                    href={`tel:${store.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Phone className="h-3 w-3 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                    {store.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreLocations;
