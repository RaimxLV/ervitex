import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Ruler, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { products, categories } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const product = products.find((p) => p.id === id);

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

  const category = categories.find((c) => c.id === product.category);

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
              <img src={product.images[0]} alt={product.name[lang]} className="h-full w-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-sm bg-muted">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {category && <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">{category.name[lang]}</p>}
              <h1 className="mt-1 font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-3xl">{product.name[lang]}</h1>
              {product.new && <Badge className="mt-2 bg-accent text-accent-foreground font-heading text-[10px] uppercase tracking-widest">{t("product.new")}</Badge>}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.longDescription?.[lang] || product.description[lang]}</p>

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
              {product.sizes && (
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
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("product.colors")}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {product.colors.map((c) => (
                      <span key={c} className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              {product.minOrder && (
                <p className="text-sm text-muted-foreground">
                  {t("product.minOrder")}: <span className="font-medium text-foreground">{product.minOrder} {t("product.pieces")}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
                <Link to="/contact">{t("product.requestQuote")}</Link>
              </Button>
              <Button size="lg" variant="outline" className="flex-1 font-heading text-xs uppercase tracking-widest" asChild>
                <Link to="/contact">{t("product.contactUs")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
