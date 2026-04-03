import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts, categories as staticCategories } from "@/data/products";

interface DBProduct {
  id: string;
  name_lv: string;
  name_en: string;
  description_lv: string | null;
  description_en: string | null;
  long_description_lv: string | null;
  long_description_en: string | null;
  material: string | null;
  min_order: number | null;
  featured: boolean | null;
  is_new: boolean | null;
  active: boolean | null;
  category_id: string | null;
  printing_techs: string[] | null;
  retail_price: number | null;
  wholesale_price: number | null;
  brand: string | null;
  product_images: { url: string; sort_order: number | null }[];
  product_colors: { name: string; hex_code: string | null }[];
  product_sizes: { size: string; sort_order: number | null }[];
  categories: { slug: string; name_lv: string; name_en: string } | null;
}

interface DBCategory {
  id: string;
  slug: string;
  name_lv: string;
  name_en: string;
}



const ITEMS_PER_PAGE = 24;

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeBrand = searchParams.get("brand") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [search, setSearch] = useState("");
  const { lang, t } = useLanguage();
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, product_images(url, sort_order), product_colors(name, hex_code, image_url), product_sizes(size, sort_order), categories(slug, name_lv, name_en)")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase.from("categories").select("id, slug, name_lv, name_en").order("sort_order"),
      ]);
      setDbProducts((prodRes.data as unknown as DBProduct[]) || []);
      setDbCategories(catRes.data || []);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const normalizedProducts = useMemo(() => {
    if (dbProducts.length > 0) {
      return dbProducts.map((p) => ({
        id: p.id,
        name: { lv: p.name_lv, en: p.name_en },
        category: p.categories?.slug || "",
        description: { lv: p.description_lv || "", en: p.description_en || "" },
        longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
        material: p.material || undefined,
        colors: p.product_colors.map((c) => c.name),
        sizes: p.product_sizes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((s) => s.size),
        minOrder: p.min_order || undefined,
        images: p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((i) => i.url),
        featured: p.featured || false,
        new: p.is_new || false,
        printingTechs: p.printing_techs || [],
        brand: p.brand || "",
        retailPrice: p.retail_price || 0,
      }));
    }
    return staticProducts.map((p) => ({ ...p, printingTechs: [] as string[], brand: "", retailPrice: 0 }));
  }, [dbProducts]);

  const cats = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({ id: c.slug, name: { lv: c.name_lv, en: c.name_en } }));
    }
    return staticCategories.map((c) => ({ id: c.id, name: c.name }));
  }, [dbCategories]);

  const brands = useMemo(() => {
    const set = new Set(normalizedProducts.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((p) => {
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      const matchBrand = !activeBrand || p.brand === activeBrand;
      const matchSearch =
        !search ||
        p.name[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.description[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.material?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch && matchBrand;
    });
  }, [activeCategory, activeBrand, search, lang, normalizedProducts]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (activeSort) {
      case "name-asc":
        return arr.sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
      case "name-desc":
        return arr.sort((a, b) => b.name[lang].localeCompare(a.name[lang], lang));
      case "price-asc":
        return arr.sort((a, b) => a.retailPrice - b.retailPrice);
      case "price-desc":
        return arr.sort((a, b) => b.retailPrice - a.retailPrice);
      case "newest":
      default:
        return arr;
    }
  }, [filteredProducts, activeSort, lang]);

  const updateParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    val ? p.set(key, val) : p.delete(key);
    setSearchParams(p);
  };

  const handleCategorySelect = (slug: string) => {
    const p = new URLSearchParams(searchParams);
    slug === "all" ? p.delete("category") : p.set("category", slug);
    setSearchParams(p);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t("catalog.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("catalog.subtitle")}</p>
        </div>

        {/* Mobile category ribbon */}
        <div className="mb-6 md:hidden">
          <CategoryFilter categories={cats} activeCategory={activeCategory} onSelect={handleCategorySelect} />
        </div>

        {/* Desktop: sidebar + content */}
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-64 shrink-0 md:block">
            <CategoryFilter categories={cats} activeCategory={activeCategory} onSelect={handleCategorySelect} />
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <CatalogToolbar
              search={search}
              onSearchChange={setSearch}
              activeSort={activeSort}
              onSortChange={(val) => updateParam("sort", val)}
              activeBrand={activeBrand}
              onBrandChange={(val) => updateParam("brand", activeBrand === val ? "" : val)}
              brands={brands}
              resultCount={sortedProducts.length}
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>

            {sortedProducts.length === 0 && loaded && (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">{t("catalog.noResults")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setSearchParams({});
                  }}
                >
                  {t("catalog.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CatalogPage;
