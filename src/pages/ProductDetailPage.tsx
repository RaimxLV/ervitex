import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, ExternalLink, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductSpecs from "@/components/product/ProductSpecs";
import RelatedProducts from "@/components/product/RelatedProducts";
import type { ColorVariant } from "@/components/product/ColorSwatchSelector";
import { products as staticProducts, categories as staticCategories } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface NormalizedProduct {
  id: string;
  name: { lv: string; en: string };
  category: string;
  categoryId: string;
  categoryName: { lv: string; en: string };
  description: { lv: string; en: string };
  longDescription: { lv: string; en: string };
  material?: string;
  colors: ColorVariant[];
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
  const [activeColorImage, setActiveColorImage] = useState<string | undefined>();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, sort_order), product_colors(name, hex_code, image_url), product_sizes(size, sort_order), categories(slug, name_lv, name_en)")
        .eq("id", id!)
        .maybeSingle();

      if (data) {
        const p = data as any;
        setProduct({
          id: p.id,
          name: { lv: p.name_lv, en: p.name_en },
          category: p.categories?.slug || "",
          categoryId: p.category_id || "",
          categoryName: { lv: p.categories?.name_lv || "", en: p.categories?.name_en || "" },
          description: { lv: p.description_lv || "", en: p.description_en || "" },
          longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
          material: p.material || undefined,
          colors: (p.product_colors || []).map((c: any) => ({
            name: c.name,
            hex: c.hex_code,
            imageUrl: c.image_url || undefined,
          })),
          sizes: (p.product_sizes || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((s: any) => s.size),
          minOrder: p.min_order || undefined,
          images: (p.product_images || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((i: any) => i.url),
          isNew: p.is_new || false,
          printingTechs: p.printing_techs || [],
          retailPrice: p.retail_price || undefined,
          wholesalePrice: p.wholesale_price || undefined,
        });
      } else {
        const sp = staticProducts.find((p) => p.id === id);
        if (sp) {
          const cat = staticCategories.find((c) => c.id === sp.category);
          setProduct({
            id: sp.id,
            name: sp.name,
            category: sp.category,
            categoryId: "",
            categoryName: cat?.name || { lv: "", en: "" },
            description: sp.description,
            longDescription: sp.longDescription || sp.description,
            material: sp.material,
            colors: sp.colors.map((c) => ({ name: c })),
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

  const handleColorSelect = useCallback((color: ColorVariant) => {
    setActiveColorImage(color.imageUrl);
  }, []);

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
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("product.back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Image Gallery with color-switching */}
          <ProductImageGallery
            images={product.images}
            alt={product.name[lang]}
            activeColorImage={activeColorImage}
          />

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.categoryName[lang] && (
                <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  {product.categoryName[lang]}
                </p>
              )}
              <h1 className="mt-1 font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">
                {product.name[lang]}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground font-heading text-[10px] uppercase tracking-widest">
                    {t("product.new")}
                  </Badge>
                )}
                {product.printingTechs.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-[10px] uppercase tracking-wider">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-muted-foreground leading-relaxed space-y-1">
              {(product.longDescription[lang] || product.description[lang])
                .split('\n')
                .filter((line: string) => line.trim() !== '')
                .map((line: string, i: number) => {
                  const renderInline = (text: string) => {
                    return text.split(/(\*\*[^*]+\*\*)/g).map((part: string, j: number) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>
                        : <span key={j}>{part}</span>
                    );
                  };
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-foreground font-semibold text-base mt-4 mb-1">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('• ')) {
                    return <div key={i} className="flex gap-2 ml-2"><span className="shrink-0">•</span><span>{renderInline(line.slice(2))}</span></div>;
                  }
                  return <p key={i} className="mb-2">{renderInline(line)}</p>;
                })}
            </div>

            {/* Specs with interactive color swatches */}
            <ProductSpecs
              material={product.material}
              sizes={product.sizes}
              colors={product.colors}
              minOrder={product.minOrder}
              onColorSelect={handleColorSelect}
            />

            {/* Pricing display */}
            {product.retailPrice && (
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-2xl font-black text-foreground">
                  €{product.retailPrice.toFixed(2)}
                </span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {lang === "lv" ? "ar PVN" : "incl. VAT"}
                </span>
              </div>
            )}

            {/* Social sharing */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {lang === "lv" ? "Dalīties:" : "Share:"}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Quote form */}
            <div className="rounded-sm border border-accent/30 bg-accent/5 p-5 space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                {lang === "lv" ? "Pieprasīt cenu" : "Request a Quote"}
              </h3>
              <QuoteRequestForm productId={product.id} productName={product.name[lang]} />
            </div>

            {/* Call button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-heading text-xs uppercase tracking-widest"
              asChild
            >
              <a href="tel:+37129475227">
                <PhoneCall className="mr-2 h-4 w-4" />
                {lang === "lv" ? "Zvanīt un konsultēties" : "Call & Consult"}
              </a>
            </Button>
          </div>
        </div>

        {product.categoryId && (
          <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
