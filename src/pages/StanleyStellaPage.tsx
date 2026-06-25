import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

interface DBProduct {
  id: string;
  name_lv: string; name_en: string;
  description_lv: string | null; description_en: string | null;
  long_description_lv: string | null; long_description_en: string | null;
  material: string | null; min_order: number | null;
  featured: boolean | null; is_new: boolean | null;
  category_id: string | null; printing_techs: string[] | null;
  retail_price: number | null; brand: string | null;
  hidden_manual: boolean | null; hide_when_oos: boolean | null; ss_in_stock: boolean | null;
  product_images: { url: string; sort_order: number | null }[];
  product_colors: { name: string; hex_code: string | null; image_url: string | null }[];
  product_sizes: { size: string; sort_order: number | null }[];
  categories: { slug: string; name_lv: string; name_en: string } | null;
}

const SS_BRANDS = ["stanley/stella", "stanley & stella", "stanley stella"];

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id, category_id, name_lv, name_en, description_lv, description_en, long_description_lv, long_description_en, material, min_order, retail_price, printing_techs, featured, is_new, brand, hidden_manual, hide_when_oos, ss_in_stock, product_images(url, sort_order), product_colors(name, hex_code, image_url), product_sizes(size, sort_order), categories(slug, name_lv, name_en)")
        .eq("active", true).eq("hidden_manual", false)
        .order("created_at", { ascending: false });
      const filtered = ((data as unknown as DBProduct[]) || [])
        .filter((p) => p.brand && SS_BRANDS.includes(p.brand.toLowerCase()))
        .filter((p) => !(p.hide_when_oos && p.ss_in_stock === false));
      setProducts(filtered);
      setLoaded(true);
    })();
  }, []);

  const normalized = useMemo(() => products.map((p) => ({
    id: p.id,
    name: { lv: p.name_lv, en: p.name_en },
    category: p.categories?.slug || "",
    description: { lv: p.description_lv || "", en: p.description_en || "" },
    longDescription: { lv: p.long_description_lv || "", en: p.long_description_en || "" },
    material: p.material || undefined,
    colors: p.product_colors.map((c) => c.name),
    colorHexCodes: p.product_colors.map((c) => c.hex_code),
    colorImageUrls: p.product_colors.map((c) => c.image_url || null),
    sizes: p.product_sizes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((s) => s.size),
    minOrder: p.min_order || undefined,
    images: p.product_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((i) => i.url),
    featured: p.featured || false,
    new: p.is_new || false,
    printingTechs: p.printing_techs || [],
    brand: p.brand || "",
    retailPrice: p.retail_price || 0,
  })), [products]);

  const heroCopy = lang === "lv"
    ? {
        eyebrow: "Oficiālais Stanley/Stella dīleris Latvijā",
        title: "Stanley/Stella",
        sub: "Belģijas premium tekstilzīmols ar ētisku ražošanu un GOTS sertificētu bioloģisko kokvilnu. Pilna kolekcija pieejama caur Ervitex ar profesionālu apdruku un izšūšanu.",
        cta: "Skatīt visu kolekciju",
        contact: "Pieprasīt cenu",
        emptyTitle: "Drīzumā šeit būs Stanley/Stella preces",
        emptySub: "Šobrīd importējam kolekciju. Sazinies, lai uzzinātu pieejamību.",
        sectionTitle: "Aktuālā kolekcija",
        sectionSub: "Izlase no Stanley/Stella sortimenta",
        why: [
          { t: "GOTS bioloģiskā kokvilna", d: "Sertificēti materiāli, sekojami no šķiedras līdz veikalam." },
          { t: "Fair Wear Foundation", d: "Ētiska ražošana Bangladešā ar pilnu caurredzamību." },
          { t: "Premium kvalitāte", d: "Belgian-design tekstils, kas iztur profesionālu apdruku." },
        ],
      }
    : {
        eyebrow: "Official Stanley/Stella dealer in Latvia",
        title: "Stanley/Stella",
        sub: "Belgian premium textile brand with ethical production and GOTS-certified organic cotton. Full collection available through Ervitex with professional printing and embroidery.",
        cta: "View full collection",
        contact: "Request a Quote",
        emptyTitle: "Stanley/Stella products coming soon",
        emptySub: "We're importing the collection. Get in touch for availability.",
        sectionTitle: "Current collection",
        sectionSub: "A selection from the Stanley/Stella range",
        why: [
          { t: "GOTS organic cotton", d: "Certified materials, traceable from fibre to store." },
          { t: "Fair Wear Foundation", d: "Ethical production in Bangladesh with full transparency." },
          { t: "Premium quality", d: "Belgian-designed textile built for professional printing." },
        ],
      };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="container px-4 py-16 md:py-24">
          <div className="flex flex-col gap-6 md:max-w-3xl">
            <img src={stellaLogo} alt="Stanley/Stella" className="h-8 w-auto opacity-90 md:h-10" />
            <p className="text-xs uppercase tracking-[0.25em] text-accent">{heroCopy.eyebrow}</p>
            <h1 className="font-heading text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
              {heroCopy.title}
            </h1>
            <p className="max-w-2xl text-base text-primary-foreground/70 md:text-lg">{heroCopy.sub}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/catalog?brand=Stanley%2FStella">{heroCopy.cta}</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">{heroCopy.contact}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-b border-border bg-background">
        <div className="container px-4 py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {heroCopy.why.map((w) => (
              <div key={w.t} className="rounded-sm border border-border p-6">
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider">{w.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-background">
        <div className="container px-4 py-12 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-wide md:text-3xl">{heroCopy.sectionTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{heroCopy.sectionSub}</p>
            </div>
            {loaded && normalized.length > 0 && (
              <Button asChild variant="outline">
                <Link to="/catalog?brand=Stanley%2FStella">{heroCopy.cta} →</Link>
              </Button>
            )}
          </div>

          {!loaded ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden border border-border bg-card">
                  <Skeleton className="aspect-square w-full" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : normalized.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border p-10 text-center">
              <h3 className="font-heading text-lg font-bold uppercase">{heroCopy.emptyTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{heroCopy.emptySub}</p>
              <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/contact">{heroCopy.contact}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3">
              {normalized.slice(0, 12).map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StanleyStellaPage;
