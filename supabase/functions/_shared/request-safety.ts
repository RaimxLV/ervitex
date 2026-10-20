export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function scopedAttachmentPaths(id: string, paths: unknown): string[] {
  if (!uuidPattern.test(id) || !Array.isArray(paths) || paths.length > 20) throw new Error("Invalid attachments");
  return [...new Set(paths.map((path) => {
    if (typeof path !== "string" || path.length > 1024 || !path.startsWith(`${id}/`)) throw new Error("Invalid attachment scope");
    const name = path.slice(id.length + 1);
    if (!/^[0-9a-f-]{36}-[a-zA-Z0-9._-]+$/.test(name) || name.includes("..")) throw new Error("Invalid attachment path");
    return path;
  }))];
}
export function safeAttachmentName(url: string, fallback = "Fails") {
  const raw = url.split("?")[0].split("/").pop() || fallback;
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* malformed legacy URI remains readable */ }
  return decoded.replace(/^[0-9a-f]{8}-[0-9a-f-]{27}-/i, "");
}
export function canNotifyRequest(quote: { submission_key?: string | null }, key: unknown, admin: boolean) {
  return admin || (typeof key === "string" && uuidPattern.test(key) && !!quote.submission_key && quote.submission_key === key);
}