import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { money } from "@/lib/offer";
import { thumbUrl } from "@/lib/imageProxy";
import { categoryFromName, isCoarseCategory } from "@/lib/catalogCategory";
import { COLOR_BUCKETS, bucketOf, getBucket, type ColorBucketKey } from "@/lib/colorBuckets";
import type { WorksheetItem } from "@/lib/worksheet";
import { fetchVariantPrices, sizeIdx, type VariantPrice } from "./useVariants";
import { ArrowLeft, Loader2, Plus, Repeat, Search, X } from "lucide-react";

export interface SwapPayload {
  source: string;
  productId: string;
  name: string;
  code: string;
  brand: string | null;
  image: string | null;
  colorName: string | null;
  colorHex: string | null;
  priceBySize: Map<string, number | null>;
}

interface ColorEntry { c?: string | null; n?: string | null; h?: string | null; u?: string | null }

interface Row {
  source: string;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  colors: ColorEntry[] | null;
}

interface Model extends Row {
  label: string;
  cat: string | null;
  buckets: Set<ColorBucketKey>;
}

const CAT_LV: Record<string, string> = {
  "T-shirts": "T-krekli",
  Polos: "Polo krekli",
  Hoodies: "Jakas ar kapuci",
  Sweaters: "Džemperi",
  Jackets: "Jakas",
  Vests: "Vestes",
  "Caps & Hats": "Cepures",
  Bags: "Somas",
  "Tote Bags": "Auduma somas",
  Backpacks: "Mugursomas",
  Shorts: "Šorti",
  Trousers: "Bikses",
  Bottles: "Pudeles",
  Mugs: "Krūzes",
  Towels: "Dvieļi",
  Socks: "Zeķes",
  Umbrellas: "Lietussargi",
  Notebooks: "Blociņi",
  Aprons: "Priekšauti",
  Gloves: "Cimdi",
};
const catLabel = (c: string) => CAT_LV[c] || c;

let CACHE: Model[] | null = null;

const loadModels = async (): Promise<Model[]> => {
  if (CACHE) return CACHE;
  const rows: Row[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("catalog_items" as never)
      .select("source,id,name,brand,category,image_url,colors")
      .order("id", { ascending: true })
      .range(from, from + 999);
    if (error || !data) break;
    rows.push(...(data as unknown as Row[]));
    if (data.length < 1000) break;
    from += 1000;
  }
  const models = rows.map((r) => {
    const raw = (r.category || "").trim();
    const cat = !raw || isCoarseCategory(raw) ? categoryFromName(r.name) || raw || null : raw;
    const buckets = new Set<ColorBucketKey>();
    for (const c of r.colors || []) {
      const b = bucketOf(c?.h ?? null, c?.n ?? null);
      if (b) buckets.add(b);
    }
    return { ...r, label: r.name || r.id, cat, buckets };
  });
  CACHE = models;
  return models;
};

interface Props {
  mode: "add" | "swap";
  target?: WorksheetItem | null;
  onAdd?: (items: WorksheetItem[]) => void;
  onSwap?: (next: SwapPayload) => void;
  onClose: () => void;
}

const Chip = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-sm border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
      active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-accent hover:text-accent"
    }`}
  >
    {children}
  </button>
);

const WorksheetCatalog = ({ mode, target, onAdd, onSwap, onClose }: Props) => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [bucket, setBucket] = useState<ColorBucketKey | null>(null);
  const [limit, setLimit] = useState(24);

  const [picked, setPicked] = useState<Model | null>(null);
  const [prices, setPrices] = useState<VariantPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [color, setColor] = useState<string | null>(null);
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadModels();
      if (!alive) return;
      setModels(list);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return models.filter((m) => {
      if (cat && m.cat !== cat) return false;
      if (brand && (m.brand || "") !== brand) return false;
      if (bucket && !m.buckets.has(bucket)) return false;
      if (term && !(m.label.toLowerCase().includes(term) || m.id.toLowerCase().includes(term) || (m.brand || "").toLowerCase().includes(term))) return false;
      return true;
    });
  }, [models, q, cat, brand, bucket]);

  const cats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of models) if (m.cat) counts.set(m.cat, (counts.get(m.cat) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([c]) => c);
  }, [models]);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of filtered) if (m.brand) counts.set(m.brand, (counts.get(m.brand) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([c]) => c);
  }, [filtered]);

  const buckets = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const m of filtered) for (const b of m.buckets) counts.set(b, (counts.get(b) || 0) + 1);
    return COLOR_BUCKETS.filter((b) => counts.get(b.key));
  }, [filtered]);

  useEffect(() => { setLimit(24); }, [q, cat, brand, bucket]);

  const pick = async (m: Model) => {
    setPicked(m);
    setQtyBySize({});
    setColor(m.colors?.[0]?.c ?? null);
    setLoadingPrices(true);
    const rows = await fetchVariantPrices(m.source, m.id);
    setPrices(rows);
    setLoadingPrices(false);
  };

  const colorRows = useMemo(() => (picked?.colors || []).filter((c) => c?.n || c?.c), [picked]);

  const sizeRows = useMemo(() => {
    const forColor = prices.filter((p) => !color || !p.color_code || p.color_code === color);
    const map = new Map<string, number | null>();
    for (const p of forColor.length ? forColor : prices) {
      const s = p.size || "-";
      const price = Number(p.retail_price);
      if (!map.has(s) || (map.get(s) ?? 0) < price) map.set(s, Number.isFinite(price) && price > 0 ? price : null);
    }
    if (map.size === 0) map.set("-", null);
    return [...map.entries()]
      .map(([size, price]) => ({ size, price }))
      .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
  }, [prices, color]);

  const chosen = colorRows.find((c) => c.c === color) || colorRows[0] || null;

  const confirm = () => {
    if (!picked) return;
    if (mode === "swap") {
      onSwap?.({
        source: picked.source,
        productId: picked.id,
        name: picked.label,
        code: picked.id,
        brand: picked.brand,
        image: chosen?.u || picked.image_url || null,
        colorName: chosen?.n || null,
        colorHex: chosen?.h || null,
        priceBySize: new Map(sizeRows.map((r) => [r.size, r.price])),
      });
      onClose();
      return;
    }
    const lines: WorksheetItem[] = sizeRows
      .filter((r) => (qtyBySize[r.size] || 0) > 0)
      .map((r) => ({
        id: `${picked.source}-${picked.id}-${chosen?.c || "x"}-${r.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        source: picked.source,
        productId: picked.id,
        name: picked.label,
        code: picked.id,
        brand: picked.brand,
        image: chosen?.u || picked.image_url || null,
        colorName: chosen?.n || null,
        colorHex: chosen?.h || null,
        size: r.size === "-" ? null : r.size,
        qty: qtyBySize[r.size],
        unitPrice: r.price ?? null,
        prints: [],
      }));
    if (lines.length === 0) return;
    onAdd?.(lines);
    onClose();
  };

  const canConfirm = mode === "swap" ? !!picked : sizeRows.some((r) => (qtyBySize[r.size] || 0) > 0);

  /* ---------- izvēlētā prece ---------- */
  if (picked) {
    return (
      <section className="rounded-md border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPicked(null)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Katalogs
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Aizvērt">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row">
          <img
            src={thumbUrl(chosen?.u || picked.image_url, 500) || undefined}
            alt={picked.label}
            className="h-48 w-48 shrink-0 self-center rounded-sm border border-border object-contain p-2 sm:self-start"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-black uppercase leading-tight">{picked.label}</h2>
            <p className="text-xs text-muted-foreground">{[picked.id, picked.brand, picked.cat && catLabel(picked.cat)].filter(Boolean).join(" · ")}</p>

            {colorRows.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {colorRows.map((c) => (
                  <button
                    key={(c.c || c.n) as string}
                    type="button"
                    title={c.n || ""}
                    onClick={() => setColor(c.c ?? null)}
                    className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${color === c.c ? "border-accent" : "border-border"}`}
                  >
                    <span className="h-3 w-3 rounded-full border border-border" style={{ background: c.h || "#ccc" }} />
                    {c.n}
                  </button>
                ))}
              </div>
            )}

            {loadingPrices ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Ielādē izmērus…
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {sizeRows.map((r) => (
                  <div key={r.size} className="rounded-sm border border-border p-2">
                    <p className="text-xs font-semibold">{r.size}</p>
                    <p className="text-[11px] text-muted-foreground">{r.price ? money(r.price) : "cena pēc pieprasījuma"}</p>
                    {mode === "add" && (
                      <Input
                        type="number"
                        min={0}
                        className="mt-1 h-8"
                        value={qtyBySize[r.size] ?? ""}
                        onChange={(e) => setQtyBySize({ ...qtyBySize, [r.size]: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button className="mt-4" onClick={confirm} disabled={!canConfirm}>
              {mode === "swap" ? <Repeat className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {mode === "swap" ? "Nomainīt" : "Pievienot sarakstam"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- katalogs ---------- */
  return (
    <section className="rounded-md border border-border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-black uppercase tracking-wide">
            {mode === "swap" ? "Mainīt modeli" : "Katalogs"}
          </h2>
          {mode === "swap" && target && (
            <p className="truncate text-xs text-muted-foreground">
              {[target.name, target.colorName, target.size, `${target.qty} gab.`].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Aizvērt">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Meklēt" />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!cat} onClick={() => setCat(null)}>Visas</Chip>
          {cats.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{catLabel(c)}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => (
            <Chip key={b} active={brand === b} onClick={() => setBrand(brand === b ? null : b)}>{b}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {buckets.map((b) => (
            <button
              key={b.key}
              type="button"
              title={b.lv}
              onClick={() => setBucket(bucket === b.key ? null : b.key)}
              className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] ${bucket === b.key ? "border-accent text-accent" : "border-border"}`}
            >
              <span className="h-3 w-3 rounded-full border border-border" style={{ background: getBucket(b.key).hex }} />
              {b.lv}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {loading ? "Ielādē katalogu…" : `${filtered.length} preces`}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.slice(0, limit).map((m) => (
              <button
                key={`${m.source}-${m.id}`}
                type="button"
                onClick={() => pick(m)}
                className="group overflow-hidden rounded-sm border border-border bg-background text-left transition-colors hover:border-accent"
              >
                <span className="flex aspect-square items-center justify-center bg-muted/30 p-2">
                  {m.image_url ? (
                    <img src={thumbUrl(m.image_url, 400) || undefined} alt={m.label} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[11px] text-muted-foreground">nav bildes</span>
                  )}
                </span>
                <span className="block p-2">
                  <span className="block truncate text-xs font-semibold">{m.label}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{[m.id, m.brand].filter(Boolean).join(" · ")}</span>
                  {m.colors && m.colors.length > 0 && (
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {m.colors.slice(0, 8).map((c, n) => (
                        <span key={n} className="h-2.5 w-2.5 rounded-full border border-border" style={{ background: c?.h || "#ccc" }} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {filtered.length > limit && (
            <Button variant="outline" className="mt-4 w-full" onClick={() => setLimit((l) => l + 24)}>
              Rādīt vairāk
            </Button>
          )}
        </>
      )}
    </section>
  );
};

export default WorksheetCatalog;
