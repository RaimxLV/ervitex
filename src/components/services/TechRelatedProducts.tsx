import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { thumbUrl } from "@/lib/imageProxy";
import { useLanguage } from "@/i18n/LanguageContext";
import CatalogModelCard from "@/components/catalog/CatalogModelCard";
import { SOURCE_META, type CatalogSource } from "@/components/catalog/unifiedCatalogMeta";
import { bucketOf, getBucket, type ColorBucketKey } from "@/lib/colorBuckets";
import { colorCodeCandidates } from "@/lib/colorCodeMatch";
import { lowestPriceColorIndex } from "@/lib/catalogPriceSelection";

interface ColorEntry { h: string | null; n: string | null; u: string | null; c?: string | null }

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

const VALID_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const PLACEHOLDER_HEX = new Set(["#000000", "#000", "#ffffff", "#fff", "#cccccc"]);

/** Same swatch-hex resolution the main catalog uses, so cards look identical. */
const sanitizeHex = (
  hex: string | null | undefined,
  bucket: ColorBucketKey | null,
  name?: string | null,
): string | null => {
  const raw = (hex ?? "").trim().toLowerCase();
  const valid = raw && VALID_HEX.test(raw) ? raw : null;
  if (bucket === "multi" && !valid) return getBucket("multi").hex;
  if (bucket && bucket !== "multi") {
    if (!valid) return getBucket(bucket).hex;
    if (PLACEHOLDER_HEX.has(valid)) {
      const isCombo = /[\/&+]| - /.test(name || "");
      if (!isCombo) return getBucket(bucket).hex;
    }
  }
  return valid;

};

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
  termodruka: {
    cats: ["T-shirts", "Tops", "Hoodies", "Hoodie sweatshirts", "Sweatshirts", "Crew neck sweatshirts", "Sportswear"],
    link: "/catalog?category=T-shirts,Hoodies,Sweatshirts,Sportswear",
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

const RelatedCard = ({
  row,
  prices,
  isLv,
  onNavigate,
}: {
  row: Row;
  prices: Map<string, PriceInfo>;
  isLv: boolean;
  onNavigate: (color: string | null) => void;
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const colors = useMemo(
    () =>
      (row.colors || [])
        .map((c, idx) => ({ ...c, idx, hex: sanitizeHex(c?.h, bucketOf(c?.h, c?.n), c?.n) }))
        .filter((c) => !!c.hex),
    [row.colors]
  );

  const colorCode = (c: ColorEntry) => row.source === "pf" ? c.n : c.c || c.n;
  const colorPrice = (c: ColorEntry) => {
    for (const k of colorCodeCandidates(colorCode(c))) {
      const hit = prices.get(`${row.source}:${row.id}:${k}`);
      if (hit) return hit;
    }
    return undefined;
  };
  const cheapest = lowestPriceColorIndex(colors, (c) => colorPrice(c)?.price);
  const active = activeIdx !== null ? colors.find((c) => c.idx === activeIdx) ?? null : null;
  const displayed = active || (cheapest >= 0 ? colors[cheapest] : colors[0]) || null;
  const rawImg = displayed?.u || row.image_url;
  const price = active ? colorPrice(active) : prices.get(`${row.source}:${row.id}`);

  const swatches = colors.slice(0, 8).map((c) => ({
    hex: c.hex,
    name: c.n || "",
    active: displayed?.idx === c.idx,
    onSelect: () => setActiveIdx(activeIdx === c.idx ? null : c.idx),
  }));

  return (
    <CatalogModelCard
      onClick={() => onNavigate(displayed && (active || cheapest >= 0) ? colorCode(displayed) : null)}
      image={thumbUrl(rawImg)}
      fallbackImage={rawImg}
      hoverImage={active ? null : thumbUrl(row.hover_image_url)}
      imageAlt={row.name || row.id}
      code={row.id}
      brandBadge={
        row.brand && row.brand.toLowerCase() !== "unbranded"
          ? row.brand
          : SOURCE_META[row.source]?.label ?? null
      }
      title={row.name || row.id}
      subtitle={active?.n || row.category}
      swatches={swatches}
      extraSwatches={Math.max(0, colors.length - 8)}
      noImageLabel={isLv ? "Bez attēla" : "No image"}
      price={
        price ? (
          <div className="flex flex-col leading-tight">
            <p className="font-heading text-base font-black text-foreground sm:text-lg">
              {price.max > price.price && (
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wider">
                  {isLv ? "no" : "from"}
                </span>
              )}
              €{(price.price * 1.21).toFixed(2)}
              <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {isLv ? "ar PVN" : "incl."}
              </span>
            </p>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              €{price.price.toFixed(2)} {isLv ? "bez PVN" : "excl. VAT"}
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
};

const TechRelatedProducts = ({ techId }: { techId: string }) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const isLv = lang === "lv";
  const [items, setItems] = useState<Row[]>([]);
  const [prices, setPrices] = useState<Map<string, PriceInfo>>(new Map());
  const [visible, setVisible] = useState(false);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const conf = TECH_CATEGORIES[techId];

  // Only fetch once the section is close to the viewport, so the technology page
  // itself paints immediately instead of waiting on the catalog query.
  useEffect(() => {
    if (!sentinel || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, visible]);

  useEffect(() => {
    if (!conf || !visible) return;
    let cancelled = false;
    (async () => {
      // Keep the payload small: a random slice of matching models is plenty for 4 cards.
      const offset = Math.floor(Math.random() * 6) * 24;
      const { data } = await supabase
        .from("catalog_items" as any)
        .select("source,id,name,brand,category,image_url,hover_image_url,colors")
        .in("category", conf.cats)
        .not("image_url", "is", null)
        .order("id")
        .range(offset, offset + 23);
      if (cancelled) return;
      const rows = ((data || []) as unknown as Row[]).filter((r) => r.name && r.image_url);
      const picked = pickRandom(rows, 4);
      setItems(picked);

      if (picked.length) {
        const priceRows: any[] = [];
        await Promise.all(
          Array.from(new Set(picked.map((r) => r.source))).map(async (source) => {
            const ids = picked.filter((r) => r.source === source).map((r) => r.id);
            let from = 0;
            while (true) {
              const { data: pr, error } = await supabase
                .from("catalog_variant_prices" as any)
                .select("source,style_code,color_code,retail_price")
                .eq("source", source)
                .in("style_code", ids)
                .gt("retail_price", 0)
                .range(from, from + 999);
              if (error || !pr) break;
              priceRows.push(...(pr as any[]));
              if (pr.length < 1000) break;
              from += 1000;
            }
          }),
        );
        if (cancelled) return;
        const map = new Map<string, PriceInfo>();
        for (const row of priceRows) {
          const value = Number(row.retail_price);
          if (!Number.isFinite(value) || value <= 0) continue;
          for (const key of [`${row.source}:${row.style_code}`, `${row.source}:${row.style_code}:${(row.color_code || "").trim().toLowerCase()}`]) {
            const current = map.get(key);
            map.set(key, {
              price: current ? Math.min(current.price, value) : value,
              max: current ? Math.max(current.max, value) : value,
            });
          }
        }
        setPrices(map);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [techId, conf, visible]);

  if (!conf) return null;
  if (items.length === 0) return <div ref={setSentinel} className="h-1" aria-hidden />;


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
          return (
            <RelatedCard
              key={`${r.source}-${r.id}`}
              row={r}
              prices={prices}
              isLv={isLv}
              onNavigate={(color) => {
                const colorQuery = color ? `?color=${encodeURIComponent(color)}` : "";
                navigate(`/catalog/item/${r.source}/${encodeURIComponent(r.id)}${colorQuery}`);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TechRelatedProducts;
