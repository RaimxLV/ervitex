import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const OFFICE_BCC = "birojs@ervitex.lv";

const escapeHtml = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildEmail = (q: any) => {
  const items: any[] = Array.isArray(q.items) ? q.items : [];
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;">
          <strong>${escapeHtml(it.name || "-")}</strong><br>
          <span style="color:#666;font-size:12px;">${escapeHtml(it.code || "")} · ${escapeHtml(it.brand || "")}</span>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;">${escapeHtml(it.colorName || "-")}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;">${escapeHtml(it.size || "-")}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;text-align:right;font-weight:bold;">${escapeHtml(it.qty || 0)}</td>
      </tr>`,
    )
    .join("");

  const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);

  const files: string[] = Array.isArray(q._signed_file_urls) ? q._signed_file_urls : (Array.isArray(q.file_urls) ? q.file_urls : []);
  const filesHtml = files.length
    ? `<h3 style="font-size:14px;margin:20px 0 6px;">Pievienotie faili</h3>
       <ul style="padding-left:18px;font-size:13px;">
         ${files.map((u) => `<li><a href="${escapeHtml(u)}">${escapeHtml((u.split("?")[0] || u).split("/").pop() || u)}</a></li>`).join("")}
       </ul>`
    : "";

  const printBlock =
    q.print_method || q.print_placement || q.print_colors || q.deadline
      ? `<h3 style="font-size:14px;margin:20px 0 6px;">Apdrukas informācija</h3>
         <table style="font-size:13px;">
           ${q.print_method ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Metode:</td><td>${escapeHtml(q.print_method)}</td></tr>` : ""}
           ${q.print_placement ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Izvietojums:</td><td>${escapeHtml(q.print_placement)}</td></tr>` : ""}
           ${q.print_colors ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Krāsu skaits:</td><td>${escapeHtml(q.print_colors)}</td></tr>` : ""}
           ${q.deadline ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Termiņš:</td><td>${escapeHtml(q.deadline)}</td></tr>` : ""}
         </table>`
      : "";

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;max-width:680px;margin:0 auto;padding:20px;">
    <div style="border-bottom:3px solid #E11D2E;padding-bottom:12px;margin-bottom:16px;">
      <h1 style="font-size:20px;margin:0;letter-spacing:0.5px;">JAUNS PIEPRASĪJUMS</h1>
      <p style="color:#666;font-size:12px;margin:4px 0 0;">ervitex.lv · ${new Date().toLocaleString("lv-LV")}</p>
    </div>

    <h3 style="font-size:14px;margin:0 0 6px;">Klients</h3>
    <table style="font-size:14px;">
      <tr><td style="padding:2px 12px 2px 0;color:#666;">Vārds:</td><td><strong>${escapeHtml(q.name)}</strong></td></tr>
      <tr><td style="padding:2px 12px 2px 0;color:#666;">E-pasts:</td><td><a href="mailto:${escapeHtml(q.email)}">${escapeHtml(q.email)}</a></td></tr>
      ${q.phone ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Tālrunis:</td><td>${escapeHtml(q.phone)}</td></tr>` : ""}
      ${q.company ? `<tr><td style="padding:2px 12px 2px 0;color:#666;">Uzņēmums:</td><td>${escapeHtml(q.company)}</td></tr>` : ""}
    </table>

    <h3 style="font-size:14px;margin:20px 0 6px;">Preces (${totalQty} gab.)</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#111;color:#fff;">
          <th style="padding:8px;text-align:left;font-size:12px;">Prece</th>
          <th style="padding:8px;text-align:left;font-size:12px;">Krāsa</th>
          <th style="padding:8px;text-align:left;font-size:12px;">Izmērs</th>
          <th style="padding:8px;text-align:right;font-size:12px;">Skaits</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    ${printBlock}

    ${q.message ? `<h3 style="font-size:14px;margin:20px 0 6px;">Piezīmes</h3><p style="white-space:pre-line;font-size:13px;background:#f7f7f7;padding:10px;border-radius:4px;">${escapeHtml(q.message)}</p>` : ""}

    ${filesHtml}

    <hr style="border:none;border-top:1px solid #eee;margin:24px 0 12px;">
    <p style="font-size:11px;color:#999;">
      Šis pieprasījums saglabāts arī Ervitex administrācijas panelī. Atbildi klientam tieši, spiežot uz Reply — atbilde aizies uz <strong>${escapeHtml(q.email)}</strong>.
    </p>
  </body></html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { request_id } = await req.json();
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

    const to = quote.assigned_pm_email || OFFICE_BCC;
    const subject = `[Ervitex pieprasījums] ${quote.name}${quote.company ? " · " + quote.company : ""}`;
    const html = buildEmail(quote);

    // Try Lovable transactional email function first (if configured)
    let delivered = false;
    let deliveryNote = "queued";
    try {
      const { error: txErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "raw-html",
          recipientEmail: to,
          idempotencyKey: `quote-${quote.id}`,
          replyTo: quote.email,
          bcc: [OFFICE_BCC],
          templateData: { subject, html },
        },
      });
      if (!txErr) delivered = true;
      else deliveryNote = "no email domain configured — request saved in admin panel only";
    } catch {
      deliveryNote = "no email domain configured — request saved in admin panel only";
    }

    return new Response(
      JSON.stringify({ ok: true, delivered, to, note: deliveryNote }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
