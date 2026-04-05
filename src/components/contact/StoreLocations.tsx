import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Store as StoreIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const stores = [
  {
    name: "T/C ORIGO",
    address: "Stacijas laukums 2, Rīga LV-1050",
    email: "origo@t-bode.lv",
    phone: "+371 28603383",
  },
  {
    name: "T/C DOMINA",
    address: "Ieriķu iela 3, Rīga LV-1084",
    email: "domina@t-bode.lv",
    phone: "+371 67130030",
  },
  {
    name: "AKROPOLE RĪGA | ALFA",
    address: "Brīvības gatve 372, Rīga LV-1006",
    email: "alfa@t-bode.lv",
    phone: "+371 25486124",
  },
  {
    name: "T/C AKROPOLE",
    address: "Maskavas iela 257, Rīga LV-1019",
    email: "akropole@t-bode.lv",
    phone: "+371 20219844",
  },
];

const office = {
  name: "BIROJS",
  address: "Braslas iela 29, Rīga, LV-1084",
  email: "info@t-bode.lv",
  phone: "+371 29475227",
};

const StoreLocations = () => {
  const { lang } = useLanguage();

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-accent" />
            <span className="font-heading text-[10px] font-bold uppercase text-accent">
              T-Bode
            </span>
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="font-heading text-2xl font-black uppercase text-foreground">
            {lang === "lv" ? "Mūsu Veikali" : "Our Stores"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {lang === "lv"
              ? "T-Shirt Store By T-Bode mazumtirdzniecības vietas Rīgā"
              : "T-Shirt Store By T-Bode retail locations in Riga"}
          </p>
        </motion.div>

        {/* Store cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group border border-border bg-card p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex items-center gap-2 mb-4">
                <StoreIcon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                <h3 className="font-heading text-sm font-bold uppercase text-foreground">
                  {store.name}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/60" strokeWidth={1.5} />
                  <span>{store.address}</span>
                </div>
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                  {store.email}
                </a>
                <a
                  href={`tel:${store.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                  {store.phone}
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Office box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 border border-accent/20 bg-accent/5 p-6"
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <StoreIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <div>
                <h3 className="font-heading text-sm font-bold uppercase text-foreground">
                  {office.name}
                </h3>
                <p className="text-xs text-muted-foreground">{office.address}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${office.email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                {office.email}
              </a>
              <a
                href={`tel:${office.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                {office.phone}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StoreLocations;
