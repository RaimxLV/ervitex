import { expect, it, vi } from "vitest";
vi.mock("@/pages/admin/AdminOffers", () => ({ default: () => null }));
import { Route as offers } from "@/routes/offers.index";
import { Route as offer } from "@/routes/offers.$id";
import { Route as list } from "@/routes/saraksts.$token";
import { Route as pm } from "@/routes/piedavajums.$token";
it("offer and token routes stay noindex with no canonical", () => {
  for (const r of [offers, offer, list, pm]) {
    const h = (r.options.head as () => { meta: { name?: string; content?: string }[]; links?: unknown[] })();
    expect(h.meta.find((m) => m.name === "robots")?.content).toBe("noindex, nofollow");
    expect(h.links ?? []).toEqual([]);
  }
});
