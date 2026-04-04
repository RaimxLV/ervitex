import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPER_ADMIN_EMAIL = "ofsetadruka@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify caller is super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller || caller.email !== SUPER_ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Admin client with service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, ...params } = await req.json();

    switch (action) {
      case "list": {
        const { data: roles } = await adminClient.from("user_roles").select("user_id, role");
        const adminUserIds = (roles || []).map((r: any) => r.user_id);
        
        const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
        if (error) throw error;

        const adminUsers = users
          .filter((u: any) => adminUserIds.includes(u.id))
          .map((u: any) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            banned: u.banned_until ? true : false,
            is_super: u.email === SUPER_ADMIN_EMAIL,
          }));

        return new Response(JSON.stringify({ users: adminUsers }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "create": {
        const { email, password } = params;
        if (!email || !password) throw new Error("Email and password required");

        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createErr) throw createErr;

        // Assign admin role
        const { error: roleErr } = await adminClient.from("user_roles").insert({
          user_id: newUser.user.id,
          role: "admin",
        });
        if (roleErr) throw roleErr;

        return new Response(JSON.stringify({ success: true, user_id: newUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_password": {
        const { user_id, password } = params;
        if (!user_id || !password) throw new Error("User ID and password required");

        // Prevent modifying super admin
        const { data: { user: targetUser } } = await adminClient.auth.admin.getUserById(user_id);
        if (targetUser?.email === SUPER_ADMIN_EMAIL) {
          throw new Error("Cannot modify super admin via this endpoint");
        }

        const { error } = await adminClient.auth.admin.updateUserById(user_id, { password });
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "toggle_ban": {
        const { user_id, ban } = params;
        if (!user_id) throw new Error("User ID required");

        const { data: { user: targetUser } } = await adminClient.auth.admin.getUserById(user_id);
        if (targetUser?.email === SUPER_ADMIN_EMAIL) {
          throw new Error("Cannot ban super admin");
        }

        if (ban) {
          const { error } = await adminClient.auth.admin.updateUserById(user_id, {
            ban_duration: "876000h", // ~100 years
          });
          if (error) throw error;
        } else {
          const { error } = await adminClient.auth.admin.updateUserById(user_id, {
            ban_duration: "none",
          });
          if (error) throw error;
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "delete": {
        const { user_id } = params;
        if (!user_id) throw new Error("User ID required");

        const { data: { user: targetUser } } = await adminClient.auth.admin.getUserById(user_id);
        if (targetUser?.email === SUPER_ADMIN_EMAIL) {
          throw new Error("Cannot delete super admin");
        }

        await adminClient.from("user_roles").delete().eq("user_id", user_id);
        const { error } = await adminClient.auth.admin.deleteUser(user_id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
