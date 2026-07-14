import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const NwgPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="nwg"
      title="New Wave Group"
      subtitle={
        lang === "lv"
          ? "Craft, Clique, Projob un citi profesionāli zīmoli"
          : "Craft, Clique, Projob and other professional brands"
      }
    />
  );
};

export default NwgPage;
