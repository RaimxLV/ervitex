import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const OFFICE_BCC = "birojs@ervitex.lv";

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

    // If the client uploaded attachments after inserting the request, persist them now
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

    const primaryTo = quote.assigned_pm_email || OFFICE_BCC;
    const recipients = Array.from(
      new Set([primaryTo, OFFICE_BCC].filter(Boolean).map((r: string) => r.toLowerCase())),
    );

    const templateData = {
      name: quote.name,
      email: quote.email,
      phone: quote.phone || "",
      company: quote.company || "",
      message: quote.message || "",
      items: Array.isArray(quote.items) ? quote.items : [],
      files: signedUrls,
      print_method: quote.print_method || "",
      print_placement: quote.print_placement || "",
      print_colors: quote.print_colors || "",
      deadline: quote.deadline || "",
      submittedAt: new Date().toLocaleString("lv-LV"),
    };

    const results: Array<{ to: string; ok: boolean; error?: string }> = [];
    for (const to of recipients) {
      const { error: txErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "quote-request",
          recipientEmail: to,
          idempotencyKey: `quote-${quote.id}-${to}`,
          templateData,
        },
      });
      results.push({ to, ok: !txErr, error: txErr?.message });
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
