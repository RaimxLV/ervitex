import { ARTWORK_POLICY_VERSION, inspectArtwork } from "./artworkInspect";
import { scanArtwork, scannerConfigured } from "./artworkScanner.server";

type Sb = any;
export type ArtworkRow = { id: string; quote_id: string; path: string; bucket: string; original_name: string; byte_size: number; sha256: string; mime: string; status: string; stored: boolean; checked_sha256: string | null; policy_version: string | null; check_note: string | null; legacy: boolean };
export const ARTWORK_COLUMNS = "id,quote_id,path,bucket,original_name,byte_size,sha256,mime,status,stored,checked_sha256,policy_version,check_note,legacy";

export const sha256Hex = async (bytes: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer))).map((n) => n.toString(16).padStart(2, "0")).join("");

/** Decide an outcome for exact bytes. Scanner infected always blocks; scanner outage is "error", never clean. */
export async function assessBytes(name: string, mime: string, bytes: Uint8Array, sha256: string) {
  const inspected = await inspectArtwork(name, mime, bytes);
  if (!inspected.ok) return { status: "rejected", note: inspected.reason, mime: null as string | null };
  if (scannerConfigured()) {
    const verdict = await scanArtwork(bytes, sha256);
    if (verdict === "infected") return { status: "infected", note: "Pretvīrusu pārbaude atrada draudu.", mime: inspected.mime };
    if (verdict === "clean") return { status: "clean", note: "Pretvīrusu pārbaude: tīrs", mime: inspected.mime };
    return { status: "error", note: "Pretvīrusu pārbaude īslaicīgi nav pieejama. Mēģiniet vēlreiz.", mime: inspected.mime };
  }
  return { status: "validated", note: inspected.note, mime: inspected.mime };
}

/** Re-read stored bytes, bind the outcome to their digest and persist it. Original bytes are never modified. */
export async function reassess(sb: Sb, row: ArtworkRow): Promise<ArtworkRow> {
  const save = async (patch: Partial<ArtworkRow>) => {
    const next = { ...patch, checked_at: new Date().toISOString(), policy_version: ARTWORK_POLICY_VERSION };
    await sb.from("quote_artwork").update(next).eq("id", row.id).eq("quote_id", row.quote_id);
    return { ...row, ...next } as ArtworkRow;
  };
  try {
    const { data: blob, error } = await sb.storage.from(row.bucket).download(row.path);
    if (error || !blob) return save({ status: "error", check_note: "Failu neizdevās nolasīt. Mēģiniet vēlreiz.", checked_sha256: null });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const digest = await sha256Hex(bytes);
    if (digest !== row.sha256 || bytes.length !== Number(row.byte_size)) return save({ status: "rejected", check_note: "Saglabātais fails neatbilst reģistrētajam saturam.", checked_sha256: digest });
    const result = await assessBytes(row.original_name, "", bytes, digest);
    return save({ status: result.status, check_note: result.note, checked_sha256: digest });
  } catch {
    return save({ status: "error", check_note: "Pārbaude pārtrūka. Mēģiniet vēlreiz.", checked_sha256: null });
  }
}

export const legacyName = (path: string) => {
  const raw = path.split("/").pop() || "fails";
  const name = raw.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
  try { return decodeURIComponent(name).slice(0, 180); } catch { return name.slice(0, 180); }
};
export const legacyPath = (requestId: string, url: string) => {
  const path = url.includes("/quote-attachments/") ? url.split("/quote-attachments/")[1].split("?")[0] : url;
  return path.startsWith(`${requestId}/`) && !path.includes("..") ? path : null;
};

/** Register older direct-upload attachments on demand so they pass through the same policy. */
export async function registerLegacy(sb: Sb, requestId: string, fileUrls: string[], known: ArtworkRow[]) {
  const out: ArtworkRow[] = [];
  for (const url of fileUrls.slice(0, 20)) {
    if (known.some((r) => r.path === url)) continue;
    const path = legacyPath(requestId, url);
    if (!path || known.some((r) => r.path === path)) continue;
    const { data: blob } = await sb.storage.from("quote-attachments").download(path);
    if (!blob || blob.size < 1 || blob.size > 15728640) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const row = { id: crypto.randomUUID(), quote_id: requestId, path, bucket: "quote-attachments", original_name: legacyName(path) || "fails", byte_size: bytes.length, sha256: await sha256Hex(bytes), mime: "application/octet-stream", status: "pending", stored: true, legacy: true };
    const { error } = await sb.from("quote_artwork").insert(row);
    if (!error) out.push({ ...row, checked_sha256: null, policy_version: null, check_note: null });
  }
  return out;
}

export const needsCheck = (r: ArtworkRow) => r.stored && r.status !== "infected" && (r.status === "pending" || r.status === "error" || r.policy_version !== ARTWORK_POLICY_VERSION || r.checked_sha256 !== r.sha256);
