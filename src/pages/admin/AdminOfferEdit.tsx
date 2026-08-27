import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { money, offerTotals, offerPlainText, offerUrl, offerPath, type Offer, type OfferItem, PRINT_DISCLAIMER_LV } from "@/lib/offer";
import { PROJECT_MANAGERS, OFFICE_EMAIL } from "@/data/projectManagers";
import { ArrowLeft, Copy, ExternalLink, Mail, MessageCircle, Printer, Save, Search, Send, Trash2, Plus } from "lucide-react";


const SIZE_ORDER = ["3XS","2XS","XXS","XS","S","M","L","XL","XL/2XL","2XL","XXL","3XL","XXXL","4XL","5XL","6XL"];
const sizeIdx = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  if (i >= 0) return i;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? 100 + n : 900;
};

interface CatalogHit {
  source: string;
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  colors: { c?: string; n?: string; h?: string; u?: string }[] | null;
}

interface VariantPrice { color_code: string | null; size: string | null; retail_price: number }

const emptyOffer: Offer = {
  id: "", title: "", client_name: "", client_company: null, client_email: null, client_phone: null,
  note: null, status: "draft", vat_rate: 21, items: [], created_at: "", updated_at: "",
};

const AdminOfferEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer>(emptyOffer);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<"client" | "test" | null>(null);

  // --- product picker state
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<CatalogHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<CatalogHit | null>(null);
  const [prices, setPrices] = useState<VariantPrice[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});
  const debounce = useRef<number>();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("pm_offers").select("*").eq("id", id!).maybeSingle();
      if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
      else if (data) {
        const row = data as any;
        const me = PROJECT_MANAGERS.find((p) => p.email.toLowerCase() === (user?.email || "").toLowerCase());
        setOffer({
          ...row,
          items: (row.items || []) as OfferItem[],
          pm_email: row.pm_email || me?.email || user?.email || OFFICE_EMAIL,
          pm_name: row.pm_name || me?.name || "",
        });
      }
      setLoading(false);
    })();
  }, [id, user?.email]);


  // debounce search
  useEffect(() => {
    window.clearTimeout(debounce.current);
    if (q.trim().length < 2) { setHits([]); return; }
    setSearching(true);
    debounce.current = window.setTimeout(async () => {
      const term = q.trim();
      const { data } = await supabase
        .from("catalog_items" as any)
        .select("source,id,name,brand,image_url,colors")
        .or(`name.ilike.%${term}%,id.ilike.%${term}%`)
        .limit(25);
      setHits(((data || []) as unknown) as CatalogHit[]);
      setSearching(false);
    }, 300);
  }, [q]);

  const pick = async (hit: CatalogHit) => {
    setPicked(hit);
    setQtyBySize({});
    setActiveColor(hit.colors?.[0]?.c ?? null);
    const rows: VariantPrice[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("catalog_variant_prices" as any)
        .select("color_code,size,retail_price")
        .eq("source", hit.source)
        .eq("style_code", hit.id)
        .range(from, from + 999);
      if (error || !data) break;
      rows.push(...((data as unknown) as VariantPrice[]));
      if (data.length < 1000) break;
      from += 1000;
    }
    setPrices(rows);
  };

  const colorRows = useMemo(
    () => (picked?.colors || []).filter((c) => c?.n || c?.c),
    [picked],
  );

  const sizeRows = useMemo(() => {
    if (!picked) return [] as { size: string; price: number | null }[];
    const forColor = prices.filter((p) => !activeColor || !p.color_code || p.color_code === activeColor);
    const map = new Map<string, number | null>();
    for (const p of (forColor.length ? forColor : prices)) {
      const s = p.size || "-";
      const price = Number(p.retail_price);
      if (!map.has(s) || (map.get(s) ?? 0) < price) map.set(s, Number.isFinite(price) && price > 0 ? price : null);
    }
    if (map.size === 0) map.set("-", null);
    return [...map.entries()]
      .map(([size, price]) => ({ size, price }))
      .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
  }, [picked, prices, activeColor]);

  const addPicked = () => {
    if (!picked) return;
    const color = colorRows.find((c) => c.c === activeColor) || colorRows[0] || null;
    const lines: OfferItem[] = sizeRows
      .filter((r) => (qtyBySize[r.size] || 0) > 0)
      .map((r) => ({
        id: `${picked.source}-${picked.id}-${color?.c || "x"}-${r.size}-${Date.now()}-${r.size}`,
        source: picked.source,
        productId: picked.id,
        name: picked.name,
        code: picked.id,
        brand: picked.brand,
        image: color?.u || picked.image_url || null,
        colorName: color?.n || null,
        colorHex: color?.h || null,
        size: r.size === "-" ? null : r.size,
        qty: qtyBySize[r.size],
        unitPrice: r.price ?? null,
      }));
    if (lines.length === 0) {
      toast({ title: "Norādi daudzumu", variant: "destructive" });
      return;
    }
    setOffer((o) => ({ ...o, items: [...o.items, ...lines] }));
    setQtyBySize({});
    toast({ title: `Pievienots: ${lines.length} rindas` });
  };

  const patchItem = (itemId: string, patch: Partial<OfferItem>) =>
    setOffer((o) => ({ ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }));
  const removeItem = (itemId: string) =>
    setOffer((o) => ({ ...o, items: o.items.filter((i) => i.id !== itemId) }));

  const totals = offerTotals(offer.items, offer.vat_rate);

  const save = async (status?: string) => {
    setSaving(true);
    const next = { ...offer, status: status || offer.status };
    const { error } = await supabase
      .from("pm_offers")
      .update({
        title: next.title,
        client_name: next.client_name,
        client_company: next.client_company,
        client_email: next.client_email,
        client_phone: next.client_phone,
        note: next.note,
        status: next.status,
        vat_rate: next.vat_rate,
        pm_name: next.pm_name || null,
        pm_email: next.pm_email || null,
        items: next.items as any,
      } as any)
      .eq("id", offer.id);
    setSaving(false);
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    setOffer(next);
    toast({ title: status === "sent" ? "Saglabāts un gatavs sūtīšanai" : "Saglabāts" });
  };


  const link = offer.token ? offerUrl(offer.token) : "";

  // Any client-facing share must publish the link first (draft links do not work)
  const publish = async () => {
    if (offer.status === "draft") await save("sent");
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} nokopēts` });
    } catch {
      toast({ title: "Neizdevās nokopēt", variant: "destructive" });
    }
  };

  const whatsapp = async () => {
    await publish();
    const text = `${offer.client_name ? `Sveiki, ${offer.client_name}!\n\n` : ""}${offerPlainText(offer, "lv")}`;
    const phone = (offer.client_phone || "").replace(/[^\d]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const mail = async () => {
    await publish();
    const subject = offer.title || "Ervitex piedāvājums";
    const body = `${offer.client_name ? `Sveiki, ${offer.client_name}!\n\n` : ""}${offerPlainText(offer, "lv")}`;
    window.location.href = `mailto:${offer.client_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  // Real send through the platform email system
  const sendEmail = async (mode: "client" | "test") => {
    const to = mode === "client" ? (offer.client_email || "").trim() : (user?.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast({
        title: mode === "client" ? "Nav klienta e-pasta" : "Nav tava e-pasta",
        description: mode === "client" ? "Ievadi klienta e-pastu un saglabā." : "Pieslēdzies ar e-pasta kontu.",
        variant: "destructive",
      });
      return;
    }
    if (offer.items.length === 0) {
      toast({ title: "Piedāvājums ir tukšs", variant: "destructive" });
      return;
    }

    setSendingEmail(mode);
    // Publish the link first so the client can open it
    if (mode === "client") await save("sent");
    else await save();

    const t = offerTotals(offer.items, offer.vat_rate);
    const pmEmail = (offer.pm_email || user?.email || OFFICE_EMAIL).trim();
    const pmName = offer.pm_name || "";
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "pm-offer",
        recipientEmail: to,
        replyTo: pmEmail,
        idempotencyKey: `pm-offer-${offer.id}-${mode}-${Date.now()}`,
        templateData: {
          title: offer.title || "Ervitex piedāvājums",
          clientName: offer.client_name || "",
          note: offer.note || "",
          pmName,
          pmEmail,

          items: offer.items.map((i) => ({
            name: i.name,
            code: i.code,
            colorName: i.colorName,
            size: i.size,
            qty: i.qty,
            unitPrice: i.unitPrice ? money(i.unitPrice) : null,
            lineTotal: i.unitPrice ? money(i.unitPrice * i.qty) : "",
          })),
          totalQty: t.qty,
          net: money(t.net),
          vat: money(t.vat),
          gross: money(t.gross),
          vatRate: offer.vat_rate,
          url: offer.token ? offerUrl(offer.token) : "",
          disclaimer: PRINT_DISCLAIMER_LV,
          isTest: mode === "test",
        },
      },
    });
    setSendingEmail(null);
    if (error) toast({ title: "Neizdevās nosūtīt", description: error.message, variant: "destructive" });
    else toast({ title: mode === "test" ? `Tests nosūtīts uz ${to}` : `Piedāvājums nosūtīts: ${to}` });
  };


  if (loading) {
    return <AdminLayout><p className="py-10 text-center text-muted-foreground">Ielādē...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/offers"><ArrowLeft className="mr-2 h-4 w-4" /> Visi piedāvājumi</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> Saglabāt
          </Button>
          <Button size="sm" variant="outline" onClick={() => save("sent")} disabled={saving}>
            Publicēt saiti
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          {/* Client */}
          <section className="rounded-sm border border-border p-4 sm:p-5">
            <h2 className="font-heading text-sm font-black uppercase tracking-widest text-foreground">Piedāvājuma dati</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs">Nosaukums</Label>
                <Input value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })} placeholder="Piem. Komandas krekli — SIA Piemērs" />
              </div>
              <div>
                <Label className="text-xs">Klients</Label>
                <Input value={offer.client_name} onChange={(e) => setOffer({ ...offer, client_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Uzņēmums</Label>
                <Input value={offer.client_company || ""} onChange={(e) => setOffer({ ...offer, client_company: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">E-pasts</Label>
                <Input type="email" value={offer.client_email || ""} onChange={(e) => setOffer({ ...offer, client_email: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Telefons</Label>
                <Input value={offer.client_phone || ""} onChange={(e) => setOffer({ ...offer, client_phone: e.target.value })} placeholder="+371…" />
              </div>
              <div>
                <Label className="text-xs">PVN %</Label>
                <Input type="number" value={offer.vat_rate} onChange={(e) => setOffer({ ...offer, vat_rate: Number(e.target.value) || 0 })} />
              </div>


              <div>
                <Label className="text-xs">Projektu vadītājs (atbildes saņēmējs)</Label>
                <Select
                  value={offer.pm_email || OFFICE_EMAIL}
                  onValueChange={(v) =>
                    setOffer({
                      ...offer,
                      pm_email: v,
                      pm_name: PROJECT_MANAGERS.find((p) => p.email === v)?.name || (v === OFFICE_EMAIL ? "Ervitex birojs" : offer.pm_name || ""),
                    })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_MANAGERS.map((p) => (
                      <SelectItem key={p.email} value={p.email}>{p.name} · {p.email}</SelectItem>
                    ))}
                    <SelectItem value={OFFICE_EMAIL}>Ervitex birojs · {OFFICE_EMAIL}</SelectItem>
                    {offer.pm_email && !PROJECT_MANAGERS.some((p) => p.email === offer.pm_email) && offer.pm_email !== OFFICE_EMAIL && (
                      <SelectItem value={offer.pm_email}>{offer.pm_email}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px] text-muted-foreground">Klienta atbilde e-pastā nonāks šeit.</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Piezīme klientam</Label>
                <Textarea rows={3} value={offer.note || ""} onChange={(e) => setOffer({ ...offer, note: e.target.value })} placeholder="Apdrukas veids, izmērs, termiņi…" />
              </div>

            </div>
          </section>

          {/* Picker */}
          <section className="rounded-sm border border-border p-4 sm:p-5">
            <h2 className="font-heading text-sm font-black uppercase tracking-widest text-foreground">Pievienot preci</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Meklēt pēc nosaukuma vai koda…" />
            </div>

            {searching && <p className="mt-2 text-xs text-muted-foreground">Meklē…</p>}
            {hits.length > 0 && (
              <div className="mt-3 max-h-64 divide-y divide-border overflow-y-auto rounded-sm border border-border">
                {hits.map((h) => (
                  <button
                    key={`${h.source}-${h.id}`}
                    onClick={() => pick(h)}
                    className={`flex w-full items-center gap-3 p-2 text-left hover:bg-muted ${picked?.id === h.id && picked?.source === h.source ? "bg-muted" : ""}`}
                  >
                    {h.image_url && <img src={h.image_url} alt="" loading="lazy" className="h-10 w-10 rounded-sm object-cover" />}
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{h.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{h.id} · {h.brand || h.source.toUpperCase()}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {picked && (
              <div className="mt-4 rounded-sm border border-accent/50 bg-accent/5 p-3">
                <p className="text-sm font-medium text-foreground">{picked.name} <span className="text-muted-foreground">({picked.id})</span></p>

                {colorRows.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs">Krāsa</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colorRows.map((c) => (
                        <button
                          key={c.c || c.n}
                          onClick={() => setActiveColor(c.c ?? null)}
                          title={c.n}
                          className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${activeColor === c.c ? "border-accent bg-background" : "border-border"}`}
                        >
                          <span className="h-3 w-3 rounded-full border border-border" style={{ background: c.h || "#ccc" }} />
                          {c.n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {sizeRows.map((r) => (
                    <div key={r.size} className="rounded-sm border border-border bg-background p-2">
                      <p className="text-xs font-semibold text-foreground">{r.size}</p>
                      <p className="text-[11px] text-muted-foreground">{r.price ? money(r.price) : "cena pēc pieprasījuma"}</p>
                      <Input
                        type="number"
                        min={0}
                        className="mt-1 h-8"
                        value={qtyBySize[r.size] ?? ""}
                        onChange={(e) => setQtyBySize({ ...qtyBySize, [r.size]: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </div>
                  ))}
                </div>

                <Button size="sm" className="mt-3" onClick={addPicked}>
                  <Plus className="mr-2 h-4 w-4" /> Pievienot piedāvājumam
                </Button>
              </div>
            )}
          </section>

          {/* Items */}
          <section className="rounded-sm border border-border p-4 sm:p-5">
            <h2 className="font-heading text-sm font-black uppercase tracking-widest text-foreground">
              Preces ({totals.qty} gab.)
            </h2>
            {offer.items.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Vēl nav pievienota neviena prece.</p>
            ) : (
              <div className="mt-3 divide-y divide-border border-y border-border">
                {offer.items.map((i) => (
                  <div key={i.id} className="grid gap-1.5 py-2 sm:grid-cols-[1fr,70px,100px,110px,32px] sm:items-center sm:gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {i.image && <img src={i.image} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-sm object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] leading-tight text-foreground">{i.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {i.code}{i.colorName && ` · ${i.colorName}`}{i.size && ` · ${i.size}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Dzēst pozīciju"
                        onClick={() => removeItem(i.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive sm:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input type="number" min={1} value={i.qty} onChange={(e) => patchItem(i.id, { qty: Math.max(1, Number(e.target.value) || 1) })} className="h-8 px-2 text-center text-[13px]" />
                    <Input
                      type="number" step="0.01" min={0}
                      value={i.unitPrice ?? ""}
                      placeholder="cena"
                      onChange={(e) => patchItem(i.id, { unitPrice: e.target.value === "" ? null : Number(e.target.value) })}
                      className="h-8 px-2 text-[13px]"
                    />
                    <div className="text-right leading-tight">
                      <p className="text-[13px] font-medium text-foreground">{money((i.unitPrice || 0) * i.qty)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {money((i.unitPrice || 0) * i.qty * (1 + offer.vat_rate / 100))} ar PVN
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Dzēst pozīciju"
                      onClick={() => removeItem(i.id)}
                      className="hidden h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-destructive sm:flex"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-sm border border-border p-4">
            <h3 className="font-heading text-sm font-black uppercase tracking-widest">Kopsavilkums</h3>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Kopā bez PVN</dt><dd className="font-medium">{money(totals.net)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">PVN {offer.vat_rate}%</dt><dd>{money(totals.vat)}</dd></div>
              <div className="flex justify-between border-t border-border pt-1 text-base"><dt className="font-semibold">Kopā ar PVN</dt><dd className="font-black text-accent">{money(totals.gross)}</dd></div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{PRINT_DISCLAIMER_LV}</p>
          </div>

          <div className="rounded-sm border border-border p-4 space-y-2">
            <h3 className="font-heading text-sm font-black uppercase tracking-widest">Nosūtīt klientam</h3>
            {offer.status === "draft" && (
              <p className="text-xs text-amber-600">Saite darbosies tikai pēc “Publicēt saiti”.</p>
            )}
            <Input readOnly value={link} className="text-xs" onFocus={(e) => e.currentTarget.select()} />

            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => sendEmail("client")}
              disabled={sendingEmail !== null || saving}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendingEmail === "client" ? "Sūta…" : "Nosūtīt piedāvājumu klientam"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => sendEmail("test")}
              disabled={sendingEmail !== null || saving}
            >
              {sendingEmail === "test" ? "Sūta testu…" : `Nosūtīt testu${user?.email ? ` (${user.email})` : ""}`}
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Sūtot klientam, piedāvājums tiek saglabāts un saite automātiski publicēta.
            </p>

            <div className="grid grid-cols-2 gap-2">

              <Button size="sm" variant="outline" onClick={() => copy(link, "Links")}><Copy className="mr-2 h-3 w-3" /> Saite</Button>
              <Button size="sm" variant="outline" onClick={() => copy(offerPlainText(offer, "lv"), "Teksts")}><Copy className="mr-2 h-3 w-3" /> Teksts</Button>
              <Button size="sm" variant="outline" onClick={whatsapp}><MessageCircle className="mr-2 h-3 w-3" /> WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={mail}><Mail className="mr-2 h-3 w-3" /> E-pasts</Button>
              <Button size="sm" variant="outline" asChild>
                <a href={offer.token ? offerPath(offer.token) : "#"} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-3 w-3" /> Skatīt</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={offer.token ? offerPath(offer.token, "?print=1") : "#"} target="_blank" rel="noreferrer"><Printer className="mr-2 h-3 w-3" /> Drukāt</a>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
};

export default AdminOfferEdit;
