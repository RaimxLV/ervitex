import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="ss"
      title="Stanley/Stella"
      subtitle={
        lang === "lv"
          ? "Ilgtspējīgi zīmola apģērbi tiešā piegādē"
          : "Sustainable branded apparel delivered directly"
      }
    />
  );
};

export default StanleyStellaPage;
