import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

const SOURCES: { code: string; label: string; formula: string }[] = [
  { code: "nwg", label: "NWG (Craft, Clique, ProJob, Cutter & Buck)", formula: "līgumcena × 1,67 (bez PVN)" },
  { code: "ss", label: "Stanley/Stella", formula: "SS26 cenu lapas cena (jau ar uzcenojumu)" },
  { code: "mf", label: "Malfini", formula: "piegādātāja cena × 1,65" },
  { code: "pf", label: "PF Concept (prezentmateriāli)", formula: "piegādātāja cena × 1,65" },
  { code: "bb", label: "Beechfield / Bagbase", formula: "cenu lapas cena" },
  { code: "ru", label: "Russell Europe", formula: "piegādātāja cena × 1,65" },
];

interface Summary {
  source: string;
  variants: number;
  checked: number;
  mismatches: number;
  missing_base: number;
  max_diff: number;
}

interface Row {
  source: string;
  sku: string;
  style_code: string;
  base_price: number | null;
  expected: number | null;
  actual: number;
  diff: number | null;
}

const eur = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `${Number(n).toFixed(2)} €`;

const AdminPriceAudit = () => {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [coverage, setCoverage] = useState<{ source: string; models: number; priced: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [mismatches, setMismatches] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Row[] | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: sum }, { data: bad }, { data: upd }] = await Promise.all([
      supabase.rpc("price_audit_summary" as never),
      supabase.rpc("price_audit_mismatches" as never, { _limit: 200 } as never),
      supabase.from("catalog_price_ranges").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    ]);
    setSummary(((sum as unknown as Summary[]) || []).map((r) => ({ ...r, max_diff: Number(r.max_diff) })));
    setMismatches((bad as unknown as Row[]) || []);
    setLastRefresh(upd?.[0]?.updated_at ?? null);

    const cov: { source: string; models: number; priced: number }[] = [];
    for (const s of SOURCES) {
      const [models, priced] = await Promise.all([
        supabase.from("catalog_items" as never).select("id", { count: "exact", head: true }).eq("source", s.code),
        supabase.from("catalog_price_ranges").select("style_code", { count: "exact", head: true }).eq("source", s.code),
      ]);
      cov.push({ source: s.code, models: models.count ?? 0, priced: priced.count ?? 0 });
    }
    setCoverage(cov);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return setSearchResult(null);
    const { data } = await supabase.rpc("price_audit_lookup" as never, { _q: q, _limit: 200 } as never);
    setSearchResult((data as unknown as Row[]) || []);
  };

  const renderRows = (rows: Row[]) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3">Katalogs</th>
            <th className="py-2 pr-3">SKU</th>
            <th className="py-2 pr-3">Modelis</th>
            <th className="py-2 pr-3">Piegādātāja cena</th>
            <th className="py-2 pr-3">Gaidāmā (ar uzcenojumu)</th>
            <th className="py-2 pr-3">Mājaslapā bez PVN</th>
            <th className="py-2 pr-3">Ar PVN 21 %</th>
            <th className="py-2 pr-3">Statuss</th>
            <th className="py-2 pr-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const ok = r.expected !== null && Math.abs(Number(r.expected) - Number(r.actual)) <= 0.02;
            return (
              <tr key={`${r.source}-${r.sku}`} className="border-b border-border/50">
                <td className="py-2 pr-3 text-xs uppercase">{r.source}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.sku}</td>
                <td className="py-2 pr-3 font-mono text-xs">{r.style_code}</td>
                <td className="py-2 pr-3">{eur(r.base_price)}</td>
                <td className="py-2 pr-3">{eur(r.expected)}</td>
                <td className="py-2 pr-3 font-semibold">{eur(r.actual)}</td>
                <td className="py-2 pr-3">{eur(Math.round(Number(r.actual) * 1.21 * 100) / 100)}</td>
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
                    to={`/catalog/item/${r.source}/${r.style_code}`}
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
              <td colSpan={9} className="py-6 text-center text-sm text-muted-foreground">
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
        Pilns audits: katrai precei (katram SKU) tiek pārrēķināta piegādātāja cena ar uzcenojumu un salīdzināta ar
        cenu mājaslapā. PVN 21 % tiek pievienots tikai attēlojumā.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Palaist auditu
        </Button>
        {lastRefresh && (
          <p className="self-center text-xs text-muted-foreground">
            Pēdējais cenu pārrēķins: {new Date(lastRefresh).toLocaleString("lv-LV")}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Pilns audits pa katalogiem</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3">Katalogs</th>
                <th className="py-2 pr-3">Modeļi</th>
                <th className="py-2 pr-3">Ar cenu</th>
                <th className="py-2 pr-3">Pārbaudītas preces (SKU)</th>
                <th className="py-2 pr-3">Nesakrīt</th>
                <th className="py-2 pr-3">Bez piegādātāja cenas</th>
                <th className="py-2 pr-3">Lielākā atšķirība</th>
                <th className="py-2 pr-3">Formula</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((s) => {
                const c = coverage.find((x) => x.source === s.code);
                const a = summary.find((x) => x.source === s.code);
                const bad = a?.mismatches ?? 0;
                return (
                  <tr key={s.code} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium text-foreground">{s.label}</td>
                    <td className="py-2 pr-3">{c?.models ?? "—"}</td>
                    <td className="py-2 pr-3">{c?.priced ?? "—"}</td>
                    <td className="py-2 pr-3">{a?.checked ?? "—"}</td>
                    <td className={`py-2 pr-3 font-semibold ${bad > 0 ? "text-destructive" : "text-green-500"}`}>
                      {a ? bad : "—"}
                    </td>
                    <td className="py-2 pr-3">{a?.missing_base ?? "—"}</td>
                    <td className="py-2 pr-3">{a ? eur(a.max_diff) : "—"}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{s.formula}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">
          Preces, kur cena nesakrīt ({mismatches.length})
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Rādīts līdz 200 lielākajām atšķirībām. Ja saraksts ir tukšs, visas cenas atbilst formulai (pielaide 2 centi).
        </p>
        {renderRows(mismatches)}
      </div>

      <div className="mt-6 rounded-sm border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Pārbaudīt konkrētu preci</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Modeļa numurs vai SKU, piem. 040235 vai STAU116"
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
