import { describe, expect, it } from "vitest";
import { ARTWORK_POLICY_VERSION, artworkReleasable, inspectArtwork } from "./artworkInspect";
import { managerRequestUrl } from "../../supabase/functions/_shared/manager-link";

const t = (s: string) => new TextEncoder().encode(s);

describe("owner policy: block executables, accept other artwork immediately", () => {
  it("accepts ordinary print artwork, including PDF/SVG with links or scripts-like text", async () => {
    for (const [n, b] of [["logo.png", new Uint8Array([137,80,78,71,13,10,26,10,0])], ["a.pdf", t("%PDF-1.7\n/JavaScript\n")], ["a.svg", t('<svg><image href="data:image/png;base64,AA"/></svg>')], ["a.eps", t("%!PS-Adobe-3.0\n")], ["p.zip", new Uint8Array([80,75,3,4,0])]] as const)
      expect((await inspectArtwork(n, "", b)).ok, n).toBe(true);
  });
  it("rejects EXE, renamed EXE/ELF, scripts and double extensions", async () => {
    expect((await inspectArtwork("logo.exe", "", t("MZ"))).ok).toBe(false);
    expect((await inspectArtwork("logo.pdf", "", t("MZ fake"))).ok).toBe(false);
    expect((await inspectArtwork("logo.png", "", new Uint8Array([127,69,76,70]))).ok).toBe(false);
    expect((await inspectArtwork("logo.pdf", "", t("#!/bin/sh"))).ok).toBe(false);
    expect((await inspectArtwork("logo.exe.pdf", "", t("%PDF-1.7"))).ok).toBe(false);
  });
  it("download needs acceptance bound to exact digest; scanner-infected always blocks", () => {
    const ok = { stored: true, status: "validated", sha256: "a", checked_sha256: "a", policy_version: ARTWORK_POLICY_VERSION };
    expect(artworkReleasable(ok)).toBe(true);
    expect(artworkReleasable({ ...ok, checked_sha256: "b" })).toBe(false);
    for (const status of ["pending", "rejected", "infected"]) expect(artworkReleasable({ ...ok, status })).toBe(false);
  });
  it("staff email link opens the focused request window, key only in fragment", () => {
    expect(managerRequestUrl("11111111-1111-4111-8111-111111111111", "k")).toBe("https://www.ervitex.lv/pieprasijums/11111111-1111-4111-8111-111111111111#k=k");
  });
});
