import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, PhoneCall } from "lucide-react";
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
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-accent transition-colors">{lang === "lv" ? "Sākums" : "Home"}</Link></li>
            <li className="text-muted-foreground/50">/</li>
            <li><Link to="/catalog" className="hover:text-accent transition-colors">{lang === "lv" ? "Katalogs" : "Catalog"}</Link></li>
            {product.categoryName[lang] && (
              <>
                <li className="text-muted-foreground/50">/</li>
                <li><Link to={`/catalog?category=${product.category}`} className="hover:text-accent transition-colors">{product.categoryName[lang]}</Link></li>
              </>
            )}
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{product.name[lang]}</li>
          </ol>
        </nav>

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
                className="rounded-sm border border-border p-2 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(product.name[lang] + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm border border-border p-2 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="rounded-sm border border-border p-2 hover:bg-muted transition-colors"
                aria-label={lang === "lv" ? "Kopēt saiti" : "Copy link"}
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
