import UnifiedCatalog from "@/components/catalog/UnifiedCatalog";
import { useLanguage } from "@/i18n/LanguageContext";

const CatalogPage = () => {
  const { lang } = useLanguage();
  return <UnifiedCatalog title={lang === "lv" ? "Katalogs" : "Catalog"} />;
};

export default CatalogPage;
