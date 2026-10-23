import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { attachmentDownloadAllowed } from "./artworkPolicy";

export const downloadArtwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ path: z.string().max(260) }))
  .handler(async ({ data, context }) => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || admin !== true) throw new Error("Nav piekļuves.");
    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await sb.from("quote_artwork").select("status,path,stored").eq("path", data.path).maybeSingle();
    // Legacy files have no trusted verdict; preserve them, but never auto-certify/release them.
    if (error || !row?.stored || !attachmentDownloadAllowed(row.status, admin)) throw new Error("Fails gaida drošības pārbaudi vai ir bloķēts; lejupielāde nav pieejama.");
    const { data: signed, error: signError } = await sb.storage.from("quote-quarantine").createSignedUrl(row.path, 60, { download: "artwork" });
    if (signError || !signed) throw new Error("Lejupielāde nav pieejama.");
    return { url: signed.signedUrl };
  });