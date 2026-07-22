import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const baseData = {
      name: quote.name,
      email: quote.email,
      phone: quote.phone || "",
      company: quote.company || "",
      message: quote.message || "",
      items: Array.isArray(quote.items) ? quote.items : [],
      print_method: quote.print_method || "",
      print_placement: quote.print_placement || "",
      print_colors: quote.print_colors || "",
      deadline: quote.deadline || "",
      submittedAt: new Date().toLocaleString("lv-LV"),
    };

    const results: Array<{ to: string; template: string; ok: boolean; error?: string }> = [];

    // 1) Internal notification to office — with Reply-To set to the customer so
    //    staff can just hit "Reply" in their inbox.
    const { error: officeErr } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "quote-request",
        recipientEmail: OFFICE_EMAIL,
        replyTo: quote.email,
        idempotencyKey: `quote-${quote.id}-office`,
        templateData: { ...baseData, files: signedUrls },
      },
    });
    results.push({ to: OFFICE_EMAIL, template: "quote-request", ok: !officeErr, error: officeErr?.message });

    // 2) Auto-confirmation to the customer (no attachments/staff-only notes)
    if (quote.email) {
      const { error: custErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "quote-confirmation",
          recipientEmail: quote.email,
          replyTo: OFFICE_EMAIL,
          idempotencyKey: `quote-${quote.id}-customer`,
          templateData: baseData,
        },
      });
      results.push({ to: quote.email, template: "quote-confirmation", ok: !custErr, error: custErr?.message });
    }

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
