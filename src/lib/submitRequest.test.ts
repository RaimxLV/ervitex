import { expect, it, vi } from "vitest";
import { notifyRequest, saveRequest } from "./submitRequest";
const mock = vi.hoisted(() => ({ rpc: vi.fn(), invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mock.rpc, functions: { invoke: mock.invoke } } }));
it("does not mistake an invoke error or incomplete response for delivery", async () => {
  for (const result of [{ data: { delivered: true }, error: new Error("failed") }, { data: { ok: true }, error: null }, { data: { delivered: false }, error: null }]) {
    mock.invoke.mockResolvedValueOnce(result); expect(await notifyRequest("synthetic", "capability")).toBe(false);
  }
  mock.invoke.mockRejectedValueOnce(new Error("network")); expect(await notifyRequest("synthetic", "capability")).toBe(false);
  mock.invoke.mockResolvedValueOnce({ data: { delivered: true }, error: null }); expect(await notifyRequest("synthetic", "capability")).toBe(true);
});
it("propagates save rejection", async () => {
  mock.rpc.mockResolvedValueOnce({ error: new Error("save rejected") });
  await expect(saveRequest("synthetic", "capability", { name: "Synthetic" })).rejects.toThrow("save rejected");
});