import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/lib/offer";

export function offerDraftPayload(offer: Offer) {
  return {
    title: offer.title, client_name: offer.client_name, client_company: offer.client_company,
    client_email: offer.client_email, client_phone: offer.client_phone, note: offer.note,
    client_billing: offer.client_billing || null, status: offer.status, vat_rate: offer.vat_rate,
    pm_name: offer.pm_name || null, pm_email: offer.pm_email || null, items: offer.items,
    discount: offer.discount && offer.discount.value > 0 ? offer.discount : null,
  };
}

type Draft = { offer: Offer; base: string; userId: string };
export type OfferSaveState = "saved" | "pending" | "saving" | "error" | "conflict";

/** User/offer-scoped recovery plus serialized writes; acknowledgements never reset the form. */
export function useOfferDraft(userId: string | undefined, id: string | undefined, empty: Offer) {
  const [offer, updateOffer] = useState(empty);
  const [saveState, setSaveState] = useState<OfferSaveState>("saved");
  const [saveError, setSaveError] = useState("");
  const current = useRef(empty);
  const base = useRef("");
  const acknowledged = useRef("");
  const ready = useRef(false);
  const queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const key = userId && id ? `ervitex:offer-draft:${userId}:${id}` : null;

  const backup = useCallback((next: Offer) => {
    if (!key || !userId) return;
    try { localStorage.setItem(key, JSON.stringify({ offer: next, base: base.current, userId } satisfies Draft)); }
    catch { /* Cloud save still works when browser storage is unavailable. */ }
  }, [key, userId]);

  const initialize = useCallback((remote: Offer) => {
    let recovered = remote;
    acknowledged.current = JSON.stringify(offerDraftPayload(remote));
    base.current = remote.updated_at;
    let conflict = false;
    try {
      const stored = key ? localStorage.getItem(key) : null;
      const draft = stored ? JSON.parse(stored) as Draft : null;
      if (draft && draft.userId === userId && draft.offer?.id === remote.id && Array.isArray(draft.offer.items)) {
        recovered = { ...remote, ...draft.offer, token: remote.token };
        conflict = draft.base !== remote.updated_at && JSON.stringify(offerDraftPayload(recovered)) !== acknowledged.current;
        if (conflict) base.current = draft.base;
      }
    } catch { /* A corrupt backup must not prevent opening the saved offer. */ }
    current.current = recovered;
    ready.current = true;
    updateOffer(recovered);
    setSaveState(conflict ? "conflict" : JSON.stringify(offerDraftPayload(recovered)) === acknowledged.current ? "saved" : "pending");
    setSaveError(conflict ? "Piedāvājums mainīts citā logā. Vietējais darbs saglabāts; pirms turpināšanas pārbaudiet otru logu." : "");
  }, [key, userId]);

  const setOffer = useCallback((action: SetStateAction<Offer>) => {
    const next = typeof action === "function" ? action(current.current) : action;
    current.current = next;
    backup(next);
    updateOffer(next);
    setSaveState((state) => state === "conflict" ? state : "pending");
  }, [backup]);

  const persist = useCallback((status?: string): Promise<boolean> => {
    const run = async () => {
      if (!ready.current || !key || !id || current.current.id !== id) return false;
      if (status) {
        current.current = { ...current.current, status };
        backup(current.current);
        updateOffer(current.current);
      }
      const snapshot = current.current;
      const serialized = JSON.stringify(offerDraftPayload(snapshot));
      if (serialized === acknowledged.current) { setSaveState("saved"); return true; }
      setSaveState("saving");
      try {
        const { data, error } = await supabase.from("pm_offers")
          .update(offerDraftPayload(snapshot) as any).eq("id", id).eq("updated_at", base.current)
          .select("id,updated_at").maybeSingle();
        if (error) throw error;
        if (!data) {
          setSaveState("conflict");
          setSaveError("Piedāvājums mainīts citā logā vai vairs nav pieejams. Vietējais darbs saglabāts.");
          return false;
        }
        base.current = data.updated_at;
        acknowledged.current = serialized;
        // Keep edits made while this request was in flight.
        const unchanged = JSON.stringify(offerDraftPayload(current.current)) === serialized;
        if (unchanged) {
          try { localStorage.removeItem(key); } catch { /* optional recovery storage */ }
        } else backup(current.current);
        setSaveState(unchanged ? "saved" : "pending");
        setSaveError("");
        return true;
      } catch {
        backup(current.current);
        setSaveState("error");
        setSaveError("Neizdevās saglabāt tiešsaistē. Darbs paliek šajā pārlūkā; mēģiniet saglabāt vēlreiz.");
        return false;
      }
    };
    queue.current = queue.current.then(run, run);
    return queue.current;
  }, [backup, id, key]);

  useEffect(() => {
    if (saveState !== "pending") return;
    const timer = window.setTimeout(() => { void persist(); }, 1000);
    return () => window.clearTimeout(timer);
  }, [offer, saveState, persist]);

  useEffect(() => {
    const flush = () => { if (ready.current) void persist(); };
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    const leaving = (event: BeforeUnloadEvent) => {
      if (ready.current && JSON.stringify(offerDraftPayload(current.current)) !== acknowledged.current) {
        backup(current.current);
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("online", flush);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", leaving);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("online", flush);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", leaving);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [backup, persist]);

  return { offer, setOffer, initialize, persist, saveState, saveError };
}