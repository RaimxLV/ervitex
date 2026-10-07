import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react";
import { techs, defaultImageRefs, resolveImageRef } from "@/data/technologies";
import { applyTechGalleries } from "@/hooks/useTechGalleries";

type Galleries = Record<string, string[]>;

/** Downscale to max 2000 px and re-encode as WebP before upload. */
async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/webp", 0.82));
}

const AdminGalleries = () => {
  const [galleries, setGalleries] = useState<Galleries>(() => ({ ...defaultImageRefs }));
  const [active, setActive] = useState(techs[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("tech_galleries" as never).select("tech_id,images").then(({ data }) => {
      const next: Galleries = { ...defaultImageRefs };
      for (const row of (data as unknown as { tech_id: string; images: string[] }[]) ?? []) next[row.tech_id] = row.images;
      setGalleries(next);
      setLoading(false);
    });
  }, []);

  const persist = async (next: Galleries, changed: string[]) => {
    const prev = galleries;
    setGalleries(next);
    setSaving(true);
    const rows = changed.map((tech_id) => ({ tech_id, images: next[tech_id] }));
    const { error } = await supabase.from("tech_galleries" as never).upsert(rows as never);
    setSaving(false);
    if (error) { setGalleries(prev); toast.error("Neizdevās saglabāt"); return; }
    applyTechGalleries(rows);
  };

  const list = galleries[active] ?? [];
  const update = (images: string[]) => persist({ ...galleries, [active]: images }, [active]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const copy = [...list];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    void update(copy);
  };

  const remove = (i: number) => {
    if (!confirm("Izdzēst šo bildi no galerijas?")) return;
    void update(list.filter((_, idx) => idx !== i));
  };

  const transfer = (i: number, target: string) => {
    const ref = list[i];
    void persist(
      { ...galleries, [active]: list.filter((_, idx) => idx !== i), [target]: [...(galleries[target] ?? []), ref] },
      [active, target],
    );
    toast.success(`Pārvietots uz: ${techs.find((t) => t.id === target)?.name.lv}`);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const added: string[] = [];
    setUploading(files.length);
    for (const file of Array.from(files)) {
      try {
        const blob = await toWebp(file);
        const path = `${active}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const { error } = await supabase.storage.from("gallery").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (error) throw error;
        added.push(supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl);
      } catch {
        toast.error(`Neizdevās augšupielādēt: ${file.name}`);
      }
      setUploading((n) => n - 1);
    }
    if (fileInput.current) fileInput.current.value = "";
    if (added.length) await update([...list, ...added]);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">Galerijas</h1>
        <div className="flex items-center gap-2">
          {(saving || uploading > 0) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button onClick={() => fileInput.current?.click()} disabled={uploading > 0 || loading}>
            <Upload className="mr-2 h-4 w-4" /> Pievienot bildes
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1">
        {techs.map((t) => (
          <Button key={t.id} size="sm" variant={t.id === active ? "default" : "outline"} onClick={() => setActive(t.id)}>
            {t.name.lv} <span className="ml-1.5 opacity-60">{galleries[t.id]?.length ?? 0}</span>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Ielādē...</div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((ref, i) => {
            const url = resolveImageRef(ref);
            return (
              <div
                key={`${ref}-${i}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIndex !== null) move(dragIndex, i); setDragIndex(null); }}
                className={`overflow-hidden rounded-sm border bg-card ${dragIndex === i ? "border-accent opacity-50" : "border-border"}`}
              >
                <div className="relative aspect-square cursor-grab bg-muted active:cursor-grabbing">
                  {url && <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />}
                  <span className="absolute left-1.5 top-1.5 rounded-sm bg-background/80 px-1.5 text-xs text-foreground">
                    {i === 0 ? "Titula" : i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1.5">
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Pa kreisi" disabled={i === 0} onClick={() => move(i, i - 1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Pa labi" disabled={i === list.length - 1} onClick={() => move(i, i + 1)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Select value="" onValueChange={(v) => transfer(i, v)}>
                    <SelectTrigger className="h-8 flex-1 px-2 text-xs"><SelectValue placeholder="Pārvietot" /></SelectTrigger>
                    <SelectContent>
                      {techs.filter((t) => t.id !== active).map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name.lv}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" aria-label="Dzēst" onClick={() => remove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGalleries;
