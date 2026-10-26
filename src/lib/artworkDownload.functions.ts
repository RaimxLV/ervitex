import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin dashboard attachment button: same automatic policy and digest binding as the manager panel. */
export const downloadArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ path: z.string().max(1024) }))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || admin !== true) throw new Error("Nav piekļuves.");
    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
    const { ARTWORK_COLUMNS, legacyPath, reassess, registerLegacy } = await import("./artworkReview.server");
    const { artworkReleasable } = await import("./artworkInspect");
    const quoteId = (data.path.includes("/quote-attachments/") ? data.path.split("/quote-attachments/")[1] : data.path).split("/")[0];
    if (!z.string().uuid().safeParse(quoteId).success) throw new Error("Fails nav atrasts.");
    const path = data.path.includes("/quote-attachments/") ? legacyPath(quoteId, data.path) : data.path;
    let { data: row } = await sb.from("quote_artwork").select(ARTWORK_COLUMNS).eq("quote_id", quoteId).eq("path", path || "").maybeSingle();
    if (!row) {
      const { data: q } = await sb.from("quote_requests").select("file_urls").eq("id", quoteId).maybeSingle();
      if (!q?.file_urls?.includes(data.path)) throw new Error("Fails nav atrasts.");
      row = (await registerLegacy(sb, quoteId, [data.path], []))[0] ?? null;
      if (!row) throw new Error("Failu neizdevās nolasīt. Mēģiniet vēlreiz.");
    }
    if (!artworkReleasable(row)) row = await reassess(sb, row);
    if (!artworkReleasable(row)) throw new Error(row.check_note || "Fails nav atļauts.");
    const { data: signed, error } = await sb.storage.from(row.bucket).createSignedUrl(row.path, 60, { download: row.original_name });
    if (error || !signed) throw new Error("Lejupielāde nav pieejama. Mēģiniet vēlreiz.");
    return { url: signed.signedUrl };
  });
