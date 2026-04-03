import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Ruler, Palette, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { products as staticProducts, categories as staticCategories } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface NormalizedProduct {
  id: string;
  name: { lv: string; en: string };
  category: string;
  categoryName: { lv: string; en: string };
  description: { lv: string; en: string };
  longDescription: { lv: string; en: string };
  material?: string;
  colors: { name: string; hex?: string }[];
  sizes: string[];
  minOrder?: number;
  images: string[];
  isNew: boolean;
  printingTechs: string[];
  retailPrice?: number;
  wholesalePrice?: number;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const [product, setProduct] = useState<NormalizedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, sort_order), product_colors(name, hex_code), product_sizes(size, sort_order), categories(slug, name_lv, name_en)")
        .eq("id", id!)
        .maybeSingle();

      if (data) {
        const p = data as any;
        setProduct({
          id: p.id,
          name: { lv: p.name_lv, en: p.name_en },
          category: p.categories?.slug || "",
          categoryName: { lv: p.categories?.name_lv || "", en: p.categories?.name_en || "" },
          description: { lv: p.description_lv || "", en: p.description_en || "" },
          longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
          material: p.material || undefined,
          colors: (p.product_colors || []).map((c: any) => ({ name: c.name, hex: c.hex_code })),
          sizes: (p.product_sizes || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((s: any) => s.size),
          minOrder: p.min_order || undefined,
          images: (p.product_images || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)).map((i: any) => i.url),
          isNew: p.is_new || false,
          printingTechs: p.printing_techs || [],
          retailPrice: p.retail_price || undefined,
          wholesalePrice: p.wholesale_price || undefined,
        });
      } else {
        // Fallback to static
        const sp = staticProducts.find(p => p.id === id);
        if (sp) {
          const cat = staticCategories.find(c => c.id === sp.category);
          setProduct({
            id: sp.id,
            name: sp.name,
            category: sp.category,
            categoryName: cat?.name || { lv: "", en: "" },
            description: sp.description,
            longDescription: sp.longDescription || sp.description,
            material: sp.material,
            colors: sp.colors.map(c => ({ name: c })),
            sizes: sp.sizes || [],
            minOrder: sp.minOrder,
            images: sp.images,
            isNew: sp.new || false,
            printingTechs: [],
          });
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("product.notFound")}</h1>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/catalog">{t("product.back")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Layout>
      <div className="container py-8 md:py-16">
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("product.back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-sm bg-muted">
              {product.images.length > 0 ? (
                <img src={product.images[activeImage]} alt={product.name[lang]} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden rounded-sm bg-muted ring-2 ${i === activeImage ? "ring-accent" : "ring-transparent"}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {product.categoryName[lang] && (
                <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">{product.categoryName[lang]}</p>
              )}
              <h1 className="mt-1 font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">{product.name[lang]}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.isNew && <Badge className="bg-accent text-accent-foreground font-heading text-[10px] uppercase tracking-widest">{t("product.new")}</Badge>}
                {product.printingTechs.map(tech => (
                  <Badge key={tech} variant="outline" className="text-[10px] uppercase tracking-wider">{tech}</Badge>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.longDescription[lang] || product.description[lang]}</p>

            <div className="space-y-4 rounded-sm border border-border p-5">
              {product.material && (
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("product.material")}</p>
                    <p className="text-sm text-muted-foreground">{product.material}</p>
                  </div>
                </div>
              )}
              {product.sizes.length > 0 && (
                <div className="flex items-start gap-3">
                  <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("product.sizes")}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {product.sizes.map((s) => (
                        <span key={s} className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {product.colors.length > 0 && (
                <div className="flex items-start gap-3">
                  <Palette className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("product.colors")}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5">
                          {c.hex && <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />}
                          <span className="text-xs text-muted-foreground">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {product.minOrder && (
                <p className="text-sm text-muted-foreground">
                  {t("product.minOrder")}: <span className="font-medium text-foreground">{product.minOrder} {t("product.pieces")}</span>
                </p>
              )}
            </div>

            {/* Social sharing */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{lang === "lv" ? "Dalīties:" : "Share:"}</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"><Linkedin className="h-4 w-4" /></a>
              <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"><Share2 className="h-4 w-4" /></button>
            </div>

            {/* Quote form */}
            <div className="rounded-sm border border-accent/30 bg-accent/5 p-5 space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                {lang === "lv" ? "Pieprasīt cenu" : "Request a Quote"}
              </h3>
              <QuoteRequestForm productId={product.id} productName={product.name[lang]} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
