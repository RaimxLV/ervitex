import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Product } from "@/data/products";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!categoryId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name_lv, name_en, description_lv, description_en, retail_price, brand, is_new, category_id, categories(slug), product_images(url, sort_order), product_colors(name, hex_code, image_url)")
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .eq("active", true)
        .limit(6);

      if (data) {
        setProducts(
          data.map((p: any) => ({
            id: p.id,
            name: { lv: p.name_lv, en: p.name_en },
            category: p.categories?.slug || "",
            description: { lv: p.description_lv || "", en: p.description_en || "" },
            colors: (p.product_colors || []).map((c: any) => c.name),
            colorHexCodes: (p.product_colors || []).map((c: any) => c.hex_code),
            colorImageUrls: (p.product_colors || []).map((c: any) => c.image_url || null),
            images: (p.product_images || [])
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((i: any) => i.url),
            new: p.is_new || false,
            retailPrice: p.retail_price || undefined,
            brand: p.brand || undefined,
          }))
        );
      }
    };
    fetch();
  }, [categoryId, currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-foreground mb-6">
        {lang === "lv" ? "Līdzīgi produkti" : "Related Products"}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
