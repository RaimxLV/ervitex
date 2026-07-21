import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const MalfiniPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      lockedSource="mf"
      title="Malfini"
      subtitle={
        lang === "lv"
          ? "Malfini, Piccolio, Rimeck, Malfini Premium, Puma un citi zīmoli"
          : "Malfini, Piccolio, Rimeck, Malfini Premium, Puma and other brands"
      }
    />
  );
};

export default MalfiniPage;
