import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 10;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { offset = 0, limit = BATCH_SIZE } = await req.json().catch(() => ({}));

    // Fetch products that need translation (name_en equals name_lv or desc_en equals desc_lv)
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, name_lv, name_en, description_lv, description_en, long_description_lv, long_description_en")
      .eq("active", true)
      .range(offset, offset + limit - 1);

    if (fetchError) throw fetchError;
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ done: true, translated: 0, offset }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter to only those needing translation
    const needsTranslation = products.filter(
      (p) =>
        p.name_en === p.name_lv ||
        p.name_en === "" ||
        !p.name_en ||
        p.description_en === p.description_lv
    );

    if (needsTranslation.length === 0) {
      return new Response(
        JSON.stringify({ done: false, translated: 0, skipped: products.length, offset: offset + limit }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt for batch translation
    const productsPayload = needsTranslation.map((p) => ({
      id: p.id,
      name_lv: p.name_lv,
      description_lv: p.description_lv || "",
      long_description_lv: p.long_description_lv || "",
    }));

    const prompt = `You are a professional translator specializing in workwear, promotional clothing, and textile products. Translate the following product data from Latvian to English.

RULES:
- Translate product names into clear, professional English product names (not just codes)
- If the name_lv is just a product code (numbers/letters like "010177"), create a descriptive English name based on the description
- Keep technical specifications (measurements, materials) accurate
- Keep Markdown formatting (###, •, **bold**) intact in descriptions
- Return ONLY valid JSON array, no extra text

INPUT:
${JSON.stringify(productsPayload, null, 2)}

OUTPUT FORMAT (JSON array):
[{"id":"...","name_en":"...","description_en":"...","long_description_en":"..."}]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from possible markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) content = jsonMatch[1].trim();

    let translations: any[];
    try {
      translations = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
    }

    // Update each product
    let updated = 0;
    for (const t of translations) {
      if (!t.id || !t.name_en) continue;

      const updateData: any = { name_en: t.name_en };
      if (t.description_en) updateData.description_en = t.description_en;
      if (t.long_description_en) updateData.long_description_en = t.long_description_en;

      const { error: updateError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", t.id);

      if (!updateError) updated++;
    }

    return new Response(
      JSON.stringify({
        done: false,
        translated: updated,
        total_in_batch: products.length,
        offset: offset + limit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
