import { validateArtwork } from "./artworkPolicy";

/**
 * Owner policy: block executables/scripts, disguised and double-extension files; accept every other
 * allowed print-artwork format immediately. This is NOT antivirus — never call accepted files "scanned/clean".
 */
export const ARTWORK_POLICY_VERSION = "policy-v2";
export type Inspection = { ok: true; ext: string; mime: string; note: string } | { ok: false; reason: string };

export async function inspectArtwork(name: string, mime: string, bytes: Uint8Array): Promise<Inspection> {
  try { const meta = validateArtwork(name, mime, bytes); return { ok: true, ...meta, note: "Pieņemts" }; }
  catch (e) { return { ok: false, reason: e instanceof Error ? e.message : "Fails nav atļauts." }; }
}

/** A configured scanner's "infected" always blocks; acceptance is bound to the exact digest it checked. */
export function artworkReleasable(row: { status?: string | null; stored?: boolean | null; sha256?: string | null; checked_sha256?: string | null; policy_version?: string | null }) {
  if (!row.stored || row.status === "infected") return false;
  if (row.status === "clean") return !!row.sha256 && row.checked_sha256 === row.sha256;
  return row.status === "validated" && !!row.sha256 && row.checked_sha256 === row.sha256 && row.policy_version === ARTWORK_POLICY_VERSION;
}
