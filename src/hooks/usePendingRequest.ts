import { useEffect, useRef, useState } from "react";
import { RequestSubmission, sessionSlot, type PendingRequest } from "@/lib/requestSubmission";

/** One per form: restores a saved-but-unnotified request after reload (per browser tab). */
export function usePendingRequest(slot: string, onRestore: (pending: PendingRequest) => void) {
  const submission = useRef<RequestSubmission | null>(null);
  if (!submission.current) submission.current = new RequestSubmission(sessionSlot(`ervitex:pending-request:${slot}`));
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const [rejected, setRejected] = useState(false);
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;
  useEffect(() => {
    const s = new RequestSubmission(sessionSlot(`ervitex:pending-request:${slot}`));
    submission.current = s;
    const restored = s.restore();
    if (restored) { restoreRef.current(restored); setLocked(true); setPending(restored); setRejected(!!restored.rejected); }
  }, [slot]);
  const sync = () => {
    const s = submission.current; setLocked(!!s?.hasPending);
    setPending(s?.current ? { ...s.current } : null); setRejected(!!s?.isRejected);
  };
  const discard = () => { submission.current?.discard(); sync(); };
  return { submission: submission as React.MutableRefObject<RequestSubmission>, locked, sync, pending, rejected, discard };
}

export const pendingText = (lang: string) => lang === "lv"
  ? "Pieprasījums jau saglabāts; nospied sūtīt, lai pabeigtu paziņošanu."
  : "Request already saved; press send to finish notifying us.";
export const newRequestText = (lang: string) => lang === "lv" ? "Sākt jaunu pieprasījumu" : "Start a new request";
export const rejectedText = (lang: string) => lang === "lv"
  ? "Pieprasījums ir saglabāts, bet paziņojumu nevarēja apstiprināt. Atjauno lapu vai raksti birojs@ervitex.lv — nesūti to vēlreiz."
  : "Your request is saved but the notification could not be confirmed. Refresh or email birojs@ervitex.lv — do not resend it.";
