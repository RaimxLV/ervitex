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
        <div className="grid gap-6 sm:grid-cols-2">
          {stores.map((store, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group overflow-hidden border border-border bg-card transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={store.image}
                  alt={`${store.name} T-Bode veikals`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center gap-2">
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
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreLocations;
