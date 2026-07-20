const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const { texts, target = "lv" } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ translations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const targetLang = target === "en" ? "English" : "Latvian";
    const prompt = `Translate each item in the JSON array below to ${targetLang}. Preserve bullet markers (•, -, ✓), line breaks, numbers and units. Do not add commentary. Return ONLY a JSON array of the same length with translated strings.

INPUT: ${JSON.stringify(texts)}
OUTPUT:`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });
    if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
    const data = await r.json();
    let content: string = data.choices?.[0]?.message?.content || "[]";
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) content = m[1].trim();
    let translations: string[] = [];
    try { translations = JSON.parse(content); } catch { translations = texts; }
    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
