import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { useLanguage } from "@/i18n/LanguageContext";
import { SOURCE_META, type CatalogSource } from "./unifiedCatalogMeta";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: CatalogSource;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image: string | null;
  swatches?: { hex: string | null; name: string }[];
  descriptionFallback?: string | null;
}

const CatalogItemDialog = ({
  open, onOpenChange, source, id, name, brand, category, image, swatches, descriptionFallback,
}: Props) => {
  const { lang } = useLanguage();
  const [description, setDescription] = useState<string | null>(descriptionFallback ?? null);
  const [imgIndex, setImgIndex] = useState(0);
  const [images, setImages] = useState<string[]>(image ? [image] : []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("catalog_items" as any)
        .select("description,image_url,colors")
        .eq("source", source)
        .eq("id", id)
        .maybeSingle();
      if (cancelled || !data) return;
      const d = data as any;
      if (d.description) setDescription(d.description);
      const urls: string[] = [];
      if (d.image_url) urls.push(d.image_url);
      for (const c of (d.colors || []) as { u: string | null }[]) {
        if (c.u && !urls.includes(c.u)) urls.push(c.u);
      }
      if (urls.length) setImages(urls);
    })();
    return () => { cancelled = true; };
  }, [open, source, id]);

  const currentImg = images[imgIndex] || image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] uppercase">{id}</Badge>
            <Badge className="text-[10px] uppercase">{SOURCE_META[source].label}</Badge>
            {brand && <Badge variant="secondary" className="text-[10px] uppercase">{brand}</Badge>}
            {category && <Badge variant="outline" className="text-[10px] uppercase">{category}</Badge>}
          </div>
          <DialogTitle className="font-heading text-xl uppercase tracking-wide">
            {name || id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="aspect-[3/4] w-full overflow-hidden bg-white">
              {currentImg ? (
                <img src={currentImg} alt={name || id} className="h-full w-full object-contain p-2" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {lang === "lv" ? "Bez attēla" : "No image"}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-2 grid grid-cols-6 gap-1">
                {images.slice(0, 12).map((u, i) => (
                  <button
                    key={u + i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`aspect-square overflow-hidden border ${i === imgIndex ? "border-accent" : "border-border"} bg-white`}
                  >
                    <img src={u} alt="" className="h-full w-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {description && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
            {swatches && swatches.length > 0 && (
              <div>
                <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider">
                  {lang === "lv" ? "Krāsas" : "Colors"} ({swatches.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {swatches.map((s, i) => (
                    <span
                      key={i}
                      title={s.name}
                      className="inline-block h-6 w-6 rounded-full border border-black/20"
                      style={{ backgroundColor: s.hex || "#ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">
                {lang === "lv" ? "Pieprasīt cenu" : "Request a Quote"}
              </h3>
              <QuoteRequestForm productId={`${source}-${id}`} productName={name || id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogItemDialog;
