import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const [search, setSearch] = useState("");
  const { lang, t } = useLanguage();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.name[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.description[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.material?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search, lang]);

  return (
    <Layout>
      <div className="container py-10 md:py-16">
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">{t("catalog.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("catalog.subtitle")}</p>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchParams({})}
              className={`font-heading text-xs uppercase tracking-wider ${activeCategory === "all" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
            >
              {t("catalog.all")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({ category: cat.id })}
                className={`font-heading text-xs uppercase tracking-wider ${activeCategory === cat.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
              >
                {cat.name[lang]}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("header.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">{t("catalog.noResults")}</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setSearchParams({}); }}>
              {t("catalog.clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CatalogPage;
