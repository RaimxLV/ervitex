import { createClient } from "@supabase/supabase-js";

export const keyHash = async (key: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key)))).map((n) => n.toString(16).padStart(2, "0")).join("");
const sameHex = (a: string, b: string) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

/** ok when a request-scoped, unexpired manager key matches, or the bearer belongs to an admin. */
export async function authorizeManager(sb: any, id: string, key: string | undefined, bearer: string | undefined, now = Date.now()): Promise<{ ok: boolean; reason?: "expired" | "signin" }> {
  if (key) {
    const { data } = await sb.from("quote_requests").select("manager_key_hash,manager_key_expires_at").eq("id", id).maybeSingle();
    if (data?.manager_key_hash && sameHex(data.manager_key_hash, await keyHash(key))) {
      if (data.manager_key_expires_at && Date.parse(data.manager_key_expires_at) > now) return { ok: true };
      if (!(await isAdmin(bearer))) return { ok: false, reason: "expired" };
      return { ok: true };
    }
  }
  return (await isAdmin(bearer)) ? { ok: true } : { ok: false, reason: "signin" };
}

async function isAdmin(bearer?: string) {
  const url = process.env["SUPABASE_URL"], pub = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!bearer || !url || !pub || bearer === pub) return false;
  try {
    const user = createClient(url, pub, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${bearer}` }, fetch: (input, init) => { const h = new Headers(init?.headers); h.set("apikey", pub); return fetch(input, { ...init, headers: h }); } } });
    const { data: auth } = await user.auth.getUser(bearer);
    if (!auth?.user) return false;
    const { data } = await user.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
    return data === true;
  } catch { return false; }
}
