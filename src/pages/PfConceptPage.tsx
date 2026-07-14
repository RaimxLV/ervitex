import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const PfConceptPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="pf"
      title="PF Concept"
      subtitle={
        lang === "lv"
          ? "Plašs Eiropas biznesa dāvanu un apģērbu klāsts"
          : "Wide range of European business gifts and apparel"
      }
    />
  );
};

export default PfConceptPage;
