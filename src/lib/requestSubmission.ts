import { z } from "zod";

export const requestContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(50).nullable().optional(),
  company: z.string().trim().max(200).nullable().optional(),
  message: z.string().max(10000).optional(),
}).passthrough();

/** Retain one immutable payload and capability until delivery succeeds. */
export class RequestSubmission {
  private pending: { id: string; key: string; payload: Record<string, unknown>; saved: boolean } | null = null;
  private busy = false;
  get hasPending() { return this.pending !== null; }
  async run(payload: Record<string, unknown>, save: (id: string, key: string, payload: Record<string, unknown>) => Promise<void>, notify: (id: string, key: string) => Promise<boolean>) {
    if (this.busy) return { state: "busy" as const };
    this.busy = true;
    try {
      const pending = this.pending ?? { id: crypto.randomUUID(), key: crypto.randomUUID(), payload: structuredClone(requestContactSchema.parse(payload)), saved: false };
      this.pending = pending;
      if (!pending.saved) { await save(pending.id, pending.key, pending.payload); pending.saved = true; }
      const delivered = await notify(pending.id, pending.key);
      if (delivered) this.pending = null;
      return { state: delivered ? "delivered" as const : "saved" as const, id: pending.id };
    } finally { this.busy = false; }
  }
}