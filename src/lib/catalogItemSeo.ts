import { supabase } from "@/integrations/supabase/client";

export interface CatalogItemSeo {
  source: string;
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image: string | null;
  lowPrice: number | null;
  highPrice: number | null;
}

const VALID_SOURCES = ["ss", "nwg", "pf", "bb", "mf", "ru", "utt", "fr", "etx"];

/** Server-readable product facts for search engines (title, description, Product schema). */
export async function loadCatalogItemSeo(source: string, id: string): Promise<CatalogItemSeo | null> {
  if (!VALID_SOURCES.includes(source) || !id) return null;
  try {
    const [{ data: item }, { data: prices }] = await Promise.all([
      supabase
        .from("catalog_items")
        .select("source,id,name,brand,category,description,image_url")
        .eq("source", source)
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("catalog_variant_prices")
        .select("retail_price")
        .eq("source", source)
        .eq("style_code", id)
        .gt("retail_price", 0)
        .order("retail_price", { ascending: true })
        .limit(1000),
    ]);
    if (!item?.name) return null;
    const values = (prices ?? []).map((row) => Number(row.retail_price)).filter((v) => Number.isFinite(v) && v > 0);
    return {
      source,
      id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image: item.image_url,
      lowPrice: values.length ? Math.min(...values) : null,
      highPrice: values.length ? Math.max(...values) : null,
    };
  } catch {
    return null;
  }
}

export function plainText(value: string | null | undefined, max = 160): string {
  const text = (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[*_#>`[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function catalogItemHead(seo: CatalogItemSeo | null | undefined) {
  if (!seo) return { meta: [{ title: "Prece | Ervitex katalogs" }] };
  const title = `${seo.name}${seo.brand ? ` — ${seo.brand}` : ""} | Ervitex katalogs`;
  const description =
    plainText(seo.description) ||
    `${seo.name}${seo.brand ? ` (${seo.brand})` : ""} — apģērbs ar apdruku vai izšuvumu vairumā. Ervitex, Rīga.`;
  const url = `https://www.ervitex.lv/catalog/item/${seo.source}/${encodeURIComponent(seo.id)}`;
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: seo.name,
    sku: seo.id,
    url,
    description: plainText(seo.description, 5000) || description,
    ...(seo.brand ? { brand: { "@type": "Brand", name: seo.brand } } : {}),
    ...(seo.category ? { category: seo.category } : {}),
    ...(seo.image ? { image: [seo.image] } : {}),
  };
  if (seo.lowPrice != null && seo.highPrice != null) {
    product.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: seo.lowPrice.toFixed(2),
      highPrice: seo.highPrice.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "SIA Ervitex" },
    };
  }
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      ...(seo.image ? [{ property: "og:image", content: seo.image }, { name: "twitter:image", content: seo.image }] : []),
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(product) }],
  };
}
