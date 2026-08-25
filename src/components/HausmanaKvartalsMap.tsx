import { motion } from "framer-motion";
import planAsset from "@/assets/ervitex-eku-plans.png.asset.json";
import { useLanguage } from "@/i18n/LanguageContext";

const HausmanaKvartalsMap = () => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-sm border border-border bg-background"
    >
      <img
        src={planAsset.url}
        alt={
          lang === "lv"
            ? "Braslas Biznesa Centra ēku plāns ar iezīmētu Ervitex ieeju"
            : "Braslas Business Center building plan with the Ervitex entrance marked"
        }
        className="w-full h-auto"
        loading="lazy"
      />
      {/* Marker over the highlighted entrance */}
      <div className="pointer-events-none absolute left-[17%] top-[44%] -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </span>
      </div>
    </motion.div>
  );
};

export default HausmanaKvartalsMap;
