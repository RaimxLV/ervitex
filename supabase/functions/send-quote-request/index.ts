import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendAppEmail } from "../_shared/send-app-email.ts";

const OFFICE_EMAIL = "birojs@ervitex.lv";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { request_id, file_urls: uploadedPaths } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (Array.isArray(uploadedPaths) && uploadedPaths.length > 0) {
      const clean = uploadedPaths.filter((p: unknown): p is string => typeof p === "string" && !!p).slice(0, 20);
      if (clean.length > 0) {
        await supabase.from("quote_requests").update({ file_urls: clean }).eq("id", request_id);
      }
    }

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

    // Convert stored paths -> 30-day signed URLs
    const rawFiles: string[] = Array.isArray(quote.file_urls) ? quote.file_urls : [];
    const signedUrls: string[] = [];
    for (const entry of rawFiles) {
      if (typeof entry !== "string" || !entry) continue;
      if (/^https?:\/\//i.test(entry)) { signedUrls.push(entry); continue; }
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
      submittedAt: new Date().toLocaleString("lv-LV"),
      worksheetUrl,
      billing: (() => {
        const b = (quote.billing || {}) as Record<string, string>;
        const L: Record<string, string> = { company: "Uzņēmums", regNo: "Reģ. Nr.", vatNo: "PVN Nr.", address: "Juridiskā adrese", delivery: "Piegādes adrese", bank: "Banka", iban: "Konta numurs (IBAN)", bic: "SWIFT/BIC" };
        return Object.keys(L).filter((k) => b[k]).map((k) => `${L[k]}: ${b[k]}`);
      })(),
    };

    // Jaunie pieprasījumi automātiski tiek sadalīti pa apli starp projektu vadītājām.
    const ROTATION = [
      { slug: "laura", name: "Laura", email: "birojs@ervitex.lv" },
      { slug: "ilona", name: "Ilona", email: "ilona@ervitex.lv" },
      { slug: "justine", name: "Justīne", email: "justine@ervitex.lv" },
      { slug: "santa", name: "Santa", email: "santa.k@ervitex.lv" },
    ];
    if (!quote.assigned_pm_slug) {
      const { count } = await supabase
        .from("quote_requests")
        .select("id", { count: "exact", head: true })
        .in("assigned_pm_slug", ROTATION.map((p) => p.slug));
      const next = ROTATION[(count ?? 0) % ROTATION.length];
      await supabase
        .from("quote_requests")
        .update({
          assigned_pm_slug: next.slug,
          assigned_pm_name: next.name,
          assigned_pm_email: next.email,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", quote.id)
        .is("assigned_pm_slug", null);
      quote.assigned_pm_slug = next.slug;
      quote.assigned_pm_name = next.name;
      quote.assigned_pm_email = next.email;
    }

    // Klients saņem vēstuli no konkrētās projektu vadītājas (līdz nodošanai — Laura).
    const pm = {
      email: quote.assigned_pm_email || "birojs@ervitex.lv",
      name: quote.assigned_pm_name || "Laura",
    };

    const results: Array<{ to: string; template: string; ok: boolean; error?: string }> = [];

    // 1) Internal notification to the assigned project manager — with Reply-To
    //    set to the customer so staff can just hit "Reply" in their inbox.
    const notifyEmail = quote.assigned_pm_email || OFFICE_EMAIL;
    const officeRes = await sendAppEmail("quote-request", notifyEmail, {
        replyTo: quote.email,
        fromEmail: OFFICE_EMAIL,
        fromName: quote.name,
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
      JSON.stringify({ ok: true, delivered, recipients: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
