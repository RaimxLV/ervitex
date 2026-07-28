import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import CatalogItemDialog from "@/components/catalog/CatalogItemDialog";
import CatalogModelCard from "@/components/catalog/CatalogModelCard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { SOURCE_META, type CatalogSource } from "@/components/catalog/unifiedCatalogMeta";

interface RelatedItem {
  source: CatalogSource;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  hover_image_url: string | null;
}

const isValidSource = (s: string | undefined): s is CatalogSource =>
  !!s && ["ss", "nwg", "pf", "bb", "mf", "ru"].includes(s);


const CatalogItemPage = () => {
  const { source, id } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [meta, setMeta] = useState<RelatedItem | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);

  const validSource = isValidSource(source) ? source : null;

  // Load current item meta + related
  useEffect(() => {
    if (!validSource || !id) return;
    let cancelled = false;
    (async () => {
      const { data: current } = await supabase
        .from("catalog_items" as any)
        .select("source,id,name,brand,category,image_url,hover_image_url")
        .eq("source", validSource)
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      const cur = current as unknown as RelatedItem | null;
      setMeta(cur);

      if (cur?.category) {
        const { data: rel } = await supabase
          .from("catalog_items" as any)
          .select("source,id,name,brand,category,image_url,hover_image_url")
          .eq("source", validSource)
          .eq("category", cur.category)
          .neq("id", id)
          .limit(12);
        if (cancelled) return;
        setRelated(((rel || []) as unknown as RelatedItem[]).slice(0, 8));
      }
    })();
    return () => { cancelled = true; };
  }, [validSource, id]);

  const t = useMemo(
    () => ({
      back: lang === "lv" ? "Atpakaļ uz katalogu" : "Back to catalog",
      related: lang === "lv" ? "Saistītie un līdzīgi produkti" : "Related & similar products",
      notFound: lang === "lv" ? "Produkts nav atrasts." : "Product not found.",
    }),
    [lang]
  );

  if (!validSource || !id) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm text-muted-foreground">{t.notFound}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/catalog"))}
            className="font-heading text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t.back}
          </Button>
        </div>

        <CatalogItemDialog
          inline
          open
          onOpenChange={() => {}}
          source={validSource}
          id={id}
          name={meta?.name ?? null}
          brand={meta?.brand ?? null}
          category={meta?.category ?? null}
          image={meta?.image_url ?? null}
        />

        {related.length > 0 && (
          <section className="mt-12 border-t border-border pt-10">
            <h2 className="mb-6 font-heading text-lg font-bold uppercase tracking-wider">
              {t.related}
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((r) => (
                <CatalogModelCard
                  key={`${r.source}-${r.id}`}
                  onClick={() => navigate(`/catalog/item/${r.source}/${encodeURIComponent(r.id)}`)}
                  image={r.image_url}
                  hoverImage={r.hover_image_url}
                  imageAlt={r.name || r.id}
                  code={r.id}
                  brandBadge={r.brand && r.brand.toLowerCase() !== "unbranded" ? r.brand : SOURCE_META[r.source].label}
                  title={r.name || r.id}
                  subtitle={r.category}
                  swatches={[]}
                  extraSwatches={0}
                  noImageLabel={lang === "lv" ? "Bez attēla" : "No image"}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default CatalogItemPage;
