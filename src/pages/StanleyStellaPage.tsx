import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/LanguageContext";

import stellaLogo from "@/assets/stella-dealer-logo-white.png";

interface LiveProduct {
  styleCode: string;
  name: string;
  shortDescription: string;
  category: string;
  gender: string;
  composition: string;
  segment: string;
  colors: { name: string; hex: string | null; image: string | null }[];
  sizes: string[];
  images: string[];
}

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const langCode = "en_GB"; // S/S API nepiedāvā lv
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stanley-stella-live?limit=24&lang=${langCode}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await res.json();

        if (!json.ok) throw new Error(json.error || "Failed to load");
        setProducts(json.products || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoaded(true);
      }
    })();
  }, [lang]);

  const heroCopy = lang === "lv"
    ? {
        eyebrow: "Oficiālais Stanley/Stella dīleris Latvijā",
        title: "Stanley/Stella",
        sub: "Beļģijas premium tekstilzīmols ar ētisku ražošanu un GOTS sertificētu bioloģisko kokvilnu. Pilna kolekcija pieejama caur Ervitex ar profesionālu apdruku un izšūšanu.",
        cta: "Skatīt visu kolekciju",
        contact: "Pieprasīt cenu",
        emptyTitle: "Nevarējām ielādēt kolekciju",
        emptySub: "Mēģini vēlreiz pēc brīža vai sazinies ar mums.",
        sectionTitle: "Aktuālā kolekcija",
        sectionSub: "Tieša pieslēgšanās Stanley/Stella API — tikai noliktavā esošās preces",
        sizesLabel: "Izmēri",
        colorsLabel: "Krāsas",
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
        emptyTitle: "Couldn't load the collection",
        emptySub: "Please try again in a moment or get in touch.",
        sectionTitle: "Current collection",
        sectionSub: "Live from the Stanley/Stella API — in-stock styles only",
        sizesLabel: "Sizes",
        colorsLabel: "Colors",
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
          </div>

          {!loaded ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden border border-border bg-card">
                  <Skeleton className="aspect-square w-full" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error || products.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border p-10 text-center">
              <h3 className="font-heading text-lg font-bold uppercase">{heroCopy.emptyTitle}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error || heroCopy.emptySub}</p>
              <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/contact">{heroCopy.contact}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
              {products.map((p) => (
                <article key={p.styleCode} className="group overflow-hidden border border-border bg-card transition-colors hover:border-accent">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                    <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
                      {p.styleCode}
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{p.name}</h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{p.shortDescription}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.colors.length} {heroCopy.colorsLabel.toLowerCase()} · {p.sizes.length} {heroCopy.sizesLabel.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StanleyStellaPage;
