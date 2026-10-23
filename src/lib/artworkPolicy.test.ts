import { describe, expect, it } from "vitest";
import { ARTWORK_LIMITS, attachmentDownloadAllowed, artworkMetadata, checkArtworkBatch, scanVerdict, validateArtwork } from "./artworkPolicy";
const text = (s: string) => new TextEncoder().encode(s);
describe("artwork admission is not malware clearance", () => {
  it.each([
    ["logo.png","image/png",new Uint8Array([137,80,78,71,13,10,26,10,0])],
    ["art.pdf","application/pdf",text("%PDF-1.7\nsynthetic harmless fixture\n%%EOF")],
    ["art.ai","application/pdf",text("%PDF-1.7\nfixture")],
    ["art.eps","application/postscript",text("%!PS-Adobe-3.0 EPSF-3.0\nfixture")],
    ["art.svg","image/svg+xml",text('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
    ["art.psd","image/vnd.adobe.photoshop",new Uint8Array([56,66,80,83,0,1,0])],
    ["art.zip","application/zip",new Uint8Array([80,75,3,4,0])],
  ])("admits matching %s only to quarantine", (name,mime,bytes) => { expect(validateArtwork(name,mime,bytes).ext).toBe(name.split(".").pop()); expect(attachmentDownloadAllowed("pending",true)).toBe(false); });
  it.each(["logo.exe","logo.exe.pdf","logo.pdf.exe","../logo.pdf","logo\u202epdf.exe","logo..png","logo.js","logo.php","logo.html"])("rejects malicious filename %s", (name) => { expect(() => artworkMetadata(name,"application/octet-stream",100)).toThrow(); });
  it("rejects MIME spoofing", () => { expect(() => validateArtwork("logo.png","application/pdf",text("%PDF-1.7"))).toThrow(); });
  it("rejects renamed EXE/ELF and script signatures", () => {
    for (const bytes of [text("MZ harmless fake executable header"),new Uint8Array([127,69,76,70]),new Uint8Array([0xcf,0xfa,0xed,0xfe]),text("#!/bin/sh\nfixture")]) expect(() => validateArtwork("logo.pdf","application/pdf",bytes)).toThrow();
  });
  it("requires actual matching image signature even with trusted looking MIME", () => { expect(() => validateArtwork("logo.png","image/png",text("not png"))).toThrow(); });
  it("rejects SVG active script and entity constructs", () => { for (const source of ['<svg><script>fixture</script></svg>','<svg onload="fixture"></svg>','<!DOCTYPE svg><svg></svg>','<svg><image href="https://example.invalid/a"/></svg>']) expect(() => validateArtwork("logo.svg","image/svg+xml",text(source))).toThrow(); });
  it("enforces 10 files, 15 MB/file and 50 MB/request", () => {
    expect(ARTWORK_LIMITS.files).toBe(10); expect(ARTWORK_LIMITS.fileBytes).toBe(15728640); expect(ARTWORK_LIMITS.requestBytes).toBe(52428800);
    expect(() => checkArtworkBatch(Array(10).fill(1))).not.toThrow();
    expect(() => checkArtworkBatch(Array(11).fill(1))).toThrow();
    expect(() => checkArtworkBatch([15728641])).toThrow();
    expect(() => checkArtworkBatch(Array(4).fill(15728640))).toThrow();
    expect(() => checkArtworkBatch([NaN])).toThrow();
  });
  it("fails closed for absent/incomplete/wrong digest scanner results", () => {
    for (const result of [null,{}, {verdict:"clean"}, {verdict:"clean",complete:false,sha256:"digest"}, {verdict:"clean",complete:true,sha256:"other"}]) expect(scanVerdict(result,"digest")).toBe("pending");
    expect(scanVerdict({verdict:"infected",complete:true,sha256:"digest"},"digest")).toBe("infected");
    expect(attachmentDownloadAllowed("infected",true)).toBe(false);
    expect(attachmentDownloadAllowed("clean",false)).toBe(false);
    expect(attachmentDownloadAllowed("clean",true)).toBe(true);
    expect(attachmentDownloadAllowed(undefined,true)).toBe(false);
  });
});