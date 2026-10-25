import { Package, Pencil } from "lucide-react";
import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProductOrderMinimum } from "@/hooks/useProductOrderMinimum";
import { applyQuantityOverride, validQuantityOverride } from "@/lib/productOrderMinimums";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOrderMinimum } from "@/lib/orderMinimums";
import { cn } from "@/lib/utils";

export function OrderMinimumNotice(props: { source: string; productId?: string; category?: string | null; name?: string | null; className?: string }) {
  const { lang } = useLanguage();
  const { isAdmin, loading } = useAuth();
  const quantities = useProductOrderMinimum(props.source, props.productId);
  const base = getOrderMinimum(props);
  const rule = applyQuantityOverride(base, quantities.data);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ minimum: '', printed_minimum: '', recommended_minimum: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const formId = useId();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const persist = async (reset = false) => {
    const value = { minimum: Number(draft.minimum), printed_minimum: rule.printedMinimum ? Number(draft.printed_minimum) : null, recommended_minimum: rule.recommended ? Number(draft.recommended_minimum) : null };
    if (!reset && !validQuantityOverride(value)) { setError(t('Ievadi pozitīvus veselus skaitļus.', 'Enter positive whole numbers.')); return; }
    setBusy(true); setError('');
    try { await quantities.save(reset ? null : value); setEditing(false); }
    catch { setError(t('Neizdevās saglabāt daudzumus. Mēģini vēlreiz.', 'Could not save quantities. Try again.')); }
    finally { setBusy(false); }
  };
  return <aside aria-label={t("Pasūtījuma daudzums", "Order quantity")} className={cn("order-notice rounded-md p-5 sm:p-6", props.className)}>
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <Package aria-hidden="true" className="order-notice-icon h-5 w-5 shrink-0" strokeWidth={1.5} />
      <h3 className="text-base font-semibold">{t("Pasūtījuma daudzums", "Order quantity")}</h3>
      {isAdmin && !loading && props.productId && !editing && <Button type="button" variant="ghost" size="sm" className="ml-auto" disabled={quantities.isFetching || quantities.isError} onClick={() => {
        setDraft({ minimum: String(rule.minimum), printed_minimum: String(rule.printedMinimum ?? ''), recommended_minimum: String(rule.recommended?.minimum ?? '') }); setError(''); setEditing(true);
      }}><Pencil className="h-3.5 w-3.5 mr-1" />{t('Rediģēt', 'Edit')}</Button>}
    </div>
    {editing ? <form className="space-y-3" onSubmit={event => { event.preventDefault(); void persist(); }} onKeyDown={event => { if (event.key === 'Escape' && !busy) { event.preventDefault(); setEditing(false); } }}>
      {([
        ['minimum', rule.printedMinimum ? t('Bez apdrukas — minimums', 'Without printing — minimum') : t('Minimālais daudzums', 'Minimum quantity'), true],
        ['printed_minimum', t('Ar apdruku — minimums', 'With printing — minimum'), !!rule.printedMinimum],
        ['recommended_minimum', t('Ieteicamais daudzums', 'Recommended quantity'), !!rule.recommended],
      ] as const).filter(([, , show]) => show).map(([field, label]) => <div key={field}>
        <label htmlFor={`${formId}-${field}`} className="block text-sm mb-1">{label}</label>
        <Input id={`${formId}-${field}`} name={field} type="number" min={1} step={1} required disabled={busy} value={draft[field]} onChange={event => setDraft(prev => ({ ...prev, [field]: event.target.value }))} className="bg-background text-foreground w-full" />
      </div>)}
      {error && <p role="alert" className="text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy}>{t('Saglabāt', 'Save')}</Button>
        <Button type="button" variant="outline" size="sm" className="text-foreground" disabled={busy} onClick={() => setEditing(false)}>{t('Atcelt', 'Cancel')}</Button>
        {quantities.data && <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => void persist(true)}>{t('Atjaunot noklusējumu', 'Restore default')}</Button>}
      </div>
    </form> : <>
    <div className="order-notice-muted space-y-3 text-sm leading-relaxed">
      {rule.printedMinimum ? <div className="order-notice-thresholds grid grid-cols-1 gap-3 sm:grid-cols-2">
        <p>{t(`Bez apdrukas — no ${rule.minimum} vienībām`, `Without printing — from ${rule.minimum} units`)}</p>
        <p>{t(`Ar apdruku — no ${rule.printedMinimum} vienībām`, `With printing — from ${rule.printedMinimum} units`)}</p>
      </div> : <p>{t(`Pasūtījums no ${rule.minimum} vienībām.`, `Orders from ${rule.minimum} units.`)}</p>}
      {rule.recommended && <p>{rule.recommended.sameSize ? t(`Ieteicamais daudzums — vismaz ${rule.recommended.minimum} vienības katrā krāsas un izmēra kombinācijā.`, `Recommended quantity — at least ${rule.recommended.minimum} units in each colour and size combination.`) : t(`Ieteicamais daudzums — vismaz ${rule.recommended.minimum} vienības vienā krāsā.`, `Recommended quantity — at least ${rule.recommended.minimum} units per colour.`)}</p>}
    </div>
    </>}
  </aside>;
}
