/** Request-scoped staff capability for the PM email. Only its SHA-256 is stored.
 * Set once per request (conditional update) so a retried notifier never invalidates an already-sent link;
 * without a fresh key the link still works after one staff sign-in. Never the customer's action_token. */
export const MANAGER_KEY_DAYS = 90;
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const hex = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map((n) => n.toString(16).padStart(2, "0")).join("");

export function managerRequestUrl(id: string, key?: string | null) {
  return `https://www.ervitex.lv/pieprasijums/${id}${key ? `#k=${key}` : ""}`;
}

export async function issueManagerLink(client: any, id: string, now = Date.now()) {
  const key = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const { data, error } = await client.from("quote_requests")
    .update({ manager_key_hash: await hex(key), manager_key_expires_at: new Date(now + MANAGER_KEY_DAYS * 864e5).toISOString() })
    .eq("id", id).is("manager_key_hash", null).select("id");
  return managerRequestUrl(id, !error && data?.length ? key : null);
}
