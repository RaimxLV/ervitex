import { afterEach, expect, it, vi } from "vitest";
import { scanArtwork } from "./artworkScanner.server";
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it("missing scanner leaves PDF private and pending without network", async () => {
  vi.stubEnv("ARTWORK_SCANNER_URL", ""); vi.stubEnv("ARTWORK_SCANNER_TOKEN", ""); const fetcher=vi.fn(); vi.stubGlobal("fetch",fetcher);
  expect(await scanArtwork(new Uint8Array([1]),"digest")).toBe("pending"); expect(fetcher).not.toHaveBeenCalled();
});
it("scanner failure, infected and clean are distinct", async () => {
  vi.stubEnv("ARTWORK_SCANNER_URL","https://scanner.example.invalid/scan"); vi.stubEnv("ARTWORK_SCANNER_TOKEN","harmless-test-only");
  const fetcher=vi.fn(); vi.stubGlobal("fetch",fetcher);
  fetcher.mockRejectedValueOnce(new Error("unavailable")); expect(await scanArtwork(new Uint8Array([1]),"digest")).toBe("pending");
  fetcher.mockResolvedValueOnce(Response.json({sha256:"digest",complete:true,verdict:"infected"})); expect(await scanArtwork(new Uint8Array([1]),"digest")).toBe("infected");
  fetcher.mockResolvedValueOnce(Response.json({sha256:"digest",complete:true,verdict:"clean"})); expect(await scanArtwork(new Uint8Array([1]),"digest")).toBe("clean");
});it("configured scanner: infected blocks, outage is error (never clean), no scanner → policy-validated", async () => {
  const { assessBytes } = await import("./artworkReview.server");
  const b = new TextEncoder().encode("%PDF-1.7\nx\n%%EOF\n");
  vi.stubEnv("ARTWORK_SCANNER_URL", ""); vi.stubEnv("ARTWORK_SCANNER_TOKEN", "");
  expect((await assessBytes("a.pdf", "", b, "d")).status).toBe("validated");
  vi.stubEnv("ARTWORK_SCANNER_URL", "https://scanner.invalid/scan"); vi.stubEnv("ARTWORK_SCANNER_TOKEN", "t");
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ sha256: "d", complete: true, verdict: "infected" }))));
  expect((await assessBytes("a.pdf", "", b, "d")).status).toBe("infected");
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
  expect((await assessBytes("a.pdf", "", b, "d")).status).toBe("error");
});
