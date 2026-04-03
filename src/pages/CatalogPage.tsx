import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
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

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeTech = searchParams.get("tech") || "";
  const activeBrand = searchParams.get("brand") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const [search, setSearch] = useState("");
  const { lang, t } = useLanguage();
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*, product_images(url, sort_order), product_colors(name, hex_code), product_sizes(size, sort_order), categories(slug, name_lv, name_en)").eq("active", true).order("created_at", { ascending: false }).limit(500),
        supabase.from("categories").select("id, slug, name_lv, name_en").order("sort_order"),
      ]);
      setDbProducts((prodRes.data as unknown as DBProduct[]) || []);
      setDbCategories(catRes.data || []);
      setLoaded(true);
    };
    fetchData();
  }, []);

  // Normalize DB products to the same shape the cards expect
  const normalizedProducts = useMemo(() => {
    if (dbProducts.length > 0) {
      return dbProducts.map(p => ({
        id: p.id,
        name: { lv: p.name_lv, en: p.name_en },
        category: p.categories?.slug || "",
        description: { lv: p.description_lv || "", en: p.description_en || "" },
        longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
        material: p.material || undefined,
        colors: p.product_colors.map(c => c.name),
        sizes: p.product_sizes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(s => s.size),
        minOrder: p.min_order || undefined,
        images: p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(i => i.url),
        featured: p.featured || false,
        new: p.is_new || false,
        printingTechs: p.printing_techs || [],
        brand: p.brand || "",
        retailPrice: p.retail_price || 0,
      }));
    }
    return staticProducts.map(p => ({ ...p, printingTechs: [] as string[], brand: "", retailPrice: 0 }));
  }, [dbProducts]);

  const cats = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map(c => ({ id: c.slug, name: { lv: c.name_lv, en: c.name_en } }));
    }
    return staticCategories.map(c => ({ id: c.id, name: c.name }));
  }, [dbCategories]);

  const brands = useMemo(() => {
    const set = new Set(normalizedProducts.map(p => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    return normalizedProducts.filter((p) => {
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      const matchTech = !activeTech || p.printingTechs.includes(activeTech);
      const matchBrand = !activeBrand || p.brand === activeBrand;
      const matchSearch =
        !search ||
        p.name[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.description[lang].toLowerCase().includes(search.toLowerCase()) ||
        p.material?.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch && matchTech && matchBrand;
    });
  }, [activeCategory, activeTech, activeBrand, search, lang, normalizedProducts]);

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

  const printingTechs = ["DTF", "Sietspiede", "Izšūšana", "Sublimācija"];

  return (
    <Layout>
      <div className="container py-10 md:py-16">
        <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">{t("catalog.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("catalog.subtitle")}</p>

        {/* Category filters */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { const p = new URLSearchParams(searchParams); p.delete("category"); setSearchParams(p); }}
              className={`font-heading text-xs uppercase tracking-wider ${activeCategory === "all" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
            >
              {t("catalog.all")}
            </Button>
            {cats.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => { const p = new URLSearchParams(searchParams); p.set("category", cat.id); setSearchParams(p); }}
                className={`font-heading text-xs uppercase tracking-wider ${activeCategory === cat.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
              >
                {cat.name[lang]}
              </Button>
            ))}
          </div>
           <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("header.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={activeSort} onValueChange={(val) => { const p = new URLSearchParams(searchParams); p.set("sort", val); setSearchParams(p); }}>
            <SelectTrigger className="w-full md:w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{lang === "lv" ? "Jaunākie" : "Newest"}</SelectItem>
              <SelectItem value="name-asc">{lang === "lv" ? "Nosaukums A-Z" : "Name A-Z"}</SelectItem>
              <SelectItem value="name-desc">{lang === "lv" ? "Nosaukums Z-A" : "Name Z-A"}</SelectItem>
              <SelectItem value="price-asc">{lang === "lv" ? "Cena: zemākā" : "Price: Low"}</SelectItem>
              <SelectItem value="price-desc">{lang === "lv" ? "Cena: augstākā" : "Price: High"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tech filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-muted-foreground mr-2">
            {lang === "lv" ? "Tehnoloģija:" : "Technology:"}
          </span>
          {printingTechs.map(tech => (
            <Button key={tech} variant={activeTech === tech ? "default" : "outline"} size="sm"
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                activeTech === tech ? p.delete("tech") : p.set("tech", tech);
                setSearchParams(p);
              }}
              className={`text-xs ${activeTech === tech ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
            >{tech}</Button>
          ))}
        </div>

        {/* Brand filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-muted-foreground mr-2">
            {lang === "lv" ? "Ražotājs:" : "Brand:"}
          </span>
          {brands.map(brand => (
            <Button key={brand} variant={activeBrand === brand ? "default" : "outline"} size="sm"
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                activeBrand === brand ? p.delete("brand") : p.set("brand", brand);
                setSearchParams(p);
              }}
              className={`text-xs ${activeBrand === brand ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
            >{brand}</Button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>

        {sortedProducts.length === 0 && loaded && (
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
