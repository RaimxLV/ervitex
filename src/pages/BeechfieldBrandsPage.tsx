import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const BeechfieldBrandsPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="bb"
      title="Beechfield Brands"
      subtitle={
        lang === "lv"
          ? "Beechfield · Bagbase · Quadra · Westford Mill"
          : "Beechfield · Bagbase · Quadra · Westford Mill"
      }
    />
  );
};

export default BeechfieldBrandsPage;
