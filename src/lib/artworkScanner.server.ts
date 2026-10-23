import { scanVerdict, type ScanState } from "./artworkPolicy";

/** A configured, private scanner must return a completed verdict bound to these exact bytes.
 * No archive extraction/document execution happens in this application.
 */
export async function scanArtwork(bytes: Uint8Array, sha256: string): Promise<ScanState> {
  const url = process.env['ARTWORK_SCANNER_URL'];
  const token = process.env['ARTWORK_SCANNER_TOKEN'];
  if (!url || !token) return "pending";
  try {
    const target = new URL(url);
    if (target.protocol !== "https:" || target.username || target.password) return "pending";
    const response = await fetch(target, { method: "POST", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream", "X-Content-SHA256": sha256 },
      body: new Blob([new Uint8Array(bytes).buffer]),
    });
    if (!response.ok) return "pending";
    const reader = response.body?.getReader();
    if (!reader) return "pending";
    const chunks: Uint8Array[] = []; let total = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        total += value.length; if (total > 4096) return "pending";
        chunks.push(value);
      }
    } finally { await reader.cancel(); }
    const merged = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { merged.set(chunk,offset); offset+=chunk.length; }
    const text = new TextDecoder().decode(merged);
    return scanVerdict(JSON.parse(text), sha256);
  } catch { return "pending"; }
}