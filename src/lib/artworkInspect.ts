import { ARTWORK_LIMITS, validateArtwork } from "./artworkPolicy";

/**
 * Automatic file-protection policy (NOT antivirus). A file passes only when its
 * bytes match an allowed artwork format and bounded structural checks find no
 * active content. Result "validated" must never be presented as "scanned/clean".
 */
export const ARTWORK_POLICY_VERSION = "policy-v1";
export type Inspection = { ok: true; ext: string; mime: string; note: string } | { ok: false; reason: string };

const MAX_INFLATE = 60 * 1024 * 1024; // total decompressed bytes inspected per file
const MAX_ZIP_ENTRIES = 50;
const latin1 = (b: Uint8Array) => { let s = ""; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return s; };

async function inflate(data: Uint8Array, format: "deflate" | "deflate-raw", budget: { left: number }): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(data).buffer]).stream().pipeThrough(new DecompressionStream(format));
  const reader = stream.getReader(); const parts: Uint8Array[] = []; let n = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      n += value.length; budget.left -= value.length;
      if (budget.left < 0) throw new Error("budget");
      parts.push(value);
    }
  } finally { reader.cancel().catch(() => {}); }
  const out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out;
}

// PDF names that run code, launch programs, embed files or submit data.
const PDF_ACTIVE = /\/(?:JavaScript|JS|Launch|EmbeddedFiles?|RichMedia|XFA|SubmitForm|ImportData|GoToR|GoToE|Sound|Movie)\b|\/AA\s*<</;
// PDF name objects may hex-escape characters (#4A for J) to hide keywords.
const unescapeNames = (s: string) => s.replace(/\/[^\s/<>[\]()%{}]+/g, (m) => m.replace(/#([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));

export async function inspectPdf(bytes: Uint8Array): Promise<string | null> {
  const text = latin1(bytes);
  if (/\/Encrypt\b/.test(text)) return "Šifrētus PDF nevar automātiski pārbaudīt. Lūdzu, saglabājiet PDF bez paroles.";
  if (PDF_ACTIVE.test(unescapeNames(text))) return "PDF satur aktīvu saturu (skriptus, palaišanu vai iegultus failus).";
  // Object streams hide dictionaries inside compressed data: inflate and re-check, bounded.
  const budget = { left: MAX_INFLATE };
  const re = /\/FlateDecode[^]*?>>\s*stream\r?\n/g; let m: RegExpExecArray | null; let streams = 0;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length; const end = text.indexOf("endstream", start);
    if (end < 0) return "PDF struktūra ir bojāta.";
    const dict = text.slice(Math.max(0, m.index - 400), m.index + m[0].length);
    if (!/\/Type\s*\/(?:ObjStm|XRef)/.test(dict) && !/\/Type\s*\/ObjStm/.test(text.slice(m.index - 400, m.index))) { re.lastIndex = end; continue; }
    if (++streams > 500) return "PDF ir pārāk sarežģīts automātiskai pārbaudei.";
    let raw = bytes.subarray(start, end);
    while (raw.length && (raw[raw.length - 1] === 10 || raw[raw.length - 1] === 13)) raw = raw.subarray(0, raw.length - 1);
    let inner: Uint8Array;
    try { inner = await inflate(raw, "deflate", budget); } catch { return budget.left < 0 ? "PDF ir pārāk liels automātiskai pārbaudei." : "PDF saspiestā daļa ir bojāta."; }
    const s = unescapeNames(latin1(inner));
    if (PDF_ACTIVE.test(s)) return "PDF satur aktīvu saturu (skriptus, palaišanu vai iegultus failus).";
    re.lastIndex = end;
  }
  if (!/%%EOF\s*$/.test(text.slice(-1024))) return "PDF fails ir nepilnīgs vai bojāts.";
  return null;
}

// PostScript is a programming language; reject file-system/pipe operators that matter outside SAFER interpreters.
export function inspectPostScript(bytes: Uint8Array): string | null {
  const t = latin1(bytes);
  if (/%pipe%|\b(?:deletefile|renamefile|filenameforall|\.libfile|\.tempfile|setpagedevice\s*\/OutputFile)\b|\/OutputFile\b|\(\s*%(?:pipe|os|ram|disk\d*)%/i.test(t)) return "PostScript/EPS fails satur failu vai komandu operācijas.";
  return null;
}

export function inspectSvg(bytes: Uint8Array): string | null {
  const t = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet|<script\b|<foreignObject\b|<iframe\b|<embed\b|<object\b|<handler\b|<set\b[^>]*\bhref|\bon[a-z]+\s*=|javascript:|vbscript:|data:(?!image\/(?:png|jpeg);base64,)|@import|url\(\s*['"]?\s*(?:https?:|\/\/)|(?:xlink:)?href\s*=\s*["']\s*(?!#)/i.test(t)) return "SVG satur aktīvu vai ārēju saturu.";
  return null;
}

export function inspectPng(b: Uint8Array): string | null {
  // IHDR must be first chunk; IEND must exist.
  if (latin1(b.subarray(12, 16)) !== "IHDR" || latin1(b.subarray(Math.max(0, b.length - 8), b.length - 4)) !== "IEND") return "PNG fails ir bojāts vai nepilnīgs.";
  return null;
}
export function inspectJpeg(b: Uint8Array): string | null {
  let end = b.length; while (end > 2 && b[end - 1] === 0) end--;
  if (!(b[end - 2] === 0xff && b[end - 1] === 0xd9)) return "JPEG fails ir bojāts vai nepilnīgs.";
  return null;
}

export async function inspectZip(b: Uint8Array): Promise<string | null> {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return "ZIP arhīvs ir bojāts.";
  const count = v.getUint16(eocd + 10, true); let p = v.getUint32(eocd + 16, true);
  if (count === 0xffff || p === 0xffffffff) return "ZIP64 arhīvi netiek pieņemti.";
  if (count > MAX_ZIP_ENTRIES) return `ZIP arhīvā drīkst būt līdz ${MAX_ZIP_ENTRIES} failiem.`;
  const budget = { left: MAX_INFLATE };
  for (let n = 0; n < count; n++) {
    if (p + 46 > b.length || v.getUint32(p, true) !== 0x02014b50) return "ZIP arhīvs ir bojāts.";
    const flags = v.getUint16(p + 8, true), method = v.getUint16(p + 10, true);
    const csize = v.getUint32(p + 20, true), usize = v.getUint32(p + 24, true);
    const nlen = v.getUint16(p + 28, true), xlen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (flags & 1) return "Ar paroli aizsargāti ZIP arhīvi netiek pieņemti.";
    if (name.endsWith("/")) continue;
    if (/^__MACOSX\//.test(name) || /(^|\/)\.DS_Store$/.test(name)) continue;
    if (name.startsWith("/") || name.includes("..") || name.includes("\\")) return "ZIP arhīvā ir nedrošs ceļš.";
    const base = name.split("/").pop() || "";
    if (/\.zip$/i.test(base)) return "Arhīvs arhīvā netiek pieņemts.";
    if (usize > ARTWORK_LIMITS.fileBytes) return `ZIP failā ${base} ir pārāk liels.`;
    if (method !== 0 && method !== 8) return "ZIP saspiešanas veids netiek atbalstīts.";
    if (local + 30 > b.length || v.getUint32(local, true) !== 0x04034b50) return "ZIP arhīvs ir bojāts.";
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const data = b.subarray(start, start + csize);
    let member: Uint8Array;
    if (method === 0) member = data;
    else { try { member = await inflate(data, "deflate-raw", budget); } catch { return budget.left < 0 ? "ZIP arhīvs atarhivējot ir pārāk liels." : "ZIP arhīvs ir bojāts."; } }
    if (member.length !== usize) return "ZIP arhīvs ir bojāts.";
    const inner = await inspectArtwork(base, "", member, true);
    if (!inner.ok) return `ZIP failā „${base}”: ${inner.reason}`;
  }
  return null;
}

export async function inspectArtwork(name: string, mime: string, bytes: Uint8Array, nested = false): Promise<Inspection> {
  let meta: { ext: string; mime: string };
  try { meta = validateArtwork(name, mime, bytes); } catch (e) { return { ok: false, reason: e instanceof Error ? e.message : "Fails nav atļauts." }; }
  if (nested && meta.ext === "zip") return { ok: false, reason: "Arhīvs arhīvā netiek pieņemts." };
  let reason: string | null = null; const ps = bytes[0] === 0x25 && bytes[1] === 0x21;
  switch (meta.ext) {
    case "pdf": reason = await inspectPdf(bytes); break;
    case "ai": reason = ps ? inspectPostScript(bytes) : await inspectPdf(bytes); break;
    case "eps": {
      // DOS EPS binary header: PS section offset/length at bytes 4..11.
      if (bytes[0] === 0xc5) { const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); const o = v.getUint32(4, true), l = v.getUint32(8, true); if (o + l > bytes.length) { reason = "EPS fails ir bojāts."; break; } reason = inspectPostScript(bytes.subarray(o, o + l)); }
      else reason = inspectPostScript(bytes);
      break;
    }
    case "svg": reason = inspectSvg(bytes); break;
    case "png": reason = inspectPng(bytes); break;
    case "jpg": case "jpeg": reason = inspectJpeg(bytes); break;
    case "zip": reason = await inspectZip(bytes); break;
    default: reason = null; // gif/webp/tiff/psd: passive raster formats, signature-validated only
  }
  return reason ? { ok: false, reason } : { ok: true, ...meta, note: meta.ext === "zip" ? "Arhīva saturs pārbaudīts pēc formāta" : "Formāts un saturs pārbaudīts automātiski" };
}

export const ARTWORK_DOWNLOADABLE = new Set(["clean", "validated"]);
/** A scanner "infected" verdict always blocks; validation is bound to the exact digest it checked. */
export function artworkReleasable(row: { status?: string | null; stored?: boolean | null; sha256?: string | null; checked_sha256?: string | null; policy_version?: string | null }) {
  if (!row.stored || row.status === "infected") return false;
  if (row.status === "clean") return !!row.sha256 && row.checked_sha256 === row.sha256;
  return row.status === "validated" && !!row.sha256 && row.checked_sha256 === row.sha256 && row.policy_version === ARTWORK_POLICY_VERSION;
}
