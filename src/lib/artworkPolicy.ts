/** Signature validation is admission to quarantine, never a malware verdict. */
export const ARTWORK_LIMITS = { files: 10, fileBytes: 15 * 1024 * 1024, requestBytes: 50 * 1024 * 1024 } as const;
const types: Record<string, string[]> = {
  png: ["image/png"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"], webp: ["image/webp"],
  gif: ["image/gif"], tif: ["image/tiff"], tiff: ["image/tiff"],
  pdf: ["application/pdf"], ai: ["application/pdf", "application/postscript", "application/illustrator"],
  eps: ["application/postscript"], svg: ["image/svg+xml"], psd: ["image/vnd.adobe.photoshop", "application/photoshop"],
  zip: ["application/zip", "application/x-zip-compressed"],
};
export const ARTWORK_ACCEPT = Object.keys(types).map((ext) => `.${ext}`).join(",");
const ACTIVE_SUFFIXES = new Set(["exe","com","bat","cmd","scr","pif","msi","msp","dll","sys","cpl","jar","js","jse","mjs","vbs","vbe","wsf","wsh","ps1","psm1","sh","bash","zsh","php","phtml","py","pl","rb","cgi","asp","aspx","jsp","html","htm","xhtml","hta","lnk","reg","app","dmg","pkg","deb","rpm","apk","elf","bin","run","command","scf","url","iso","img"]);
export function artworkMetadata(name: string, mime: string, size: number) {
  if (!Number.isInteger(size) || size < 1 || size > ARTWORK_LIMITS.fileBytes) throw new Error("Faila izmērs nav atļauts (līdz 15 MB).");
  // No paths, controls, Unicode direction overrides, empty segments or executable/script suffix segments anywhere.
  if (name.length > 180 || /[/\\\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/.test(name)) throw new Error("Nederīgs faila nosaukums.");
  const parts = name.split(".");
  const ext = parts.pop()?.toLowerCase() || "";
  if (parts.length < 1 || !parts[0]?.trim() || parts.some((p) => !p.trim()) || !types[ext]) throw new Error("Faila formāts nav atļauts.");
  if (parts.slice(1).some((p) => ACTIVE_SUFFIXES.has(p.trim().toLowerCase()))) throw new Error("Izpildāmi faili un skripti nav atļauti.");
  const declared = mime.toLowerCase().split(";")[0].trim();
  if (declared && declared !== "application/octet-stream" && !types[ext].includes(declared)) throw new Error("Faila tips neatbilst paplašinājumam.");
  return { ext, mime: types[ext][0] };
}
export function validateArtwork(name: string, mime: string, bytes: Uint8Array) {
  const meta = artworkMetadata(name, mime, bytes.length);
  const starts = (...sig: number[]) => sig.every((v, i) => bytes[i] === v);
  const ascii = (start: number, length: number) => new TextDecoder().decode(bytes.subarray(start, start + length));
  const head = ascii(0, Math.min(bytes.length, 4096));
  // Reject executable/container signatures even when renamed to an allowed artwork suffix.
  if (starts(0x4d, 0x5a) || starts(0x7f, 0x45, 0x4c, 0x46) || starts(0xca, 0xfe, 0xba, 0xbe) || starts(0xfe,0xed,0xfa,0xce) || starts(0xce,0xfa,0xed,0xfe) || starts(0xfe,0xed,0xfa,0xcf) || starts(0xcf,0xfa,0xed,0xfe) || /^\s*(#!|<html|<!doctype\s+html)/i.test(head)) throw new Error("Izpildāmi faili un skripti nav atļauti.");
  const pdf = /^%PDF-1\.[0-9]/.test(head) || /^%PDF-2\.0/.test(head);
  const ps = /^%!PS-Adobe-/.test(head);
  const matches: Record<string, boolean> = {
    png: starts(137,80,78,71,13,10,26,10), jpg: starts(255,216,255), jpeg: starts(255,216,255),
    webp: ascii(0,4) === "RIFF" && ascii(8,4) === "WEBP", gif: /^GIF8[79]a/.test(head),
    tif: starts(73,73,42,0) || starts(77,77,0,42), tiff: starts(73,73,42,0) || starts(77,77,0,42),
    pdf, ai: pdf || ps, eps: ps || starts(0xc5,0xd0,0xd3,0xc6),
    psd: ascii(0,4) === "8BPS" && bytes[4] === 0 && bytes[5] === 1,
    zip: starts(80,75,3,4),
    svg: /^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[^]*?-->\s*)?<svg[\s>]/i.test(head),
  };
  if (!matches[meta.ext]) throw new Error("Faila saturs neatbilst formātam.");
  return { ...meta, mime: meta.ext === "ai" && ps ? "application/postscript" : meta.mime };
}
export function checkArtworkBatch(sizes: readonly number[]) {
  if (sizes.length > ARTWORK_LIMITS.files || sizes.some((n) => !Number.isInteger(n) || n < 1 || n > ARTWORK_LIMITS.fileBytes) || sizes.reduce((a,b) => a+b,0) > ARTWORK_LIMITS.requestBytes) throw new Error("Līdz 10 failiem, 15 MB katram un 50 MB kopā.");
}
export type ScanState = "pending" | "clean" | "infected";
export function scanVerdict(result: unknown, digest: string): ScanState {
  if (!result || typeof result !== "object") return "pending";
  const r = result as Record<string, unknown>;
  return r.sha256 === digest && r.complete === true && (r.verdict === "clean" || r.verdict === "infected") ? r.verdict : "pending";
}
export function attachmentDownloadAllowed(state: string | null | undefined, admin: boolean) { return admin && state === "clean"; }