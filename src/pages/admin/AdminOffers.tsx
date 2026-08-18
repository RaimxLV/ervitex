import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { money, offerTotals, type OfferItem } from "@/lib/offer";
import { Plus, Trash2, Pencil, ClipboardList } from "lucide-react";

interface Row {
  id: string;
  token: string;
  title: string;
  client_name: string;
  client_company: string | null;
  status: string;
  items: OfferItem[];
  vat_rate: number;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Melnraksts", cls: "bg-muted text-muted-foreground" },
  sent: { label: "Nosūtīts", cls: "bg-blue-500 text-white" },
  accepted: { label: "Apstiprināts", cls: "bg-emerald-600 text-white" },
  closed: { label: "Slēgts", cls: "bg-foreground text-background" },
};

const AdminOffers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: cartItems } = useQuoteCart();

  const load = async () => {
    const { data, error } = await supabase
      .from("pm_offers")
      .select("id,token,title,client_name,client_company,status,items,vat_rate,created_at")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else setRows((data as unknown as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (fromCart: boolean) => {
    const items: OfferItem[] = fromCart
      ? cartItems.map((i) => ({
          id: i.id,
          source: i.source,
          productId: i.productId,
          name: i.name,
          code: i.code,
          brand: i.brand,
          image: i.image,
          colorName: i.colorName,
          colorHex: i.colorHex,
          size: i.size,
          qty: i.qty,
          unitPrice: i.unitPrice ?? null,
        }))
      : [];
    const { data, error } = await supabase
      .from("pm_offers")
      .insert({ title: "Piedāvājums", items: items as any })
      .select("id")
      .single();
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    navigate(`/admin/offers/${data.id}`);
  };

  const remove = async (id: string) => {
    if (!confirm("Dzēst piedāvājumu?")) return;
    const { error } = await supabase.from("pm_offers").delete().eq("id", id);
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else load();
  };

  const filtered = rows.filter((r) =>
    !q.trim() ||
    [r.title, r.client_name, r.client_company].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-foreground">Piedāvājumi klientiem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saliec preču sarakstu klientam, saglabā un nosūti saiti pa e-pastu vai WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {cartItems.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => create(true)}>
              <ClipboardList className="mr-2 h-4 w-4" /> No pieprasījuma groza ({cartItems.length})
            </Button>
          )}
          <Button size="sm" onClick={() => create(false)}>
            <Plus className="mr-2 h-4 w-4" /> Jauns piedāvājums
          </Button>
        </div>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Meklēt pēc klienta vai nosaukuma…"
        className="mt-6 max-w-sm"
      />

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nav piedāvājumu</p>
        ) : filtered.map((r) => {
          const totals = offerTotals(r.items || [], r.vat_rate);
          const st = STATUS[r.status] || STATUS.draft;
          return (
            <div key={r.id} className="flex flex-col gap-3 rounded-sm border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{r.title || "Bez nosaukuma"}</p>
                  <Badge className={st.cls}>{st.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[r.client_name, r.client_company].filter(Boolean).join(" · ") || "Klients nav norādīts"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totals.qty} gab. · {money(totals.net)} bez PVN · {money(totals.gross)} ar PVN ·{" "}
                  {new Date(r.created_at).toLocaleString("lv")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/admin/offers/${r.id}`}><Pencil className="mr-2 h-3 w-3" /> Rediģēt</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;
