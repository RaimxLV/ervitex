import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const CatalogPage = () => {
  const { lang } = useLanguage();
  return (
    <UnifiedCatalog
      title={lang === "lv" ? "Katalogs" : "Catalog"}
      subtitle={
        lang === "lv"
          ? "Meklējiet visos trīs mūsu piegādātāju katalogos vienuviet"
          : "Search across all three of our supplier catalogs at once"
      }
    />
  );
};

export default CatalogPage;
