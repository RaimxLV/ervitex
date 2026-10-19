import { supabase } from "@/integrations/supabase/client";
import { grossFromNet } from "@/lib/vat";

export interface CatalogItemSeo {
  source: string;
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  image: string | null;
  /** Public GROSS prices (incl. 21% VAT), matching what the page displays. */
  lowPrice: number | null;
  highPrice: number | null;
}

const VALID_SOURCES = ["ss", "nwg", "pf", "bb", "mf", "ru", "utt", "fr", "etx"];

/** Server-readable product facts for search engines (title, description, Product schema). */
export async function loadCatalogItemSeo(source: string, id: string): Promise<CatalogItemSeo | null> {
  if (!VALID_SOURCES.includes(source) || !id) return null;
  try {
    // catalog_variant_prices.retail_price is NET. Min/max come from two
    // ordered limit-1 queries, so the range is exact for any variant count
    // (no row-cap truncation).
    const [{ data: item }, { data: minRow }, { data: maxRow }] = await Promise.all([
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
        .limit(1)
        .maybeSingle(),
      supabase
        .from("catalog_variant_prices")
        .select("retail_price")
        .eq("source", source)
        .eq("style_code", id)
        .gt("retail_price", 0)
        .order("retail_price", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (!item?.name) return null;
    const lowNet = Number(minRow?.retail_price);
    const highNet = Number(maxRow?.retail_price);
    const hasPrices = Number.isFinite(lowNet) && lowNet > 0 && Number.isFinite(highNet) && highNet > 0;
    return {
      source,
      id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      description: item.description,
      image: item.image_url,
      // JSON-LD must publish the same gross prices visitors see (net × 1.21).
      lowPrice: hasPrices ? grossFromNet(lowNet) : null,
      highPrice: hasPrices ? grossFromNet(highNet) : null,
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
      seller: { "@type": "Organization", name: "SIA Ervitex" },
    };
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Sākums", item: "https://www.ervitex.lv/" },
      { "@type": "ListItem", position: 2, name: "Katalogs", item: "https://www.ervitex.lv/catalog" },
      { "@type": "ListItem", position: 3, name: seo.name, item: url },
    ],
  };
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      ...(seo.image ? [{ property: "og:image", content: seo.image }, { name: "twitter:image", content: seo.image }] : []),
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "lv", href: url },
      { rel: "alternate", hrefLang: "x-default", href: url },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(product) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
    ],
  };
}
