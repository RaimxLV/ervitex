import { QuoteItemsTable } from "@/components/quote/QuoteItemsTable";
import { PrintRows } from "@/components/quote/PrintRows";
import { getOrderPrints, setOrderPrints, removeOfferItem } from "@/lib/orderPrinting";
import logo from "@/assets/ervitex-logo-dark.svg";
import { DecimalInput } from "@/components/ui/decimal-input";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import OfferWorkspace from "@/components/quote/OfferWorkspace";
import { ColorSelector } from "@/components/quote/ColorSelector";
import { SizeQuantityTable } from "@/components/quote/SizeQuantityTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import DiscountField from "@/components/quote/DiscountField";
import { money, itemPrintNet, itemDiscountNet, itemDiscountPercent, itemTotalNet, offerTotals, offerPlainText, offerUrl, offerPath, type Offer, type OfferItem, PRINT_DISCLAIMER_LV } from "@/lib/offer";
import { PROJECT_MANAGERS, OFFICE_EMAIL } from "@/data/projectManagers";
import { ArrowLeft, ChevronDown, Copy, ExternalLink, Mail, MessageCircle, Printer, Repeat, Save, Search, Send, Trash2, Plus } from "lucide-react";
import { fillMissingPrices } from "@/lib/fillMissingPrices";
import { colorMatches } from "@/components/worksheet/useVariants";
import { useOfferDraft } from "@/hooks/useOfferDraft";


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
  const { offer, setOffer, initialize, persist, saveState, saveError } = useOfferDraft(user?.id, id, emptyOffer);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<"client" | null>(null);

  // --- product picker state
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<CatalogHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<CatalogHit | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const pickerRef = useRef<HTMLElement>(null);
  const pickVersion = useRef(0);
  const [prices, setPrices] = useState<VariantPrice[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>({});
  const [swapKey, setSwapKey] = useState<string | null>(null);
  const debounce = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!user?.id || !id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.from("pm_offers").select("*").eq("id", id || "").maybeSingle();
      if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
      else if (data) {
        const row = data as any;
        const me = PROJECT_MANAGERS.find((p) => p.email.toLowerCase() === (user?.email || "").toLowerCase());
        // Rindām bez cenas cenu ņemam no piegādātāja kataloga.
        const items = await fillMissingPrices((row.items || []) as OfferItem[]);
        if (cancelled) return;
        initialize({
          ...row,
          items,
          pm_email: row.pm_email || me?.email || user?.email || OFFICE_EMAIL,
          pm_name: row.pm_name || me?.name || "",
        });
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, user?.id, initialize]);


  useEffect(() => {
    if (!pickerOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !pickerRef.current?.contains(event.target)) setPickerOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [pickerOpen]);

  // debounce search
  useEffect(() => {
    window.clearTimeout(debounce.current);
    if (q.trim().length < 2) { setHits([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    debounce.current = window.setTimeout(async () => {
      const term = q.trim();
      const { data } = await supabase
        .from("catalog_items" as any)
        .select("source,id,name,brand,image_url,colors")
        .or(`name.ilike.%${term}%,id.ilike.%${term}%`)
        .limit(25);
      if (cancelled) return;
      setHits(((data || []) as unknown) as CatalogHit[]);
      setSearching(false);
    }, 300);
    return () => { cancelled = true; window.clearTimeout(debounce.current); };
  }, [q]);

  const pick = async (hit: CatalogHit) => {
    const version = ++pickVersion.current;
    setPicked(hit);
    setPickerOpen(true);
    setLoadingVariants(true);
    setPrices([]);
    setQ("");
    setHits([]);
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
    if (version !== pickVersion.current) return;
    setPrices(rows);
    setLoadingVariants(false);
  };

  const colorRows = useMemo(
    () => (picked?.colors || []).filter((c) => c?.n || c?.c),
    [picked],
  );

  const sizeRows = useMemo(() => {
    if (!picked) return [] as { size: string; price: number | null }[];
    const colorName = (picked.colors || []).find((c) => c.c === activeColor)?.n;
    const forColor = prices.filter((p) => !activeColor || !p.color_code || colorMatches(p.color_code, activeColor) || colorMatches(p.color_code, colorName));
    const map = new Map<string, number | null>();
    for (const p of (forColor.length ? forColor : prices)) {
      const s = (p.size || "").trim() || "-";
      const n = Number(p.retail_price);
      const price = Number.isFinite(n) && n > 0 ? n : null;
      const cur = map.get(s);
      if (!map.has(s) || (price !== null && (cur == null || price < cur))) map.set(s, price);
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
    setPickerOpen(false);
    toast({ title: `Pievienots: ${lines.length} rindas` });
  };

  /** Viena modeļa + krāsas grupa piedāvājumā */
  const groupKey = (i: OfferItem) => `${i.source}|${i.productId}|${i.colorName || ""}`;
  const swapTarget = useMemo(
    () => (swapKey ? offer.items.find((i) => groupKey(i) === swapKey) || null : null),
    [swapKey, offer.items],
  );
  /** Nomaina modeli/krāsu visai grupai, saglabājot izmērus un daudzumus */
  const swapPicked = () => {
    if (!picked || !swapKey) return;
    const color = colorRows.find((c) => c.c === activeColor) || colorRows[0] || null;
    const priceBySize = new Map(sizeRows.map((r) => [r.size, r.price]));
    let missing = 0;
    setOffer((o) => ({
      ...o,
      items: o.items.map((i) => {
        if (groupKey(i) !== swapKey) return i;
        const s = i.size || "-";
        const has = priceBySize.has(s);
        if (!has) missing += 1;
        return {
          ...i,
          source: picked.source,
          productId: picked.id,
          name: picked.name,
          code: picked.id,
          brand: picked.brand,
          image: color?.u || picked.image_url || null,
          colorName: color?.n || null,
          colorHex: color?.h || null,
          unitPrice: has ? (priceBySize.get(s) ?? null) : i.unitPrice,
        };
      }),
    }));
    setSwapKey(null);
    setPicked(null);
    setQtyBySize({});
    setQ("");
    toast({
      title: "Modelis nomainīts",
      description: missing
        ? `Izmēri un skaiti saglabāti. ${missing} izmēriem jaunajam modelim nav cenas — pārbaudi.`
        : "Izmēri un skaiti saglabāti, cenas atjaunotas.",
    });
  };

  const patchItem = (itemId: string, patch: Partial<OfferItem>) =>
    setOffer((o) => ({ ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }));
  const removeItem = (itemId: string) =>
    setOffer((o) => ({ ...o, items: removeOfferItem(o.items, itemId) }));

  const totals = offerTotals(offer.items, offer.vat_rate, offer.discount);

  const save = async (status?: string) => {
    setSaving(true);
    const success = await persist(status);
    setSaving(false);
    if (!success) {
      toast({ title: "Neizdevās saglabāt", variant: "destructive" });
      return false;
    }
    toast({ title: status === "sent" ? "Saglabāts un gatavs sūtīšanai" : "Saglabāts" });
    return true;
  };


  const link = offer.token ? offerUrl(offer.token) : "";

  // Any client-facing share must publish the link first (draft links do not work)
  const publish = async () => {
    return save(offer.status === "draft" ? "sent" : undefined);
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
    if (!await publish()) return;
    const text = `${offer.client_name ? `Sveiki, ${offer.client_name}!\n\n` : ""}${offerPlainText(offer, "lv")}`;
    const phone = (offer.client_phone || "").replace(/[^\d]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const mail = async () => {
    if (!await publish()) return;
    const subject = offer.title || "Ervitex piedāvājums";
    const body = `${offer.client_name ? `Sveiki, ${offer.client_name}!\n\n` : ""}${offerPlainText(offer, "lv")}`;
    window.location.href = `mailto:${offer.client_email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };


  // Real send through the platform email system
  const sendEmail = async () => {
    const to = (offer.client_email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      toast({
        title: "Nav klienta e-pasta",
        description: "Ievadi klienta e-pastu un saglabā.",
        variant: "destructive",
      });
      return;
    }
    if (offer.items.length === 0) {
      toast({ title: "Piedāvājums ir tukšs", variant: "destructive" });
      return;
    }

    setSendingEmail("client");
    // Publish the link first so the client can open it
    if (!await save("sent")) { setSendingEmail(null); return; }

    const t = offerTotals(offer.items, offer.vat_rate, offer.discount);
    const pmEmail = (offer.pm_email || user?.email || OFFICE_EMAIL).trim();
    const pmName = offer.pm_name || "";
    const { error } = await supabase.functions.invoke("send-pm-offer", {
      body: {
        offerId: offer.id,
        recipientEmail: to,
        replyTo: pmEmail,
        idempotencyKey: `pm-offer-${offer.id}-client-${Date.now()}`,
        templateData: {
          title: offer.title || "Ervitex piedāvājums",
          clientName: offer.client_name || "",
          note: [offer.note, ...getOrderPrints(offer.items).map((p) => `Apdruka visām precēm: ${p.method}${p.placement ? ` (${p.placement})` : ""}${p.price ? ` — ${money(p.price)}${p.mode === "total" ? " kopā" : " / gab."}` : ""}`)].filter(Boolean).join("\n"),
          pmName,
          pmEmail,

          items: offer.items.map((i) => ({
            name: i.name,
            code: i.code,
            colorName: i.colorName,
            size: i.size,
            qty: i.qty,
            unitPrice: i.unitPrice ? money(i.unitPrice) : null,
            discountPercent: itemDiscountPercent(i),
            discountAmount: money(itemDiscountNet(i)),
            lineTotal: i.unitPrice || itemPrintNet(i) ? money(itemTotalNet(i)) : "",
            prints: (i.prints || []).filter((p) => p.scope !== "order").map((p) => `${p.method}${p.placement ? ` (${p.placement})` : ""}: ${money(Number(p.price))}${p.mode === "total" ? " kopā" : " / gab."}`),
          })),
          discount: t.discount > 0 ? `−${money(t.discount)}${offer.discount?.type === "percent" ? ` (${offer.discount.value}%)` : ""}` : "",
          totalQty: t.qty,
          net: money(t.net),
          vat: money(t.vat),
          gross: money(t.gross),
          vatRate: offer.vat_rate,
          url: offer.token ? offerUrl(offer.token) : "",
          disclaimer: PRINT_DISCLAIMER_LV,
          isTest: false,
        },
      },
    });
    setSendingEmail(null);
    if (error) {
      toast({ title: "Neizdevās nosūtīt", description: error.message, variant: "destructive" });
      return;
    }
    if (offer.status === "draft") {
      // Status changes automatically on a successful send
      await save("sent");
    }
    toast({ title: `Piedāvājums nosūtīts: ${to}` });
  };


  if (loading) {
    return <OfferWorkspace><p className="py-10 text-center text-muted-foreground">Ielādē...</p></OfferWorkspace>;
  }


  return (
    <OfferWorkspace>
      <div className="quote-form">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <img src={logo} alt="Ervitex" className="h-14 w-auto max-w-full sm:h-16" />
          <Button asChild variant="outline" size="sm">
            <Link to="/offers"><ArrowLeft className="mr-2 h-4 w-4" /> Visi piedāvājumi</Link>
          </Button>

        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span role="status" className="text-xs text-muted-foreground">{saveState === "saved" ? "Saglabāts" : saveState === "saving" ? "Saglabā…" : saveState === "pending" ? "Nesaglabātas izmaiņas" : "Nav saglabāts tiešsaistē"}</span>
          <Button size="sm" onClick={() => save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> Saglabāt
          </Button>
        </div>
      </header>

      <h1 className="mb-7 font-heading text-2xl font-black uppercase sm:text-3xl">Mans piedāvājums</h1>
      {saveError && <p role="alert" className="mb-5 text-sm text-destructive">{saveError}</p>}
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* Picker */}
          <section ref={pickerRef} id="preces-izvele" className="scroll-mt-36 border-b border-border pb-6">
            <h2 className="section-kicker font-heading text-xs font-bold uppercase text-accent">
              {swapTarget ? "Nomainīt modeli" : "Pievienot preci"}
            </h2>
            {swapTarget && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-accent/50 bg-accent/5 p-3">
                <p className="text-xs text-foreground">
                  Nomaina: <span className="font-semibold">{swapTarget.name}</span>
                  {swapTarget.colorName ? ` · ${swapTarget.colorName}` : ""} — izmēri un skaiti paliek tie paši.
                </p>
                <Button size="sm" variant="ghost" onClick={() => { setSwapKey(null); setPicked(null); }}>
                  Atcelt
                </Button>
              </div>
            )}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPickerOpen(false); }} placeholder="Meklēt pēc nosaukuma vai koda…" />
            </div>

            {searching && <p className="mt-2 text-xs text-muted-foreground">Meklē…</p>}
            {hits.length > 0 && (
              <div className="mt-3 max-h-64 divide-y divide-border overflow-y-auto rounded-sm border border-border">
                {hits.map((h) => (
                  <Button variant="ghost"
                    key={`${h.source}-${h.id}`}
                    onClick={() => pick(h)}
                    className={`flex h-auto w-full justify-start items-center gap-3 rounded-none p-3 text-left hover:bg-muted ${picked?.id === h.id && picked?.source === h.source ? "bg-muted" : ""}`}
                  >
                    {h.image_url && <img src={h.image_url} alt="" loading="lazy" className="h-10 w-10 rounded-sm object-cover" />}
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{h.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{h.id} · {h.brand || h.source.toUpperCase()}</span>
                    </span>
                  </Button>
                ))}
              </div>
            )}

            {picked && (
              <div className="mt-4 border-t border-border pt-5">
                <Button type="button" variant="ghost" aria-expanded={pickerOpen} aria-controls="offer-variant-picker" onClick={() => setPickerOpen((open) => !open)} className="h-auto w-full justify-start gap-4 px-0 py-2 text-left hover:bg-muted/50">
                  {picked.image_url && <img src={picked.image_url} alt="" className="h-16 w-16 shrink-0 border border-border bg-background object-contain" />}
                  <span className="min-w-0 flex-1 whitespace-normal">
                    <span className="block text-base font-semibold">{picked.name}</span>
                    <span className="mt-1 block font-mono text-sm text-muted-foreground">{picked.source === "etx" ? "Sporta formas (Sublimācija)" : picked.id}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{colorRows.find((c) => c.c === activeColor)?.n || ""}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
                </Button>
                {pickerOpen && <div id="offer-variant-picker" className="mt-4 space-y-4 border-t border-border pt-4">
                {colorRows.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs">Krāsa</Label>
                    <div className="mt-2"><ColorSelector colors={colorRows.map((c, index) => ({ code: c.c || String(index), name: c.n || c.c || "—", hex: c.h }))} value={activeColor} onChange={(code) => { setActiveColor(code); setQtyBySize({}); }} /></div>
                  </div>
                )}

                {loadingVariants ? <p className="py-4 text-sm text-muted-foreground">Ielādē…</p> : <div className="mt-4"><SizeQuantityTable rows={sizeRows} quantities={qtyBySize} readOnly={!!swapTarget} onChange={(size, qty) => setQtyBySize((previous) => ({ ...previous, [size]: qty }))} /></div>}

                {swapTarget ? (
                  <Button size="sm" className="mt-3 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loadingVariants} onClick={swapPicked}>
                    <Repeat className="mr-2 h-4 w-4" /> Nomainīt uz šo modeli
                  </Button>
                ) : (
                  <Button size="sm" className="mt-3 bg-accent text-accent-foreground hover:bg-accent/90" disabled={loadingVariants || !Object.values(qtyBySize).some((qty) => qty > 0)} onClick={addPicked}>
                    <Plus className="mr-2 h-4 w-4" /> Pievienot piedāvājumam
                  </Button>
                )}
                </div>}
              </div>
            )}
          </section>

          {/* Items */}
          <section className="border-b border-border pb-6">
            <h2 className="section-kicker font-heading text-xs font-bold uppercase text-accent">
              Preces ({totals.qty} gab.)
            </h2>
            {offer.items.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Vēl nav pievienota neviena prece.</p>
            ) : (
              <div className="mt-4"><QuoteItemsTable items={offer.items} onGroupSelect={(item) => {
                  setSwapKey(null);
                  void (async () => {
                    const { data } = await supabase.from("catalog_items" as any).select("source,id,name,brand,image_url,colors").eq("source", item.source).eq("id", item.productId).maybeSingle();
                    if (data && pickerRef.current) { await pick(data as unknown as CatalogHit); setActiveColor((data as unknown as CatalogHit).colors?.find((c) => c.n === item.colorName)?.c || null); }
                  })();
                  document.getElementById("preces-izvele")?.scrollIntoView({ block: "start" });
                }} onQuantity={(id, qty) => patchItem(id, { qty })} onPrice={(id, unitPrice) => patchItem(id, { unitPrice })} onDiscount={(id, discountPercent) => patchItem(id, { discountPercent })} onRemove={removeItem}
                groupAction={(i) => <Button type="button" size="sm" variant="ghost" className="mt-1 px-0 text-accent" onClick={() => { setSwapKey(groupKey(i)); setPicked(null); setQ(""); document.getElementById("preces-izvele")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Repeat className="h-4 w-4" />Cits modelis</Button>}
                itemDetails={(i) => <PrintRows value={(i.prints || []).filter((p) => p.scope !== "order")} onChange={(prints) => patchItem(i.id, { prints: [...prints, ...(i.prints || []).filter((p) => p.scope === "order")] })} addLabel="Apdruka" />}
              /></div>

            )}
          </section>
          <section className="border-b border-border pb-6">
            <h2 className="section-kicker mb-5 font-heading text-xs font-bold uppercase text-accent">Apdruka visām precēm</h2>
            <PrintRows disabled={offer.items.length === 0} value={getOrderPrints(offer.items)} onChange={(prints) => setOffer((o) => ({ ...o, items: setOrderPrints(o.items, prints) }))} addLabel="Pievienot kopīgu apdruku" />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="border-t border-border pt-5">
            <h3 className="section-kicker font-heading text-xs font-bold uppercase text-accent">Kopsavilkums</h3>
            <dl className="mt-4 space-y-3 text-sm tabular-nums">
              <div className="flex justify-between"><dt className="text-muted-foreground">Preces</dt><dd>{money(totals.goods)}</dd></div>
              {totals.itemDiscount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Preču atlaides</dt><dd className="text-accent">−{money(totals.itemDiscount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Apdruka</dt><dd>{money(totals.print)}</dd></div>
              <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">Atlaide</dt><dd><DiscountField value={offer.discount ?? null} onChange={(d) => setOffer((o) => ({ ...o, discount: d }))} /></dd></div>
              {totals.discount > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Atlaides summa</dt><dd className="text-accent">−{money(totals.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Kopā bez PVN</dt><dd className="font-medium">{money(totals.net)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">PVN {offer.vat_rate}%</dt><dd>{money(totals.vat)}</dd></div>
              <div className="flex justify-between border-t border-border pt-1 text-base"><dt className="font-semibold">Kopā ar PVN</dt><dd className="font-black text-accent">{money(totals.gross)}</dd></div>
            </dl>
            
          </div>

          {/* Client */}
          <section className="border-b border-border pb-6">
            <h2 className="section-kicker font-heading text-xs font-bold uppercase text-accent">Piedāvājuma dati</h2>
            <div className="mt-4 grid gap-4">
              <div className="">
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
                <Label className="text-xs">Projektu vadītājs</Label>
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

              </div>
              <div className="">
                <Label className="text-xs">Piezīme klientam</Label>
                <Textarea rows={3} value={offer.note || ""} onChange={(e) => setOffer({ ...offer, note: e.target.value })} placeholder="Apdrukas veids, izmērs, termiņi…" />
              </div>

            </div>
          </section>


          <div className="space-y-3 border-t border-border pt-5">
            <h3 className="section-kicker font-heading text-xs font-bold uppercase text-accent">Nosūtīt klientam</h3>


            <Input readOnly value={link} className="text-xs" onFocus={(e) => e.currentTarget.select()} />

            <Button
              variant="outline"
              className="w-full"
              disabled={!offer.token || saving}
              onClick={async () => {
                const w = window.open("", "_blank");
                if (!await save()) { w?.close(); return; }
                if (offer.token) { if (w) w.location.href = offerPath(offer.token); else window.open(offerPath(offer.token), "_blank"); }
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Apskatīt piedāvājumu
            </Button>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => sendEmail()}
              disabled={sendingEmail !== null || saving}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendingEmail === "client" ? "Sūta…" : "Nosūtīt piedāvājumu klientam"}
            </Button>


            <div className="grid grid-cols-2 gap-2">

              <Button size="sm" variant="outline" onClick={async () => { if (await publish()) copy(link, "Links"); }}><Copy className="mr-2 h-3 w-3" /> Saite</Button>
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
      </div>
    </OfferWorkspace>
  );
};

export default AdminOfferEdit;
