import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { thumbUrl } from "@/lib/imageProxy";
import { useLanguage } from "@/i18n/LanguageContext";

type Row = {
  source: string;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image_url: string | null;
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
  const isLv = lang === "lv";
  const [items, setItems] = useState<Row[]>([]);
  const conf = TECH_CATEGORIES[techId];

  useEffect(() => {
    if (!conf) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("catalog_items")
        .select("source,id,name,brand,category,image_url")
        .in("category", conf.cats)
        .not("image_url", "is", null)
        .limit(200);
      if (cancelled) return;
      const rows = ((data || []) as unknown as Row[]).filter((r) => r.name && r.image_url);
      setItems(pickRandom(rows, 4));
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map((it) => (
          <Link
            key={`${it.source}-${it.id}`}
            to={`/catalog/item/${it.source}/${encodeURIComponent(it.id)}`}
            className="group flex flex-col overflow-hidden border border-border bg-white transition-colors hover:border-accent"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-white">
              <img
                src={thumbUrl(it.image_url, 500) || it.image_url || ""}
                alt={it.name || ""}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-border p-3">
              {it.brand && (
                <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {it.brand}
                </span>
              )}
              <span className="line-clamp-2 min-h-[2.1em] text-xs font-medium leading-snug text-neutral-900 md:text-sm">
                {it.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TechRelatedProducts;
