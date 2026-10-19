import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { offerEmailData } from "./offerEmailData";
import type { Offer } from "./offer";

export const sendOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ offerId: z.string().uuid(), expectedUpdatedAt: z.string().min(1).max(100) }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !isAdmin) throw new Error("Nav piekļuves");
    const { data: row, error } = await context.supabase.from("pm_offers").select("*").eq("id", data.offerId).maybeSingle();
    if (error || !row) throw new Error("Piedāvājums nav atrasts");
    if (row.updated_at !== data.expectedUpdatedAt) throw new Error("Piedāvājums ir mainījies. Atveriet to vēlreiz.");
    const offer = row as unknown as Offer;
    const email = z.string().email().parse(offer.client_email);
    if (!offer.items.length || offer.status === "draft") throw new Error("Vispirms saglabājiet piedāvājumu");
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    return sendTemplateEmail("pm-offer", email, {
      templateData: offerEmailData(offer), replyTo: offer.pm_email || "birojs@ervitex.lv",
      idempotencyKey: `pm-offer-${offer.id}-${offer.updated_at}`,
    });
  });