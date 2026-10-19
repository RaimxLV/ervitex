import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Mutating supplier syncs: only the service key (cron via invoke_sync_function, self-chaining)
// or a signed-in admin may call them. The public anon key is rejected.
export async function isSyncCallerAllowed(req: Request): Promise<boolean> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  // Scheduled calls may carry an older-format service key: verify it by an admin-only call.
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, token, { auth: { persistSession: false } });
    const { error } = await svc.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) return true;
  } catch { /* not a service key */ }
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await userClient.auth.getUser(token);
  if (!data?.user) return false;
  const { data: ok } = await userClient.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok === true;
}
