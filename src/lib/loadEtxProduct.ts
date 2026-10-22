import { supabase } from "@/integrations/supabase/client";
import { ETX_PUBLIC_BRAND } from "@/lib/etxCatalog";

const MATERIAL_EN: Record<string, string> = {
  "pārstrādāts poliesters": "Recycled polyester",
  "poliesters": "Polyester",
  "kokvilna": "Cotton",
};
export const etxMaterialEn = (m: string | null) =>
  m ? MATERIAL_EN[m.trim().toLowerCase()] ?? m : m;

/** Unsynced products reuse the existing editable product records and galleries. */
export async function loadEtxProduct(id: string, lang: "lv" | "en") {
  const [product, images, colors, sizes] = await Promise.all([
    supabase.from("products").select("name_lv,name_en,description_lv,description_en,long_description_lv,long_description_en,material,brand,category_id,active,hidden_manual").eq("id", id).eq("brand", "ETX Latvia").maybeSingle(),
    supabase.from("product_images").select("url").eq("product_id", id).order("sort_order"),
    supabase.from("product_colors").select("id,name,hex_code,image_url").eq("product_id", id).order("created_at"),
    supabase.from("product_sizes").select("size").eq("product_id", id).order("sort_order"),
  ]);
  const p = product.data;
  if (!p || !p.active || p.hidden_manual) return null;
  const gallery = (images.data || []).map(i => i.url);
  const availableSizes = (sizes.data || []).map(s => s.size);
  return {
    title: lang === "lv" ? p.name_lv : p.name_en,
    code: "",
    brand: ETX_PUBLIC_BRAND,
    category: /kr[uū]z/i.test(p.name_lv) ? (lang === "lv" ? "Sublimācijas krūzes" : "Sublimation mugs") : lang === "lv" ? "Sporta formas sublimācija" : "Sublimation sportswear",
    gender: null,
    shortDescription: lang === "lv" ? p.description_lv : p.description_en,
    description: lang === "lv" ? p.long_description_lv : p.long_description_en,
    features: [],
    material: lang === "lv" ? p.material : etxMaterialEn(p.material),
    care: null,
    specs: [],
    notice: null,
    sizes: availableSizes,
    images: gallery,
    colors: (colors.data || []).map(c => ({
      code: c.id, name: c.name, hex: c.hex_code,
      // Colour photo first so switching colour shows the matching product.
      images: c.image_url ? [c.image_url, ...gallery.filter(u => u !== c.image_url)] : gallery, sizes: availableSizes,
    })),
  };
}