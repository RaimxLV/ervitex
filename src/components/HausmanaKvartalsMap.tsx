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
        className="h-[300px] w-full object-contain p-3 sm:h-[400px]"
        loading="lazy"
      />
    </motion.div>
  );
};

export default HausmanaKvartalsMap;
