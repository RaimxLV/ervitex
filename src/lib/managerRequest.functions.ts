import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({ id: z.string().uuid(), key: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/).optional() });

/** Staff-only authorization: a request-scoped manager key from the PM email, or a signed-in admin.
 * The customer's action_token / ?v=pm are never accepted here. */
async function authorize(id: string, key?: string) {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
  const { authorizeManager } = await import("./managerAccess.server");
  const bearer = getRequestHeader("authorization")?.replace(/^Bearer\s+/i, "") || undefined;
  const result = await authorizeManager(sb, id, key, bearer);
  return { sb, ...result };
}

export const getManagerRequest = createServerFn({ method: "POST" })
  .inputValidator(input)
  .handler(async ({ data }) => {
    const { sb, ok, reason } = await authorize(data.id, data.key);
    if (!ok) return { authorized: false as const, reason };
    const { ARTWORK_COLUMNS, needsCheck, reassess, registerLegacy } = await import("./artworkReview.server");
    const { artworkReleasable } = await import("./artworkInspect");
    const { data: q, error } = await sb.from("quote_requests").select("id,ref,name,email,phone,company,message,items,print_method,print_placement,print_colors,deadline,file_urls,created_at,assigned_pm_name,assigned_pm_email,billing,action_token").eq("id", data.id).maybeSingle();
    if (error || !q) return { authorized: false as const, reason: "missing" };
    const { data: rows } = await sb.from("quote_artwork").select(ARTWORK_COLUMNS).eq("quote_id", data.id);
    let files = (rows || []) as any[];
    files = [...files, ...(await registerLegacy(sb, data.id, q.file_urls || [], files))];
    // On-demand, bounded automatic check of pending/legacy/stale files.
    files = await Promise.all(files.map((r) => (needsCheck(r) ? reassess(sb, r) : r)));
    return {
      authorized: true as const,
      request: { ...q, file_urls: undefined, action_token: undefined, worksheetPath: q.action_token ? `/saraksts/${q.action_token}?v=pm` : null },
      files: files.map((r) => ({ id: r.id, name: r.original_name, size: Number(r.byte_size), status: r.status, note: r.check_note, downloadable: artworkReleasable(r) })),
    };
  });

export const downloadManagerArtwork = createServerFn({ method: "POST" })
  .inputValidator(input.extend({ fileId: z.string().uuid(), retry: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const { sb, ok } = await authorize(data.id, data.key);
    if (!ok) throw new Error("Nav piekļuves.");
    const { ARTWORK_COLUMNS, reassess } = await import("./artworkReview.server");
    const { artworkReleasable } = await import("./artworkInspect");
    const { data: found } = await sb.from("quote_artwork").select(ARTWORK_COLUMNS).eq("id", data.fileId).eq("quote_id", data.id).maybeSingle();
    if (!found) throw new Error("Fails nav atrasts šim pieprasījumam.");
    const row = data.retry || !artworkReleasable(found) ? await reassess(sb, found) : found;
    if (!artworkReleasable(row)) return { url: null, status: row.status, note: row.check_note };
    const { data: signed, error } = await sb.storage.from(row.bucket).createSignedUrl(row.path, 60, { download: row.original_name });
    if (error || !signed) return { url: null, status: "error", note: "Lejupielādi neizdevās sagatavot. Mēģiniet vēlreiz." };
    return { url: signed.signedUrl, status: row.status, note: row.check_note };
  });
