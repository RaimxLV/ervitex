import { describe, expect, it, vi } from "vitest";
import { artworkMetadata } from "./artworkPolicy";
import { reassess, type ArtworkRow } from "./artworkReview.server";

const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const base: ArtworkRow = { id: "a", quote_id: "q", path: "q/a", bucket: "b", original_name: "logo.png", byte_size: png.length, sha256: "x", mime: "image/png", status: "infected", stored: true, checked_sha256: "x", policy_version: "v", check_note: "infected", legacy: false };

function client(updateError: unknown = null) {
  const update = vi.fn(() => { const c: any = { eq: () => c, neq: () => Promise.resolve({ error: updateError }) }; return c; });
  const download = vi.fn(async () => ({ data: new Blob([png]), error: null }));
  return { sb: { from: () => ({ update }), storage: { from: () => ({ download }) } }, update, download };
}

describe("artwork filenames", () => {
  it.each(["logo.final.pdf", "makets.v2.png"])("accepts harmless multidot %s", (n) => {
    expect(() => artworkMetadata(n, "", 100)).not.toThrow();
  });
  it.each(["logo.exe.pdf", "logo.EXE.png", "a.js.svg"])("blocks executable segment %s", (n) => {
    expect(() => artworkMetadata(n, "", 100)).toThrow();
  });
});

describe("reassess", () => {
  it("leaves an existing infected verdict unchanged", async () => {
    const { sb, update, download } = client();
    const out = await reassess(sb, base);
    expect(out.status).toBe("infected");
    expect(update).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
  });
  it("does not report validated when the update fails", async () => {
    const { sb } = client({ message: "fail" });
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", png))).map((n) => n.toString(16).padStart(2, "0")).join("");
    const out = await reassess(sb, { ...base, status: "pending", sha256: digest, checked_sha256: null });
    expect(out.status).toBe("error");
  });
});
