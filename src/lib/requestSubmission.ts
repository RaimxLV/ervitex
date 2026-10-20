import { z } from "zod";

export const requestContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(50).nullable().optional(),
  company: z.string().trim().max(200).nullable().optional(),
  message: z.string().max(10000).optional(),
}).passthrough();

/** Notification outcome: true = delivered, false = retryable, "rejected" = endpoint refused this capability. */
export type NotifyResult = boolean | "rejected";

export type PendingRequest = {
  id: string; key: string; payload: Record<string, unknown>; saved: boolean;
  /** Storage paths already uploaded for this request (never re-uploaded). */
  paths: string[];
  /** Names of attachments chosen for this request; used to report files lost on reload. */
  fileNames: string[];
};

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPending(v: unknown): v is PendingRequest {
  const p = v as PendingRequest;
  return !!p && typeof p === "object" && uuid.test(p.id) && uuid.test(p.key) && typeof p.payload === "object" && p.payload !== null
    && typeof p.saved === "boolean" && Array.isArray(p.paths) && p.paths.every((x) => typeof x === "string" && x.startsWith(`${p.id}/`))
    && Array.isArray(p.fileNames) && p.fileNames.every((x) => typeof x === "string");
}

/**
 * Retain one immutable payload and capability until delivery succeeds.
 * With a storage slot (per-tab sessionStorage), the pending request survives reloads so a
 * retry re-notifies the same saved request instead of inserting a new one.
 */
export class RequestSubmission {
  private pending: PendingRequest | null = null;
  private busy = false;
  constructor(private slot?: { store: Store; key: string }) {}
  get hasPending() { return this.pending !== null; }
  get current(): Readonly<PendingRequest> | null { return this.pending; }
  /** Load a pending request left by an earlier page load (call after hydration). */
  restore() {
    if (!this.slot || this.pending) return this.pending;
    try {
      const raw = this.slot.store.getItem(this.slot.key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isPending(parsed)) this.pending = parsed; else if (raw) this.slot.store.removeItem(this.slot.key);
    } catch { /* storage unavailable or corrupt: behave as in-memory */ }
    return this.pending;
  }
  private persist() {
    if (!this.slot) return;
    try {
      if (this.pending) this.slot.store.setItem(this.slot.key, JSON.stringify(this.pending));
      else this.slot.store.removeItem(this.slot.key);
    } catch { /* in-memory retry still works */ }
  }
  addPath(path: string) {
    if (!this.pending || this.pending.paths.includes(path)) return;
    this.pending.paths.push(path); this.persist();
  }
  /** Drop the pending request (delivered, or endpoint refused it). Never deletes the saved row. */
  clear() { this.pending = null; this.persist(); }
  async run(
    payload: Record<string, unknown>,
    save: (id: string, key: string, payload: Record<string, unknown>) => Promise<void>,
    notify: (id: string, key: string, pending: PendingRequest) => Promise<NotifyResult>,
    fileNames: string[] = [],
  ) {
    if (this.busy) return { state: "busy" as const };
    this.busy = true;
    try {
      const pending = this.pending ?? { id: crypto.randomUUID(), key: crypto.randomUUID(), payload: structuredClone(requestContactSchema.parse(payload)), saved: false, paths: [], fileNames: [...fileNames] };
      this.pending = pending; this.persist();
      // Uncertain saves retry with the same id/key; submit_quote_request is idempotent for them.
      if (!pending.saved) { await save(pending.id, pending.key, pending.payload); pending.saved = true; this.persist(); }
      const result = await notify(pending.id, pending.key, pending);
      if (result === true) { this.clear(); return { state: "delivered" as const, id: pending.id }; }
      if (result === "rejected") { this.clear(); return { state: "rejected" as const, id: pending.id }; }
      return { state: "saved" as const, id: pending.id };
    } finally { this.busy = false; }
  }
}

export const sessionSlot = (key: string) =>
  typeof window !== "undefined" && window.sessionStorage ? { store: window.sessionStorage, key } : undefined;
