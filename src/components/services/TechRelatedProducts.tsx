import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { thumbUrl } from "@/lib/imageProxy";
import { useLanguage } from "@/i18n/LanguageContext";
import CatalogModelCard from "@/components/catalog/CatalogModelCard";
import { SOURCE_META, type CatalogSource } from "@/components/catalog/unifiedCatalogMeta";

interface ColorEntry { h: string | null; n: string | null; u: string | null }

type Row = {
  source: CatalogSource;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  colors?: ColorEntry[] | null;
};

interface PriceInfo { price: number; max: number }

/** Raw catalog categories that make sense for each print technology. */
const TECH_CATEGORIES: Record<string, { cats: string[]; link: string }> = {
  sietspiede: {
    cats: ["T-shirts", "Tops", "Hoodies", "Hoodie sweatshirts", "Sweatshirts", "Crew neck sweatshirts"],
    link: "/catalog?category=T-shirts,Hoodies,Sweatshirts",
  },
  dtf: {
    cats: ["T-shirts", "Tops", "Hoodies", "Hoodie sweatshirts", "Sweatshirts", "Crew neck sweatshirts"],
    link: "/catalog?category=T-shirts,Hoodies,Sweatshirts",
  },
  izsusana: {
    cats: ["Headwear", "Caps & Hats", "Polos", "Polo shirts", "Jackets"],
    link: "/catalog?category=Headwear,Polos",
  },
  sublimacija: {
    cats: [
      "Standard Mugs",
      "Insulated Mugs",
      "Travel Mugs",
      "Sports Bottles",
      "Water Bottles",
      "Insulated Bottles",
      "Fitness & Sport",
      "Tops",
    ],
    link: "/catalog?category=Mugs,Bottles",
  },
};

const pickRandom = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

const TechRelatedProducts = ({ techId }: { techId: string }) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isLv = lang === "lv";
  const [items, setItems] = useState<Row[]>([]);
  const [prices, setPrices] = useState<Map<string, PriceInfo>>(new Map());
  const conf = TECH_CATEGORIES[techId];

  useEffect(() => {
    if (!conf) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("catalog_items" as any)
        .select("source,id,name,brand,category,image_url,hover_image_url,colors")
        .in("category", conf.cats)
        .not("image_url", "is", null)
        .limit(200);
      if (cancelled) return;
      const rows = ((data || []) as unknown as Row[]).filter((r) => r.name && r.image_url);
      const picked = pickRandom(rows, 4);
      setItems(picked);

      if (picked.length) {
        const { data: pr } = await supabase
          .from("catalog_price_ranges" as any)
          .select("source,style_code,min_price,max_price")
          .in("style_code", picked.map((r) => r.id));
        if (cancelled) return;
        const map = new Map<string, PriceInfo>();
        for (const row of (pr || []) as any[]) {
          const min = Number(row.min_price);
          const max = Number(row.max_price);
          if (!Number.isFinite(min) || min <= 0) continue;
          map.set(`${row.source}:${row.style_code}`, { price: min, max: Number.isFinite(max) ? max : min });
        }
        setPrices(map);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [techId, conf]);

  if (!conf || items.length === 0) return null;

  return (
    <div className="mt-16 border-t border-border pt-12 md:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-xl font-bold uppercase text-foreground md:text-2xl">
          {isLv ? "Saistošie produkti" : "Related products"}
        </h2>
        <Link
          to={conf.link}
          className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:text-accent"
        >
          {isLv ? "Skatīt visu katalogu" : "Browse the catalog"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((r) => {
          const cols = (r.colors || []).filter((c) => c && (c.h || c.n));
          const swatches = cols.slice(0, 8).map((c) => ({ hex: c.h ?? null, name: c.n || "" }));
          const p = prices.get(`${r.source}:${r.id}`);
          return (
            <CatalogModelCard
              key={`${r.source}-${r.id}`}
              onClick={() => navigate(`/catalog/item/${r.source}/${encodeURIComponent(r.id)}`)}
              image={thumbUrl(r.image_url)}
              fallbackImage={r.image_url}
              hoverImage={thumbUrl(r.hover_image_url)}
              imageAlt={r.name || r.id}
              code={r.id}
              brandBadge={
                r.brand && r.brand.toLowerCase() !== "unbranded"
                  ? r.brand
                  : SOURCE_META[r.source]?.label ?? null
              }
              title={r.name || r.id}
              subtitle={r.category}
              swatches={swatches}
              extraSwatches={Math.max(0, cols.length - 8)}
              noImageLabel={isLv ? "Bez attēla" : "No image"}
              price={
                p ? (
                  <div className="flex flex-col leading-tight">
                    <p className="font-heading text-base font-black text-foreground sm:text-lg">
                      {p.max > p.price && (
                        <span className="mr-1 text-[10px] font-bold uppercase tracking-wider">
                          {isLv ? "no" : "from"}
                        </span>
                      )}
                      €{(p.price * 1.21).toFixed(2)}
                      <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {isLv ? "ar PVN" : "incl."}
                      </span>
                    </p>
                    <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      €{p.price.toFixed(2)} {isLv ? "bez PVN" : "excl. VAT"}
                    </p>
                  </div>
                ) : (
                  <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isLv ? "Cena pēc pieprasījuma" : "Price on request"}
                  </p>
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default TechRelatedProducts;
