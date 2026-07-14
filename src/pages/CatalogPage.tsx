import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import CatalogFiltersSidebar, {
  type FilterSection,
} from "@/components/catalog/CatalogFiltersSidebar";
import {
  COLOR_BUCKETS,
  bucketOf,
  type ColorBucketKey,
} from "@/lib/colorBuckets";

interface CatalogItem {
  source: "ss" | "nwg" | "pf";
  id: string;
  name: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  group_name: string | null;
  gender: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  color_hexes: string[] | null;
  color_names: string[] | null;
}

interface EnrichedItem extends CatalogItem {
  buckets: Set<ColorBucketKey>;
}

const PAGE_SIZE = 24;

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

const resolveImg = (item: CatalogItem): string | null => {
  if (!item.image_url) return null;
  return item.source === "ss" ? resolveSsUrl(item.image_url) : item.image_url;
};

const SOURCE_META: Record<CatalogItem["source"], { lv: string; en: string; href: string }> = {
  ss: { lv: "Stanley/Stella", en: "Stanley/Stella", href: "/stanley-stella" },
  nwg: { lv: "New Wave Group", en: "New Wave Group", href: "/nwg" },
  pf: { lv: "PF Concept", en: "PF Concept", href: "/pf-concept" },
};

const detailHref = (item: CatalogItem): string => SOURCE_META[item.source].href;

const CatalogPage = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Filter state (URL-backed)
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sources, setSources] = useState<Set<string>>(
    new Set((searchParams.get("source") || "").split(",").filter(Boolean))
  );
  const [brands, setBrands] = useState<Set<string>>(
    new Set((searchParams.get("brand") || "").split(",").filter(Boolean))
  );
  const [categories, setCategories] = useState<Set<string>>(
    new Set((searchParams.get("category") || "").split(",").filter(Boolean))
  );
  const [groups, setGroups] = useState<Set<string>>(
    new Set((searchParams.get("group") || "").split(",").filter(Boolean))
  );
  const [genders, setGenders] = useState<Set<string>>(
    new Set((searchParams.get("gender") || "").split(",").filter(Boolean))
  );
  const [colors, setColors] = useState<Set<string>>(
    new Set((searchParams.get("color") || "").split(",").filter(Boolean))
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Persist filters to URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sources.size) p.set("source", [...sources].join(","));
    if (brands.size) p.set("brand", [...brands].join(","));
    if (categories.size) p.set("category", [...categories].join(","));
    if (groups.size) p.set("group", [...groups].join(","));
    if (genders.size) p.set("gender", [...genders].join(","));
    if (colors.size) p.set("color", [...colors].join(","));
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [q, sources, brands, categories, groups, genders, colors, page, setSearchParams]);

  // Load data
  useEffect(() => {
    (async () => {
      const all: CatalogItem[] = [];
      const step = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("catalog_items" as any)
          .select(
            "source,id,name,description,brand,category,group_name,gender,image_url,hover_image_url,color_hexes,color_names"
          )
          .range(from, from + step - 1);
        if (error) break;
        all.push(...((data || []) as unknown as CatalogItem[]));
        if (!data || data.length < step) break;
        from += step;
      }
      const enriched: EnrichedItem[] = all.map((it) => {
        const buckets = new Set<ColorBucketKey>();
        const hexes = it.color_hexes || [];
        const names = it.color_names || [];
        const len = Math.max(hexes.length, names.length);
        for (let i = 0; i < len; i++) {
          const b = bucketOf(hexes[i], names[i]);
          if (b) buckets.add(b);
        }
        return { ...it, buckets };
      });
      setItems(enriched);
      setLoaded(true);
    })();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, sources, brands, categories, groups, genders, colors]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const t = useMemo(
    () => ({
      title: lang === "lv" ? "Katalogs" : "Catalog",
      subtitle:
        lang === "lv"
          ? "Meklējiet visos trīs mūsu piegādātāju katalogos vienuviet"
          : "Search across all three of our supplier catalogs at once",
      search: lang === "lv" ? "Meklēt modeli, kodu vai zīmolu…" : "Search model, code or brand…",
      results: lang === "lv" ? "rezultāti" : "results",
      clearAll: lang === "lv" ? "Notīrīt filtrus" : "Clear filters",
      source: lang === "lv" ? "Katalogs" : "Catalog",
      brand: lang === "lv" ? "Zīmols" : "Brand",
      category: lang === "lv" ? "Kategorija" : "Category",
      group: lang === "lv" ? "Grupa" : "Group",
      gender: lang === "lv" ? "Dzimums" : "Gender",
      color: lang === "lv" ? "Krāsa" : "Color",
      empty: lang === "lv" ? "Nav atrasts neviens produkts" : "No products found",
      view: lang === "lv" ? "Skatīt" : "View",
      prev: lang === "lv" ? "Iepriekšējā" : "Previous",
      next: lang === "lv" ? "Nākamā" : "Next",
    }),
    [lang]
  );

  // Cascading filter: each facet counts items filtered by *other* facets.
  const passesExcept = (it: EnrichedItem, except: string, extraQ = q) => {
    if (extraQ) {
      const needle = extraQ.toLowerCase();
      const hay = `${it.name || ""} ${it.id} ${it.brand || ""} ${it.description || ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (except !== "source" && sources.size && !sources.has(it.source)) return false;
    if (except !== "brand" && brands.size && (!it.brand || !brands.has(it.brand))) return false;
    if (except !== "category" && categories.size && (!it.category || !categories.has(it.category))) return false;
    if (except !== "group" && groups.size && (!it.group_name || !groups.has(it.group_name))) return false;
    if (except !== "gender" && genders.size && (!it.gender || !genders.has(it.gender))) return false;
    if (except !== "color" && colors.size) {
      let ok = false;
      for (const c of colors) if (it.buckets.has(c as ColorBucketKey)) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  };

  const facet = useCallback(
    (key: string, pick: (it: EnrichedItem) => string | null | undefined) => {
      const counts = new Map<string, number>();
      for (const it of items) {
        if (!passesExcept(it, key)) continue;
        const v = pick(it);
        if (!v) continue;
        counts.set(v, (counts.get(v) || 0) + 1);
      }
      return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    },
    [items, q, sources, brands, categories, groups, genders, colors]
  );

  const sourceItems = useMemo(() => {
    const order: CatalogItem["source"][] = ["ss", "nwg", "pf"];
    return order
      .map((s) => ({
        label: SOURCE_META[s][lang as "lv" | "en"],
        count: items.filter((it) => it.source === s && passesExcept({ ...it }, "source")).length,
        value: s,
      }))
      .filter((x) => x.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, q, sources, brands, categories, groups, genders, colors]);

  const brandItems = useMemo(() => facet("brand", (it) => it.brand), [facet]);
  const categoryItems = useMemo(() => facet("category", (it) => it.category), [facet]);
  const groupItems = useMemo(() => facet("group", (it) => it.group_name), [facet]);
  const genderItems = useMemo(() => facet("gender", (it) => it.gender), [facet]);

  const colorItems = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const it of items) {
      if (!passesExcept(it, "color")) continue;
      for (const b of it.buckets) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return COLOR_BUCKETS.map((b) => ({
      key: b.key,
      label: lang === "lv" ? b.lv : b.en,
      count: counts.get(b.key) || 0,
      hex: b.hex,
    })).filter((x) => x.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, q, sources, brands, categories, groups, genders, colors]);

  const filtered = useMemo(
    () => items.filter((it) => passesExcept(it, "__none__")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, q, sources, brands, categories, groups, genders, colors]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const clearAll = () => {
    setQ("");
    setSources(new Set());
    setBrands(new Set());
    setCategories(new Set());
    setGroups(new Set());
    setGenders(new Set());
    setColors(new Set());
  };

  const filterSections: FilterSection[] = [
    {
      key: "source",
      title: t.source,
      items: sourceItems.map((s) => ({ label: s.label, count: s.count })),
      selected: new Set(
        [...sources].map((k) => SOURCE_META[k as CatalogItem["source"]]?.[lang as "lv" | "en"] || k)
      ),
      onToggle: (label) => {
        const key = (Object.keys(SOURCE_META) as CatalogItem["source"][]).find(
          (k) => SOURCE_META[k][lang as "lv" | "en"] === label
        );
        if (key) toggle(sources, setSources)(key);
      },
    },
    {
      key: "color",
      title: t.color,
      items: colorItems.map((c) => ({ label: c.label, count: c.count })),
      selected: new Set(
        [...colors]
          .map((k) => {
            const b = COLOR_BUCKETS.find((x) => x.key === k);
            return b ? (lang === "lv" ? b.lv : b.en) : null;
          })
          .filter(Boolean) as string[]
      ),
      onToggle: (label) => {
        const b = COLOR_BUCKETS.find((x) => (lang === "lv" ? x.lv : x.en) === label);
        if (b) toggle(colors, setColors)(b.key);
      },
    },
    {
      key: "group",
      title: t.group,
      items: groupItems,
      selected: groups,
      onToggle: toggle(groups, setGroups),
    },
    {
      key: "category",
      title: t.category,
      items: categoryItems,
      selected: categories,
      onToggle: toggle(categories, setCategories),
    },
    {
      key: "brand",
      title: t.brand,
      items: brandItems,
      selected: brands,
      onToggle: toggle(brands, setBrands),
    },
    {
      key: "gender",
      title: t.gender,
      items: genderItems,
      selected: genders,
      onToggle: toggle(genders, setGenders),
    },
  ];

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-14">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="h-11"
            />
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {filtered.length.toLocaleString(lang === "lv" ? "lv-LV" : "en-US")} {t.results}
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-72 md:shrink-0">
            <CatalogFiltersSidebar
              sections={filterSections}
              onClearAll={clearAll}
              heading={lang === "lv" ? "Filtri" : "Filters"}
            />
          </div>

          <div className="min-w-0 flex-1">
            {!loaded ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="overflow-hidden border border-border bg-card">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">{t.empty}</p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>
                  {t.clearAll}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((it) => (
                    <CatalogCard key={`${it.source}-${it.id}`} item={it} lang={lang} viewLabel={t.view} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setPage(safePage - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="font-heading text-xs uppercase tracking-wider"
                    >
                      ← {t.prev}
                    </Button>
                    <span className="px-3 text-sm text-muted-foreground">
                      {safePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setPage(safePage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="font-heading text-xs uppercase tracking-wider"
                    >
                      {t.next} →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface CardProps {
  item: EnrichedItem;
  lang: "lv" | "en";
  viewLabel: string;
}

const CatalogCard = ({ item, lang, viewLabel }: CardProps) => {
  const img = resolveImg(item);
  const hover =
    item.source === "ss" ? resolveSsUrl(item.hover_image_url) : item.hover_image_url;
  const swatches = (item.color_hexes || []).slice(0, 8);
  const extra = Math.max(0, (item.color_hexes || []).length - 8);

  return (
    <Link
      to={detailHref(item)}
      className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {img ? (
          <>
            <img
              src={img}
              alt={item.name || item.id}
              loading="lazy"
              className={`absolute inset-0 h-full w-full scale-[1.08] object-contain object-center p-1 transition-opacity duration-500 ${hover ? "group-hover:opacity-0" : ""}`}
            />
            {hover && (
              <img
                src={hover}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-[1.08] object-contain object-center p-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <span className="font-mono text-xs">{item.id}</span>
          </div>
        )}
        <Badge className="absolute left-2 top-2 rounded-none bg-primary px-2 py-0 font-heading text-[9px] uppercase tracking-widest text-primary-foreground">
          {item.brand && item.brand.toLowerCase() !== SOURCE_META[item.source][lang].toLowerCase()
            ? item.brand
            : SOURCE_META[item.source][lang]}
        </Badge>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 font-heading text-sm font-bold uppercase tracking-wide transition-colors group-hover:text-accent">
          {item.name || item.id}
        </h3>
        {item.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}
        {swatches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {swatches.map((hex, i) => (
              <span
                key={`${hex}-${i}`}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: hex.startsWith("#") && hex.length === 7 ? hex : "#ccc" }}
              />
            ))}
            {extra > 0 && (
              <span className="text-[10px] text-muted-foreground">+{extra}</span>
            )}
          </div>
        )}
        <p className="pt-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {viewLabel} →
        </p>
      </div>
    </Link>
  );
};

export default CatalogPage;
