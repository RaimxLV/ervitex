import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const NwgPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="nwg"
      title="Craft / Clique / ProJob / Cutter & Buck"
      subtitle={
        lang === "lv"
          ? "Atlasītie profesionālie ražotāji"
          : "Selected professional manufacturers"
      }
    />
  );
};

export default NwgPage;
