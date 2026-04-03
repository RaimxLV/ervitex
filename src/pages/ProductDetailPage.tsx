import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, Ruler, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { products, categories } from "@/data/products";

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground">Product Not Found</h1>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/catalog">Back to Catalog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const category = categories.find((c) => c.id === product.category);

  return (
    <Layout>
      <div className="container py-8 md:py-16">
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-md bg-muted">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              {category && <p className="text-sm font-medium uppercase tracking-wider text-accent">{category.name}</p>}
              <h1 className="mt-1 font-heading text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              {product.new && <Badge className="mt-2 bg-accent text-accent-foreground">New Arrival</Badge>}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.longDescription || product.description}</p>

            <div className="space-y-4 rounded-lg border border-border p-5">
              {product.material && (
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Material</p>
                    <p className="text-sm text-muted-foreground">{product.material}</p>
                  </div>
                </div>
              )}
              {product.sizes && (
                <div className="flex items-start gap-3">
                  <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Available Sizes</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {product.sizes.map((s) => (
                        <span key={s} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Colors</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {product.colors.map((c) => (
                      <span key={c} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              {product.minOrder && (
                <p className="text-sm text-muted-foreground">
                  Minimum order: <span className="font-medium text-foreground">{product.minOrder} pieces</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="flex-1" asChild>
                <Link to="/contact">Request a Quote</Link>
              </Button>
              <Button size="lg" variant="outline" className="flex-1" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
