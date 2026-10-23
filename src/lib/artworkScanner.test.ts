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
});