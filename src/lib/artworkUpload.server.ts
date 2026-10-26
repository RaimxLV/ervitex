import { z } from "zod";
import { ARTWORK_LIMITS, validateArtwork } from "./artworkPolicy";
import { assessBytes } from "./artworkReview.server";
import { ARTWORK_POLICY_VERSION, inspectArtwork } from "./artworkInspect";

export const uploadHeaders = z.object({ requestId: z.string().uuid(), key: z.string().uuid(), fileId: z.string().uuid(), name: z.string().min(1).max(180), mime: z.string().max(120) });
export async function boundedArtworkBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Trūkst faila.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > ARTWORK_LIMITS.fileBytes) throw new Error("Fails pārsniedz 15 MB.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function handleArtworkUpload(request: Request): Promise<Response> {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const origin = request.headers.get("Origin");
    if (!origin || origin !== new URL(request.url).origin) return json({ error: "Not allowed" }, 403);
    const meta = uploadHeaders.parse({ requestId: request.headers.get("X-Request-Id"), key: request.headers.get("X-Submission-Key"), fileId: request.headers.get("X-File-Id"), name: decodeURIComponent(request.headers.get("X-File-Name") || ""), mime: request.headers.get("X-File-Type") || "" });
    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
    const { data: q, error } = await sb.from("quote_requests").select("submission_key").eq("id", meta.requestId).maybeSingle();
    if (error || !q || q.submission_key !== meta.key) return json({ error: "Not allowed" }, 403);
    const bytes = await boundedArtworkBody(request);
    const valid = validateArtwork(meta.name, meta.mime, bytes);
    // Unsafe/unsupported content is refused immediately with a reason, before anything is reserved or stored.
    const pre = await inspectArtwork(meta.name, meta.mime, bytes);
    if (!pre.ok) return json({ error: `${meta.name}: ${pre.reason}` }, 400);
    const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer))).map((n) => n.toString(16).padStart(2,"0")).join("");
    const db = sb;
    const path = `${meta.requestId}/${meta.fileId}-artwork.${valid.ext}`;
    const { data: reserved, error: reserveError } = await db.rpc("reserve_quote_artwork", { _request: meta.requestId, _key: meta.key, _file: meta.fileId, _path: path, _name: meta.name, _size: bytes.length, _digest: sha256, _mime: valid.mime });
    if (reserveError || !reserved) return json({ error: "Failu limits vai atkārtojuma identitāte nav derīga." }, 409);
    if (reserved === "existing") {
      // Idempotent retry: same file id must carry the exact same bytes; final verdicts are preserved.
      const { data: existing, error: existingError } = await db.from("quote_artwork").select("status,sha256,checked_sha256,policy_version,check_note,path").eq("id", meta.fileId).eq("quote_id", meta.requestId).maybeSingle();
      if (existingError || !existing) return json({ error: "Failu neizdevās nolasīt. Mēģini vēlreiz." }, 503);
      if (existing.sha256 !== sha256 || existing.path !== path) return json({ error: "Faila atkārtojuma identitāte neatbilst." }, 409);
      if (existing.status === "infected" || existing.status === "rejected") return json({ error: `${meta.name}: ${existing.check_note || "Fails nav pieņemts."}` }, 422);
      if (existing.status === "validated" && existing.checked_sha256 === sha256 && existing.policy_version === ARTWORK_POLICY_VERSION) return json({ path, status: existing.status, message: existing.check_note });
      // Otherwise (pending/error/old policy) continue through the same store-and-accept path below.
    }
    const { error: uploadError } = await sb.storage.from("quote-quarantine").upload(path, bytes, { contentType: "application/octet-stream", upsert: false });
    if (uploadError) {
      // An interrupted response may leave the exact object already stored. Verify it before retrying status.
      const { data: saved } = await sb.storage.from("quote-quarantine").download(path);
      if (!saved || saved.size !== bytes.length) return json({ error: "Failu neizdevās saglabāt. Mēģini vēlreiz ar to pašu pieprasījumu." }, 503);
      const storedDigest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await saved.arrayBuffer()))).map((n) => n.toString(16).padStart(2,"0")).join("");
      if (storedDigest !== sha256) return json({ error: "Faila atkārtojuma identitāte neatbilst." }, 409);
    }
    const result = await assessBytes(meta.name, meta.mime, bytes, sha256);
    const { error: stateError } = await db.from("quote_artwork").update({ status: result.status, stored: true, check_note: result.note, checked_sha256: sha256, policy_version: ARTWORK_POLICY_VERSION, checked_at: new Date().toISOString() }).eq("id", meta.fileId).eq("quote_id", meta.requestId);
    if (stateError) return json({ error: "Fails saglabāts, bet pārbaudes statusu neizdevās ierakstīt. Mēģini vēlreiz." }, 503);
    if (result.status === "rejected" || result.status === "infected") return json({ error: `${meta.name}: ${result.note}` }, 422);
    return json({ path, status: result.status, message: result.note });
  } catch (error) {
    return json({ error: error instanceof Error && !error.message.includes("Supabase") ? error.message : "Failu nevar pieņemt." }, 400);
  }
}