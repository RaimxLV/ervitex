import { useMemo, useState } from "react";
import { Trash2, Plus, Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CatalogOverride } from "@/hooks/useSiteEditor";

interface Props {
  source: string;
  itemId: string;
  fallbackName?: string | null;
  fallbackImage?: string | null;
  existing?: CatalogOverride;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

/**
 * Inline (on-site) product editor for admins. Stores only the fields the admin
 * actually changes — supplier data stays untouched and keeps syncing.
 */
const CatalogOverrideDialog = ({ source, itemId, fallbackName, fallbackImage, existing, onClose, onSaved }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [nameLv, setNameLv] = useState(existing?.name_lv ?? "");
  const [nameEn, setNameEn] = useState(existing?.name_en ?? "");
  const [descLv, setDescLv] = useState(existing?.description_lv ?? "");
  const [descEn, setDescEn] = useState(existing?.description_en ?? "");
  const [images, setImages] = useState<string[]>(existing?.extra_images ?? []);
  const [newImage, setNewImage] = useState("");
  const [price, setPrice] = useState(existing?.price_override != null ? String(existing.price_override) : "");
  const [hidePrice, setHidePrice] = useState(!!existing?.hide_price);
  const [hidden, setHidden] = useState(!!existing?.hidden);
  const [uploading, setUploading] = useState(false);

  const preview = useMemo(() => images[0] || fallbackImage || null, [images, fallbackImage]);

  const addImage = () => {
    const url = newImage.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setNewImage("");
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${source}/${itemId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("quote-files").upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("quote-files").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (e: any) {
      toast({ title: "Neizdevās augšupielādēt", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      source,
      item_id: itemId,
      name_lv: nameLv.trim() || null,
      name_en: nameEn.trim() || null,
      description_lv: descLv.trim() || null,
      description_en: descEn.trim() || null,
      extra_images: images,
      hidden_images: existing?.hidden_images ?? [],
      price_override: price.trim() ? Number(price.replace(",", ".")) : null,
      hide_price: hidePrice,
      hidden,
    };
    const { error } = await supabase.from("catalog_overrides" as any).upsert(payload as any, { onConflict: "source,item_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Saglabāt neizdevās", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saglabāts", description: "Izmaiņas ir redzamas mājaslapā." });
    await onSaved();
  };

  const reset = async () => {
    setSaving(true);
    const { error } = await supabase.from("catalog_overrides" as any).delete().eq("source", source).eq("item_id", itemId);
    setSaving(false);
    if (error) {
      toast({ title: "Neizdevās atcelt", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Atgriezts piegādātāja saturs" });
    await onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-base uppercase tracking-wider">
            Rediģēt preci · {fallbackName || itemId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-sm border border-border bg-muted/40 p-3">
            {preview ? (
              <img src={preview} alt="" className="h-16 w-16 object-contain" />
            ) : (
              <div className="h-16 w-16 bg-muted" />
            )}
            <div className="min-w-0 text-xs text-muted-foreground">
              <p className="font-mono text-foreground">{itemId}</p>
              <p className="uppercase tracking-wider">{source}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Nosaukums (LV)</Label>
              <Input value={nameLv} onChange={(e) => setNameLv(e.target.value)} placeholder={fallbackName || ""} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Nosaukums (EN)</Label>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={fallbackName || ""} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Apraksts (LV)</Label>
              <Textarea rows={5} value={descLv} onChange={(e) => setDescLv(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Apraksts (EN)</Label>
              <Textarea rows={5} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider">Papildu bildes (rādās pirmās)</Label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative h-20 w-20 border border-border">
                    <img src={url} alt="" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-0 top-0 bg-destructive p-1 text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="https://... bildes saite" />
              <Button type="button" variant="outline" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => uploadFiles(e.target.files)} />
            {uploading && <p className="text-xs text-muted-foreground">Augšupielādē...</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider">Cena bez PVN (pārrakstīt)</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="piem. 12.50" inputMode="decimal" />
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-3 rounded-sm border border-border p-2.5">
                <span className="text-sm">Cena pēc pieprasījuma</span>
                <Switch checked={hidePrice} onCheckedChange={setHidePrice} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-sm border border-border p-2.5">
                <span className="text-sm">Paslēpt no kataloga</span>
                <Switch checked={hidden} onCheckedChange={setHidden} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {existing ? (
            <Button variant="ghost" onClick={reset} disabled={saving} className="text-destructive">
              Atgriezt oriģinālu
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Atcelt</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Saglabāt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogOverrideDialog;
