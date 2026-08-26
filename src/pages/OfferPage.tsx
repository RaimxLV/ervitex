import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  money, offerTotals, offerPlainText, type Offer, type OfferItem,
  PRINT_DISCLAIMER_LV, PRINT_DISCLAIMER_EN,
} from "@/lib/offer";
import { Printer, MessageCircle, Mail, ClipboardList, ArrowUpRight, Store } from "lucide-react";
import logo from "@/assets/ervitex-logo-2.svg";

const OfferPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_pm_offer" as any, { _token: token });
      let row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        // Admins may preview drafts
        const { data: direct } = await supabase.from("pm_offers").select("*").eq("token", token!).maybeSingle();
        row = direct as any;
      }
      if (row) setOffer({ ...(row as any), items: (((row as any).items || []) as OfferItem[]) });
      setLoading(false);
      if (searchParams.get("print") === "1") setTimeout(() => window.print(), 700);
    })();
  }, [token]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">{t("Ielādē…", "Loading…")}</div>;
  }

  if (!offer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-black uppercase">{t("Piedāvājums nav atrasts", "Offer not found")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Saite var būt novecojusi. Sazinies ar savu projektu vadītāju.", "This link may have expired. Please contact your project manager.")}
        </p>
        <Button asChild variant="outline"><Link to="/">{t("Uz sākumlapu", "Go to homepage")}</Link></Button>
      </div>
    );
  }

  const totals = offerTotals(offer.items, offer.vat_rate);
  const text = offerPlainText(offer, lang === "lv" ? "lv" : "en");
  const pmEmail = offer.pm_email || "birojs@ervitex.lv";
  const itemLink = (i: OfferItem) => {
    const q = new URLSearchParams();
    if (i.colorName) q.set("color", i.colorName);
    if (i.size) q.set("size", i.size);
    const qs = q.toString();
    return `/catalog/item/${i.source}/${encodeURIComponent(i.productId)}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 print:max-w-none print:px-0">
        {/* Actions — hidden in print */}
        <div className="mb-3 sm:mb-5 print:hidden">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 font-heading text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <Store className="h-3.5 w-3.5" /> {t("Ervitex katalogs", "Ervitex catalog")}
          </Link>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
              <Printer className="mr-2 h-3.5 w-3.5" /> {t("Drukāt / PDF", "Print / PDF")}
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => navigator.clipboard.writeText(text)}>
              <ClipboardList className="mr-2 h-3.5 w-3.5" /> {t("Kopēt sarakstu", "Copy list")}
            </Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto" asChild>
              <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
              </a>
            </Button>
            <Button size="sm" className="w-full sm:w-auto" asChild>
              <a href={`mailto:${pmEmail}?subject=${encodeURIComponent(offer.title || "Piedāvājums")}&body=${encodeURIComponent(text)}`}>
                <Mail className="mr-2 h-3.5 w-3.5" /> {t("Atbildēt e-pastā", "Reply by email")}
              </a>
            </Button>
          </div>
        </div>

        <article className="rounded-md border border-border bg-card p-4 sm:p-8 print:border-0 print:p-0">
          <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <img src={logo} alt="Ervitex" className="h-7 w-auto sm:h-8" />
              <h1 className="mt-4 font-heading text-xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl">
                {offer.title || t("Piedāvājums", "Offer")}
              </h1>
              {[offer.client_name, offer.client_company].filter(Boolean).length > 0 && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {[offer.client_name, offer.client_company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="shrink-0 text-xs leading-relaxed text-muted-foreground sm:text-right">
              <p>{new Date(offer.updated_at || offer.created_at).toLocaleDateString("lv")}</p>
              <p className="mt-1">Ervitex · birojs@ervitex.lv</p>
              <p>www.ervitex.lv</p>
            </div>
          </header>

          {offer.note && (
            <p className="mt-5 whitespace-pre-line rounded-sm border-l-2 border-accent bg-muted/60 p-4 text-sm leading-relaxed text-foreground print:border-l print:bg-transparent print:px-0">
              {offer.note}
            </p>
          )}

          {/* Items — table on desktop / print, cards on mobile */}
          <div className="mt-6 hidden sm:block print:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="py-2.5 font-semibold">{t("Prece", "Item")}</th>
                  <th className="py-2.5 font-semibold">{t("Krāsa", "Colour")}</th>
                  <th className="py-2.5 font-semibold">{t("Izmērs", "Size")}</th>
                  <th className="py-2.5 text-right font-semibold">{t("Skaits", "Qty")}</th>
                  <th className="py-2.5 text-right font-semibold">{t("Cena/gab.", "Unit")}</th>
                  <th className="py-2.5 text-right font-semibold">{t("Summa", "Total")}</th>
                </tr>
              </thead>
              <tbody>
                {offer.items.map((i) => (
                  <tr key={i.id} className="border-b border-border/60 align-top transition-colors hover:bg-muted/40 print:hover:bg-transparent">
                    <td className="py-3 pr-3">
                      <Link to={itemLink(i)} className="group flex items-start gap-3">
                        {i.image && (
                          <img
                            src={i.image}
                            alt={i.name}
                            loading="lazy"
                            className="h-14 w-14 shrink-0 rounded-sm border border-border bg-background object-contain p-0.5 print:hidden"
                          />
                        )}
                        <span className="min-w-0">
                          <span className="block font-medium leading-snug text-foreground transition-colors group-hover:text-accent">{i.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{i.code}{i.brand ? ` · ${i.brand}` : ""}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent print:hidden">
                            {t("Skatīt preci", "View product")} <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {i.colorHex && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" style={{ background: i.colorHex }} />}
                        {i.colorName || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap">{i.size || "—"}</td>
                    <td className="py-3 text-right tabular-nums">{i.qty}</td>
                    <td className="py-3 text-right tabular-nums whitespace-nowrap">
                      {i.unitPrice ? money(i.unitPrice) : t("pēc pieprasījuma", "on request")}
                    </td>
                    <td className="py-3 text-right font-medium tabular-nums whitespace-nowrap">
                      {i.unitPrice ? money(i.unitPrice * i.qty) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 space-y-3 sm:hidden print:hidden">
            {offer.items.map((i) => (
              <li key={i.id} className="rounded-md border border-border bg-background p-3">
                <Link to={itemLink(i)} className="group flex gap-3">
                  {i.image && (
                    <img
                      src={i.image}
                      alt={i.name}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-sm border border-border object-contain p-0.5"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-foreground group-hover:text-accent">{i.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{i.code}{i.brand ? ` · ${i.brand}` : ""}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {i.colorHex && <span className="h-3 w-3 rounded-full border border-border" style={{ background: i.colorHex }} />}
                        {i.colorName || "—"}
                      </span>
                      {i.size && <span>{t("Izmērs", "Size")}: {i.size}</span>}
                      <span>{t("Skaits", "Qty")}: {i.qty}</span>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        {t("Skatīt preci", "View product")} <ArrowUpRight className="h-3 w-3" />
                      </span>
                      <span className="text-right">
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                          {i.unitPrice ? `${money(i.unitPrice)} / ${t("gab.", "pc")}` : t("pēc pieprasījuma", "on request")}
                        </span>
                        {i.unitPrice && (
                          <span className="block font-heading text-sm font-black text-foreground">{money(i.unitPrice * i.qty)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>


          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("Kopā bez PVN", "Total excl. VAT")}</dt>
                <dd className="font-medium">{money(totals.net)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">PVN {offer.vat_rate}%</dt>
                <dd>{money(totals.vat)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt className="font-heading font-black uppercase">{t("Kopā ar PVN", "Total incl. VAT")}</dt>
                <dd className="font-black text-accent">{money(totals.gross)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 rounded-sm border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
            {lang === "lv" ? PRINT_DISCLAIMER_LV : PRINT_DISCLAIMER_EN}
          </p>

          <div className="mt-8 flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div>
              <p className="font-heading text-sm font-black uppercase tracking-wide text-foreground">
                {t("Vēlies redzēt vairāk?", "Want to see more?")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  "Ienāc mūsu veikala katalogā — visi zīmoli, krāsas un izmēri.",
                  "Browse our shop catalog — all brands, colours and sizes.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/catalog">
                  <Store className="mr-2 h-4 w-4" /> {t("Doties uz katalogu", "Go to catalog")}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${pmEmail}?subject=${encodeURIComponent(offer.title || "Piedāvājums")}`}>
                  <Mail className="mr-2 h-4 w-4" /> {t("Rakstīt projektu vadītājam", "Email project manager")}
                </a>
              </Button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {t("Tavs kontakts", "Your contact")}: {offer.pm_name ? `${offer.pm_name} · ` : ""}
            <a className="underline" href={`mailto:${pmEmail}`}>{pmEmail}</a>
          </p>
        </article>
      </div>
    </div>

  );
};

export default OfferPage;
