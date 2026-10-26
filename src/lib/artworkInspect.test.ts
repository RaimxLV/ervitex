import { describe, expect, it } from "vitest";
import { deflateRawSync, deflateSync } from "node:zlib";
import { ARTWORK_POLICY_VERSION, artworkReleasable, inspectArtwork } from "./artworkInspect";
import { managerRequestUrl } from "../../supabase/functions/_shared/manager-link";

const t = (s: string) => new TextEncoder().encode(s);
const png = () => { const b = new Uint8Array(33 + 12); b.set([137,80,78,71,13,10,26,10,0,0,0,13]); b.set(t("IHDR"), 12); b.set(t("IEND"), b.length - 8); return b; };
const pdf = (body: string) => t(`%PDF-1.7\n${body}\n%%EOF\n`);
function zip(entries: { name: string; data: Uint8Array; enc?: boolean }[]) {
  const locals: number[] = []; const central: number[] = []; let off = 0;
  for (const e of entries) {
    const c = deflateRawSync(e.data); const n = t(e.name);
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(6, e.enc ? 1 : 0, true); h.setUint16(8, 8, true); h.setUint32(18, c.length, true); h.setUint32(22, e.data.length, true); h.setUint16(26, n.length, true);
    const cd = new DataView(new ArrayBuffer(46)); cd.setUint32(0, 0x02014b50, true); cd.setUint16(8, e.enc ? 1 : 0, true); cd.setUint16(10, 8, true); cd.setUint32(20, c.length, true); cd.setUint32(24, e.data.length, true); cd.setUint16(28, n.length, true); cd.setUint32(42, off, true);
    const local = [...new Uint8Array(h.buffer), ...n, ...c]; locals.push(...local); central.push(...new Uint8Array(cd.buffer), ...n); off += local.length;
  }
  const end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, central.length, true); end.setUint32(16, off, true);
  return new Uint8Array([...locals, ...central, ...new Uint8Array(end.buffer)]);
}

describe("automatic artwork policy (not antivirus)", () => {
  it("accepts healthy PNG/JPEG/PDF/SVG/EPS/ZIP print art", async () => {
    for (const [n, b] of [["logo.png", png()], ["foto.jpg", new Uint8Array([255,216,255,224,0,0,255,217])], ["art.pdf", pdf("1 0 obj<</Type/Catalog>>endobj")], ["a.svg", t('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')], ["a.eps", t("%!PS-Adobe-3.0 EPSF-3.0\nnewpath 0 0 moveto showpage")], ["pack.zip", zip([{ name: "logo.png", data: png() }])]] as const)
      expect((await inspectArtwork(n, "", b)).ok, n).toBe(true);
  });
  it("rejects renamed executables and dangerous names immediately", async () => {
    expect((await inspectArtwork("logo.pdf", "", t("MZ fake"))).ok).toBe(false);
    expect((await inspectArtwork("logo.exe.pdf", "", pdf(""))).ok).toBe(false);
    expect((await inspectArtwork("logo.png", "application/pdf", png())).ok).toBe(false);
  });
  it("rejects active PDF, including hex-escaped names and names hidden in object streams", async () => {
    expect((await inspectArtwork("a.pdf", "", pdf("<</OpenAction<</S/JavaScript/JS(app.alert(1))>>>>"))).ok).toBe(false);
    expect((await inspectArtwork("a.pdf", "", pdf("<</S/#4Aava#53cript>>"))).ok).toBe(false);
    expect((await inspectArtwork("a.pdf", "", pdf("<</S/Launch/F(cmd.exe)>>"))).ok).toBe(false);
    const hidden = deflateSync(Buffer.from("<</S/JavaScript/JS(x)>>"));
    const head = t("%PDF-1.7\n5 0 obj<</Type/ObjStm/Filter/FlateDecode/Length " + hidden.length + ">>stream\n");
    const tail = t("\nendstream endobj\n%%EOF\n");
    expect((await inspectArtwork("a.pdf", "", new Uint8Array([...head, ...hidden, ...tail]))).ok).toBe(false);
    expect((await inspectArtwork("a.pdf", "", pdf("<</Encrypt 3 0 R>>"))).ok).toBe(false);
  });
  it("rejects active/external SVG and dangerous PostScript", async () => {
    for (const s of ['<svg><script>x</script></svg>', '<svg><a href="https://x.invalid">a</a></svg>', '<svg style="background:url(https://x.invalid)"></svg>', '<svg><use xlink:href="file:///etc/passwd"/></svg>'])
      expect((await inspectArtwork("a.svg", "", t(s))).ok, s).toBe(false);
    expect((await inspectArtwork("a.eps", "", t("%!PS-Adobe-3.0\n(%pipe%id) (w) file"))).ok).toBe(false);
  });
  it("rejects archive exploits: executable member, traversal, nested zip, encrypted", async () => {
    for (const z of [zip([{ name: "run.exe", data: t("MZ") }]), zip([{ name: "../logo.png", data: png() }]), zip([{ name: "in.zip", data: zip([]) }]), zip([{ name: "logo.png", data: png(), enc: true }]), zip([{ name: "a.pdf", data: pdf("/JavaScript") }])])
      expect((await inspectArtwork("pack.zip", "", z)).ok).toBe(false);
  });
  it("download needs validation bound to exact digest; infected always blocks", () => {
    const ok = { stored: true, status: "validated", sha256: "a", checked_sha256: "a", policy_version: ARTWORK_POLICY_VERSION };
    expect(artworkReleasable(ok)).toBe(true);
    expect(artworkReleasable({ ...ok, checked_sha256: "b" })).toBe(false);
    expect(artworkReleasable({ ...ok, policy_version: "old" })).toBe(false);
    for (const status of ["pending", "error", "rejected", "infected"]) expect(artworkReleasable({ ...ok, status })).toBe(false);
  });
  it("staff email destination is the focused request window, key only in the fragment", () => {
    const u = managerRequestUrl("11111111-1111-4111-8111-111111111111", "k".repeat(43));
    expect(u).toBe(`https://www.ervitex.lv/pieprasijums/11111111-1111-4111-8111-111111111111#k=${"k".repeat(43)}`);
    expect(managerRequestUrl("11111111-1111-4111-8111-111111111111")).not.toContain("#");
  });
});
