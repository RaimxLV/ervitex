import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

const SOURCES: { code: string; label: string; formula: string }[] = [
  { code: "nwg", label: "NWG (Craft, Clique, ProJob, Cutter & Buck)", formula: "līgumcena × 1,67 (bez PVN)" },
  { code: "ss", label: "Stanley/Stella", formula: "cenu lapa SS26 × 1,25" },
  { code: "mf", label: "Malfini", formula: "piegādātāja cena × 1,65 × 1,0165" },
  { code: "pf", label: "PF Concept (prezentmateriāli)", formula: "piegādātāja cena × uzcenojums × 1,0165" },
  { code: "bb", label: "Beechfield / Bagbase", formula: "cenu lapa" },
  { code: "ru", label: "Russell Europe", formula: "piegādātāja cena × 1,65" },
];

interface Coverage {
  source: string;
  models: number;
  priced: number;
}

interface Sample {
  sku: string;
  style_code: string;
  purchase_price: number | null;
  retail_price: number;
  expected: number | null;
}

const eur = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `${n.toFixed(2)} €`;

const AdminPriceAudit = () => {
  const [coverage, setCoverage] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Sample[] | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const loadCoverage = useCallback(async () => {
    setLoading(true);
    const rows: Coverage[] = [];
    for (const s of SOURCES) {
      const [models, priced] = await Promise.all([
        supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("source", s.code),
        supabase.from("catalog_price_ranges").select("style_code", { count: "exact", head: true }).eq("source", s.code),
      ]);
      rows.push({ source: s.code, models: models.count ?? 0, priced: priced.count ?? 0 });
    }
    setCoverage(rows);

    const { data: upd } = await supabase
      .from("catalog_price_ranges")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);
    setLastRefresh(upd?.[0]?.updated_at ?? null);
    setLoading(false);
  }, []);

  const loadSamples = useCallback(async () => {
    // Random-ish sample of NWG variants: compare supplier contract price with our price.
    const offset = Math.floor(Math.random() * 2000);
    const { data: prices } = await supabase
      .from("catalog_variant_prices")
      .select("sku,style_code,retail_price")
      .eq("source", "nwg")
      .range(offset, offset + 9);
    const skus = (prices ?? []).map((p) => p.sku);
    const { data: contracts } = await supabase
      .from("nwg_skus")
      .select("sku,purchase_price")
      .in("sku", skus);
    const map = new Map((contracts ?? []).map((c) => [c.sku, c.purchase_price as number | null]));
    setSamples(
      (prices ?? []).map((p) => {
        const pp = map.get(p.sku) ?? null;
        return {
          sku: p.sku,
          style_code: p.style_code,
          purchase_price: pp,
          retail_price: Number(p.retail_price),
          expected: pp === null ? null : Math.round(pp * 1.67 * 100) / 100,
        };
      }),
    );
  }, []);

  useEffect(() => {
    loadCoverage();
    loadSamples();
  }, [loadCoverage, loadSamples]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return setSearchResult(null);
    const { data: prices } = await supabase
      .from("catalog_variant_prices")
      .select("sku,style_code,retail_price,source")
      .eq("source", "nwg")
      .or(`style_code.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(25);
    const skus = (prices ?? []).map((p) => p.sku);
    const { data: contracts } = await supabase.from("nwg_skus").select("sku,purchase_price").in("sku", skus);
    const map = new Map((contracts ?? []).map((c) => [c.sku, c.purchase_price as number | null]));
    setSearchResult(
      (prices ?? []).map((p) => {
        const pp = map.get(p.sku) ?? null;
        return {
          sku: p.sku,
          style_code: p.style_code,
          purchase_price: pp,
          retail_price: Number(p.retail_price),
          expected: pp === null ? null : Math.round(pp * 1.67 * 100) / 100,
        };
      }),
    );
  };

  const renderRows = (rows: Sample[]) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3">SKU</th>
            <th className="py-2 pr-3">Modelis</th>
            <th className="py-2 pr-3">Piegādātāja cena</th>
            <th className="py-2 pr-3">× 1,67 (gaidāmā)</th>
            <th className="py-2 pr-3">Mājaslapā bez PVN</th>
            <th className="py-2 pr-3">Ar PVN 21 %</th>
            <th className="py-2 pr-3">Statuss</th>
            <th className="py-2 pr-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const ok = r.expected !== null && Math.abs(r.expected - r.retail_price) <= 0.02;
            return (
              <tr key={r.sku} className="border-b border-border/50">
                <td className="py-2 pr-3 font-mono text-xs">{r.sku}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.style_code}</td>
                <td className="py-2 pr-3">{eur(r.purchase_price)}</td>
                <td className="py-2 pr-3">{eur(r.expected)}</td>
                <td className="py-2 pr-3 font-semibold">{eur(r.retail_price)}</td>
                <td className="py-2 pr-3">{eur(Math.round(r.retail_price * 1.21 * 100) / 100)}</td>
                <td className="py-2 pr-3">
                  {ok ? (
                    <span className="inline-flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="h-4 w-4" /> Sakrīt
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Nesakrīt
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <Link
                    to={`/catalog/item/nwg/${r.style_code}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    Atvērt <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                Nav rezultātu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Cenu audits</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Šeit vari pats pārbaudīt, cik modeļiem katrā katalogā ir cena un vai cena mājaslapā precīzi atbilst
        piegādātāja cenai ar uzcenojumu. PVN 21 % tiek pievienots tikai attēlojumā.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => { loadCoverage(); loadSamples(); }} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atjaunot datus
        </Button>
        {lastRefresh && (
          <p className="self-center text-xs text-muted-foreground">
            Pēdējais cenu pārrēķins: {new Date(lastRefresh).toLocaleString("lv-LV")}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Cenu segums pa katalogiem</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Katalogs</th>
                <th className="py-2 pr-3">Modeļi katalogā</th>
                <th className="py-2 pr-3">Ar cenu</th>
                <th className="py-2 pr-3">Segums</th>
                <th className="py-2 pr-3">Formula</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => {
                const c = coverage.find((x) => x.source === s.code);
                const pct = c && c.models > 0 ? Math.round((c.priced / c.models) * 100) : 0;
                return (
                  <tr key={s.code} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium text-foreground">{s.label}</td>
                    <td className="py-2 pr-3">{c?.models ?? "—"}</td>
                    <td className="py-2 pr-3">{c?.priced ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <span className={pct >= 99 ? "text-green-500" : pct >= 80 ? "text-yellow-500" : "text-destructive"}>
                        {pct} %
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{s.formula}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">NWG cenu pārbaude — nejauša izlase</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Katra rinda salīdzina NWG līgumcenu ar to, ko rāda mājaslapa. “Sakrīt” nozīmē, ka atšķirība nav lielāka par 2 centiem.
        </p>
        {renderRows(samples)}
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Pārbaudīt konkrētu preci</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Modeļa numurs vai SKU, piem. 040235 vai 1916960"
            className="max-w-sm"
          />
          <Button size="sm" onClick={runSearch}>Pārbaudīt</Button>
        </div>
        {searchResult && renderRows(searchResult)}
      </div>
    </AdminLayout>
  );
};

export default AdminPriceAudit;
