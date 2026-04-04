import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = "ofsetadruka@gmail.com";
    const tempPassword = "Ervitex2026!";

    // Check if user already exists
    const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    const existing = users.find((u: any) => u.email === email);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Reset password
      await adminClient.auth.admin.updateUserById(userId, { password: tempPassword, email_confirm: true });
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user.id;
    }

    // Ensure admin role exists
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!existingRole) {
      await adminClient.from("user_roles").insert({ user_id: userId, role: "admin" });
    }

    return new Response(
      JSON.stringify({ success: true, message: `Super admin created: ${email}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
