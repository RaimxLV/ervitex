import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { CreateOfferButton } from "@/components/quote/CreateOfferButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { money, offerTotals, offerUrl, type OfferItem } from "@/lib/offer";
import { Trash2, Pencil, Link2 } from "lucide-react";

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
  sent: { label: "Nosūtīts", cls: "bg-accent/10 text-accent" },
  accepted: { label: "Apstiprināts", cls: "bg-secondary text-secondary-foreground" },
  closed: { label: "Slēgts", cls: "bg-foreground text-background" },
};

const AdminOffers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const { toast } = useToast();
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

  /** Viena poga: no groza izveido publicētu piedāvājumu un nokopē saiti e-pasta vēstulei. */
  const copyLinkFromCart = async () => {
    const items: OfferItem[] = cartItems.map((i) => ({
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
    }));
    const { data, error } = await supabase
      .from("pm_offers")
      .insert({ title: "Piedāvājums", items: items as any, status: "sent" })
      .select("token")
      .single();
    if (error || !data?.token) {
      return toast({ title: "Kļūda", description: error?.message, variant: "destructive" });
    }
    try {
      await navigator.clipboard.writeText(offerUrl(data.token));
      toast({ title: "Saite nokopēta" });
    } catch {
      toast({ title: "Neizdevās nokopēt", variant: "destructive" });
    }
    load();
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
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} piedāvājumi</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {cartItems.length > 0 && (
            <>
              <CreateOfferButton fromCart />
              <Button variant="outline" size="sm" onClick={copyLinkFromCart}>
                <Link2 className="mr-2 h-4 w-4" /> Kopēt piedāvājuma saiti
              </Button>
            </>
          )}
          <CreateOfferButton />
        </div>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Meklēt pēc klienta vai nosaukuma…"
        className="mt-6 max-w-sm"
      />

      <div className="mt-6 divide-y divide-border border-y border-border">
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_80px_130px_130px_150px] gap-4 bg-muted/50 p-4 text-xs font-semibold text-muted-foreground xl:grid"><span>Piedāvājums / klients</span><span>Statuss</span><span>Skaits</span><span>Bez PVN</span><span>Ar PVN</span><span /></div>
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nav piedāvājumu</p>
        ) : filtered.map((r) => {
          const totals = offerTotals(r.items || [], r.vat_rate);
          const st = STATUS[r.status] || STATUS.draft;
          return (
            <div key={r.id} className="grid gap-4 py-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_80px_130px_130px_150px] xl:items-center xl:px-4">
              <div className="min-w-0">
                <Link to={`/admin/offers/${r.id}`} className="break-words font-semibold text-foreground hover:text-accent">{r.title || "Bez nosaukuma"}</Link>
                <p className="mt-1 text-sm text-muted-foreground">{[r.client_name, r.client_company].filter(Boolean).join(" · ") || "Klients nav norādīts"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("lv")}</p>
              </div>
              <div><Badge className={st.cls}>{st.label}</Badge></div>
              <div className="text-sm tabular-nums">{totals.qty} gab.</div>
              <div className="text-sm tabular-nums"><span className="mr-2 text-xs text-muted-foreground xl:hidden">Bez PVN</span>{money(totals.net)}</div>
              <div className="text-sm font-semibold tabular-nums"><span className="mr-2 text-xs font-normal text-muted-foreground xl:hidden">Ar PVN</span>{money(totals.gross)}</div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/admin/offers/${r.id}`}><Pencil className="mr-2 h-3 w-3" /> Rediģēt</Link>
                </Button>
                <Button aria-label="Dzēst piedāvājumu" size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive">
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
