import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: categories, error: fetchError } = await supabase
      .from("categories")
      .select("id, name_lv, name_en, description_lv, description_en, slug")
      .order("sort_order");

    if (fetchError) throw fetchError;
    if (!categories || categories.length === 0) {
      return new Response(JSON.stringify({ done: true, translated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name_lv: c.name_lv,
      name_en: c.name_en,
      description_lv: c.description_lv || "",
      description_en: c.description_en || "",
    }));

    const prompt = `You are a professional translator for a workwear and promotional clothing company called Ervitex.

Translate/create category descriptions for an e-commerce site. Each category needs:
- A short, professional description in both Latvian (description_lv) and English (description_en)
- 1-2 sentences describing what products are in that category
- Keep it concise and SEO-friendly

If description_lv already exists, translate it to English. If both are empty, create descriptions based on the category name.

INPUT:
${JSON.stringify(payload, null, 2)}

Return ONLY valid JSON array:
[{"id":"...","description_lv":"...","description_en":"..."}]`;

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
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) content = jsonMatch[1].trim();

    let translations: any[];
    try {
      translations = JSON.parse(content);
    } catch {
      throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
    }

    let updated = 0;
    for (const t of translations) {
      if (!t.id) continue;
      const updateData: any = {};
      if (t.description_lv) updateData.description_lv = t.description_lv;
      if (t.description_en) updateData.description_en = t.description_en;

      const { error: updateError } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", t.id);

      if (!updateError) updated++;
    }

    return new Response(
      JSON.stringify({ done: true, translated: updated, total: categories.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
