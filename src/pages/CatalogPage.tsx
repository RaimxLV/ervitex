import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";


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
  hidden_manual: boolean | null;
  hide_when_oos: boolean | null;
  ss_in_stock: boolean | null;
  ss_style_code: string | null;
  nwg_product_number: string | null;
  product_images: { url: string; sort_order: number | null }[];
  product_colors: { name: string; hex_code: string | null }[];
  product_sizes: { size: string; sort_order: number | null }[];
  categories: { slug: string; name_lv: string; name_en: string } | null;
}

// Resolve Stanley/Stella Cloudinary URLs and apply catalog thumbnail transform.
const SS_CDN_BASE = "https://res.cloudinary.com/www-stanleystella-com/image/upload/";
const SS_THUMB = "f_auto,q_auto,w_600,c_fill,g_auto";
const resolveSsUrl = (u?: string | null): string | null => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) {
    if (u.includes("res.cloudinary.com") && u.includes("/image/upload/")) {
      return u.replace("/image/upload/", `/image/upload/${SS_THUMB}/`);
    }
    return u;
  }
  return SS_CDN_BASE + SS_THUMB + "/" + u.replace(/^\/+/, "");
};

interface SsEnrichment {
  name: string;
  short_description: string | null;
  images: string[];
  colors: { name: string; hex: string | null }[];
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
  const initialSearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialSearch);

  // Sync search from URL query param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== search) setSearch(q);
  }, [searchParams.get("q")]);
  const { lang, t } = useLanguage();
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<DBCategory[]>([]);
  const [ssEnrichment, setSsEnrichment] = useState<Map<string, SsEnrichment>>(new Map());
  const [nwgEnrichment, setNwgEnrichment] = useState<Map<string, SsEnrichment>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all products in batches of 1000 to bypass Supabase default limit
      const PAGE_SIZE = 1000;
      let allProducts: DBProduct[] = [];
      let page = 0;
      let hasMore = true;
      while (hasMore) {
        const { data } = await supabase
          .from("products")
          .select("id, category_id, name_lv, name_en, description_lv, description_en, long_description_lv, long_description_en, material, min_order, retail_price, printing_techs, featured, is_new, active, created_at, updated_at, brand, hidden_manual, hide_when_oos, ss_in_stock, ss_style_code, nwg_product_number, product_images(url, sort_order), product_colors(name, hex_code, image_url), product_sizes(size, sort_order), categories(slug, name_lv, name_en)")
          .eq("active", true)
          .eq("hidden_manual", false)
          .order("created_at", { ascending: false })
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        const batch = ((data as unknown as DBProduct[]) || []).filter(
          (p) => !(p.hide_when_oos && p.ss_in_stock === false)
        );
        allProducts = allProducts.concat(batch);
        hasMore = (data?.length || 0) === PAGE_SIZE;
        page++;
      }

      const { data: catData } = await supabase.from("categories").select("id, slug, name_lv, name_en").order("sort_order");
      setDbProducts(allProducts);
      setDbCategories(catData || []);
      setLoaded(true);

      // Enrich Stanley/Stella products with real S/S data (images, colors, name)
      const ssCodes = Array.from(new Set(
        allProducts
          .filter((p) => (p.brand || "").toLowerCase().includes("stanley") && p.ss_style_code)
          .map((p) => p.ss_style_code as string)
      ));
      if (ssCodes.length) {
        const [{ data: summary }, { data: variants }] = await Promise.all([
          supabase.from("ss_style_summary" as any)
            .select("style_code,name,short_description,cover_url,over_url,main_picture_url,over_picture_url")
            .in("style_code", ssCodes),
          supabase.from("ss_variants")
            .select("style_code,color_code,color_name,hex_color_code,color_sequence")
            .in("style_code", ssCodes),
        ]);
        const colorsByStyle = new Map<string, { name: string; hex: string | null; seq: number }[]>();
        for (const v of (variants || []) as any[]) {
          if (!v.color_code) continue;
          const arr = colorsByStyle.get(v.style_code) || [];
          if (!arr.some((c) => c.name === (v.color_name || v.color_code))) {
            arr.push({ name: v.color_name || v.color_code, hex: v.hex_color_code || null, seq: v.color_sequence ?? 0 });
            colorsByStyle.set(v.style_code, arr);
          }
        }
        const map = new Map<string, SsEnrichment>();
        for (const s of (summary || []) as any[]) {
          const cover = resolveSsUrl(s.cover_url || s.main_picture_url);
          const over = resolveSsUrl(s.over_url || s.over_picture_url);
          const imgs = [cover, over].filter((x): x is string => !!x);
          const cols = (colorsByStyle.get(s.style_code) || []).sort((a, b) => a.seq - b.seq);
          map.set(s.style_code, {
            name: s.name || s.style_code,
            short_description: s.short_description || null,
            images: imgs,
            colors: cols.map(({ name, hex }) => ({ name, hex })),
          });
        }
        setSsEnrichment(map);
      }

      // NWG enrichment: LEFT JOIN nwg_style_summary + nwg_variants
      const nwgNums = Array.from(new Set(
        allProducts
          .filter((p) => p.nwg_product_number)
          .map((p) => p.nwg_product_number as string)
      ));
      if (nwgNums.length) {
        const [{ data: nSummary }, { data: nVariants }] = await Promise.all([
          supabase.from("nwg_style_summary" as any)
            .select("product_number,name,commerce_text,main_picture_url,hover_picture_url")
            .in("product_number", nwgNums),
          supabase.from("nwg_variants")
            .select("product_number,color_name,color_code,web_color,shade_color,main_picture_url")
            .in("product_number", nwgNums),
        ]);
        const nColorsByStyle = new Map<string, { name: string; hex: string | null }[]>();
        for (const v of (nVariants || []) as any[]) {
          const name = v.color_name || v.color_code;
          if (!name) continue;
          const hex = (v.web_color?.[0] ? (String(v.web_color[0]).startsWith("#") ? v.web_color[0] : `#${v.web_color[0]}`) : (v.shade_color?.startsWith("#") ? v.shade_color : null));
          const arr = nColorsByStyle.get(v.product_number) || [];
          if (!arr.some((c) => c.name === name)) {
            arr.push({ name, hex });
            nColorsByStyle.set(v.product_number, arr);
          }
        }
        const nMap = new Map<string, SsEnrichment>();
        for (const s of (nSummary || []) as any[]) {
          const imgs = [s.main_picture_url, s.hover_picture_url].filter((u: string | null): u is string => !!u);
          nMap.set(s.product_number, {
            name: s.name || s.product_number,
            short_description: s.commerce_text || null,
            images: imgs,
            colors: nColorsByStyle.get(s.product_number) || [],
          });
        }
        setNwgEnrichment(nMap);
      }
    };
    fetchData();
  }, []);


  const normalizedProducts = useMemo(() => {
    if (dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const ss = p.ss_style_code ? ssEnrichment.get(p.ss_style_code) : undefined;
        const baseImages = p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((i) => i.url);
        const baseColors = p.product_colors.map((c) => c.name);
        const baseHex = p.product_colors.map((c) => c.hex_code);
        return {
          id: p.id,
          name: {
            lv: ss?.name || p.name_lv,
            en: ss?.name || p.name_en,
          },
          category: p.categories?.slug || "",
          description: {
            lv: ss?.short_description || p.description_lv || "",
            en: ss?.short_description || p.description_en || "",
          },
          longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
          material: p.material || undefined,
          colors: ss?.colors.length ? ss.colors.map((c) => c.name) : baseColors,
          colorHexCodes: ss?.colors.length ? ss.colors.map((c) => c.hex) : baseHex,
          colorImageUrls: ss?.colors.length ? ss.colors.map(() => null) : p.product_colors.map((c: any) => c.image_url || null),
          sizes: p.product_sizes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((s) => s.size),
          minOrder: p.min_order || undefined,
          images: ss?.images.length ? ss.images : baseImages,
          featured: p.featured || false,
          new: p.is_new || false,
          printingTechs: p.printing_techs || [],
          brand: p.brand || "",
          retailPrice: p.retail_price || 0,
        };
      });
    }
    return [];
  }, [dbProducts, ssEnrichment]);


  const cats = useMemo(() => {
    return dbCategories.map((c) => ({ id: c.slug, name: { lv: c.name_lv, en: c.name_en } }));
  }, [dbCategories]);

  const brands = useMemo(() => {
    const set = new Set(normalizedProducts.map((p) => p.brand).filter(Boolean) as string[]);
    // Stanley/Stella ir mūsu primārais piegādātājs — vienmēr pirmais filtros
    const PRIMARY = ["Stanley/Stella", "Stanley & Stella", "Stanley Stella"];
    const all = Array.from(set);
    const primary = PRIMARY.filter((b) => all.some((x) => x.toLowerCase() === b.toLowerCase()))
      .map((b) => all.find((x) => x.toLowerCase() === b.toLowerCase()) as string);
    const rest = all.filter((b) => !primary.includes(b)).sort();
    return [...primary, ...rest];
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

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, safeCurrentPage]);

  const updateParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    val ? p.set(key, val) : p.delete(key);
    if (key !== "page") p.delete("page"); // reset page on filter change
    setSearchParams(p);
  };

  const goToPage = useCallback((page: number) => {
    const p = new URLSearchParams(searchParams);
    page > 1 ? p.set("page", String(page)) : p.delete("page");
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, setSearchParams]);

  const handleCategorySelect = (slug: string) => {
    const p = new URLSearchParams(searchParams);
    slug === "all" ? p.delete("category") : p.set("category", slug);
    p.delete("page");
    setSearchParams(p);
  };

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-14">
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

            {!loaded ? (
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="overflow-hidden border border-border bg-card">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-4 w-1/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => goToPage(safeCurrentPage - 1)}
                  className="font-heading text-xs uppercase tracking-wider min-w-0 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">← {lang === "lv" ? "Iepriekšējā" : "Previous"}</span>
                  <span className="sm:hidden">←</span>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("ellipsis");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-0.5 text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={item === safeCurrentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(item)}
                        className="font-heading min-w-[2rem] sm:min-w-[2.25rem] text-xs px-1.5 sm:px-2"
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => goToPage(safeCurrentPage + 1)}
                  className="font-heading text-xs uppercase tracking-wider min-w-0 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">{lang === "lv" ? "Nākamā" : "Next"} →</span>
                  <span className="sm:hidden">→</span>
                </Button>
              </div>
            )}

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
