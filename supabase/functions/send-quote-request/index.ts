import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendAppEmail } from "../_shared/send-app-email.ts";
import { uuidPattern, scopedAttachmentPaths, canNotifyRequest } from "../_shared/request-safety.ts";

const OFFICE_EMAIL = "birojs@ervitex.lv";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { request_id, submission_key, file_urls: uploadedPaths = [] } = await req.json();
    if (typeof request_id !== "string" || !uuidPattern.test(request_id)) {
      return new Response(JSON.stringify({ error: "request_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const backendUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!backendUrl || !serviceKey) throw new Error("Service unavailable");
    const supabase = createClient(backendUrl, serviceKey);

    const { data: quote, error } = await supabase
      .from("quote_requests")
      .select("*")
      .eq("id", request_id)
      .maybeSingle();

    if (error || !quote) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // A UUID alone is not permission to patch attachments or trigger mail.
    let admin = false;
    const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer && bearer !== Deno.env.get("SUPABASE_ANON_KEY")) {
      const { data: auth, error: authError } = await supabase.auth.getUser(bearer);
      if (!authError && auth.user) {
        const { data: role, error: roleError } = await supabase.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
        admin = !roleError && role === true;
      }
    }
    if (!canNotifyRequest(quote, submission_key, admin)) return new Response(JSON.stringify({ error: "Not allowed" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const clean = scopedAttachmentPaths(request_id, uploadedPaths);
    if (clean.length) {
      const paths = [...new Set([...(quote.file_urls || []), ...clean])];
      if (paths.length > 20) throw new Error("Too many attachments");
      const { error: updateError } = await supabase.from("quote_requests").update({ file_urls: paths }).eq("id", request_id);
      if (updateError) throw updateError;
      quote.file_urls = paths;
    }
    if (!quote.assigned_pm_slug || !quote.assigned_pm_name || !quote.assigned_pm_email) {
      return new Response(JSON.stringify({ error: "Assigned manager missing" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Convert stored paths -> 30-day signed URLs
    const rawFiles: string[] = Array.isArray(quote.file_urls) ? quote.file_urls : [];
    const signedUrls: string[] = [];
    for (const entry of rawFiles) {
      if (typeof entry !== "string" || !entry) continue;
      try { scopedAttachmentPaths(request_id, [entry]); } catch { continue; }
      const { data: signed } = await supabase.storage
        .from("quote-attachments")
        .createSignedUrl(entry, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) signedUrls.push(signed.signedUrl);
    }

    const worksheetUrl = quote.action_token
      ? `https://www.ervitex.lv/saraksts/${quote.action_token}`
      : "";

    const baseData = {
      ref: quote.ref || "",
      name: quote.name,
      email: quote.email,
      phone: quote.phone || "",
      company: quote.company || "",
      message: quote.message || "",
      print_method: quote.print_method || "",
      print_placement: quote.print_placement || "",
      print_colors: quote.print_colors || "",
      deadline: quote.deadline || "",
      submittedAt: new Date(quote.created_at).toLocaleString("lv-LV"),
      pmName: quote.assigned_pm_name,
      pmEmail: quote.assigned_pm_email,
      worksheetUrl,
      billing: (() => {
        const b = (quote.billing || {}) as Record<string, string>;
        const L: Record<string, string> = { company: "Uzņēmums", regNo: "Reģ. Nr.", vatNo: "PVN Nr.", address: "Juridiskā adrese", delivery: "Piegādes adrese", bank: "Banka", iban: "Konta numurs (IBAN)", bic: "SWIFT/BIC" };
        return Object.keys(L).filter((k) => b[k]).map((k) => `${L[k]}: ${b[k]}`);
      })(),
    };

    const results: Array<{ to: string; template: string; ok: boolean; error?: string }> = [];

    // 1) Internal notification to the assigned project manager — with Reply-To
    //    set to the customer so staff can just hit "Reply" in their inbox.
    const notifyEmail = quote.assigned_pm_email;
    const officeRes = await sendAppEmail("quote-request", notifyEmail, {
        replyTo: quote.email,
        fromEmail: OFFICE_EMAIL,
        fromName: "Ervitex",
        idempotencyKey: `quote-${quote.id}-office`,
        templateData: {
          ...baseData,
          worksheetUrl: worksheetUrl ? `${worksheetUrl}?v=pm` : "",
          files: signedUrls,
          fileCount: rawFiles.length,
        },
    });
    results.push({ to: notifyEmail, template: "quote-request", ok: officeRes.ok, error: officeRes.ok ? undefined : officeRes.error || officeRes.reason });

    // Klientam e-pastu nesūta — pieprasījumu saņem tikai projektu vadītāja.

    const delivered = results.some(r => r.ok);
    return new Response(
      JSON.stringify({ ok: true, delivered }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Paziņojumu neizdevās nosūtīt" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
