import { describe, expect, it, vi } from "vitest";
import { RequestSubmission, requestContactSchema, missingAttachmentNames } from "./requestSubmission";
const payload = { name: "Synthetic", email: " CLIENT@example.invalid ", message: "DTF" };
describe("request retry lifecycle", () => {
  it("retains the saved request id and original data on returned notification failure", async () => {
    const flow = new RequestSubmission(); const save = vi.fn().mockResolvedValue(undefined); const notify = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const first = await flow.run(payload, save, notify);
    const second = await flow.run({ ...payload, message: "edited during retry" }, save, notify);
    expect(first.state).toBe("saved"); expect(second.state).toBe("delivered");
    expect(save).toHaveBeenCalledTimes(1); expect(notify.mock.calls[1][0]).toBe(notify.mock.calls[0][0]);
    expect(save.mock.calls[0][2].message).toBe("DTF"); expect(save.mock.calls[0][2].email).toBe("client@example.invalid");
  });
  it("blocks simultaneous double submissions before the first await", async () => {
    let release: (() => void) | undefined; const save = vi.fn(() => new Promise<void>((resolve) => { release = resolve; })); const notify = vi.fn().mockResolvedValue(true); const flow = new RequestSubmission();
    const first = flow.run(payload, save, notify);
    expect((await flow.run(payload, save, notify)).state).toBe("busy"); release?.(); await first;
    expect(save).toHaveBeenCalledTimes(1); expect(notify).toHaveBeenCalledTimes(1);
  });
  it("reuses the same id/key after an uncertain save error and unlocks finally", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(undefined); const flow = new RequestSubmission();
    await expect(flow.run(payload, save, async () => true)).rejects.toThrow("network"); await flow.run(payload, save, async () => true);
    expect(save.mock.calls[0][0]).toBe(save.mock.calls[1][0]); expect(save.mock.calls[0][1]).toBe(save.mock.calls[1][1]);
  });
  it("retains a saved id after notification throws without inserting again", async () => {
    const save = vi.fn().mockResolvedValue(undefined); const flow = new RequestSubmission();
    await expect(flow.run(payload, save, async () => { throw new Error("mail"); })).rejects.toThrow();
    expect((await flow.run(payload, save, async () => true)).state).toBe("delivered"); expect(save).toHaveBeenCalledTimes(1);
  });
  it("rejects invalid contacts before any write", async () => {
    const save = vi.fn(); await expect(new RequestSubmission().run({ ...payload, email: "bad" }, save, async () => true)).rejects.toThrow(); expect(save).not.toHaveBeenCalled();
    expect(requestContactSchema.safeParse({ ...payload, name: "x" }).success).toBe(false);
  });
});
function memoryStore() { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; }
describe("reload-safe pending request", () => {
  it("a reloaded tab re-notifies the same saved request without saving again, then clears", async () => {
    const store = memoryStore(); const slot = { store, key: "s" };
    const save = vi.fn().mockResolvedValue(undefined);
    const first = await new RequestSubmission(slot).run(payload, save, async () => false, ["logo.pdf"]);
    const reloaded = new RequestSubmission(slot); const restored = reloaded.restore();
    expect(restored?.id).toBe(first.id); expect(restored?.saved).toBe(true); expect(restored?.payload.message).toBe("DTF");
    const notify = vi.fn().mockResolvedValue(true);
    expect((await reloaded.run({ ...payload, message: "new data" }, save, notify)).state).toBe("delivered");
    expect(save).toHaveBeenCalledTimes(1); expect(notify.mock.calls[0][0]).toBe(first.id); expect(store.m.size).toBe(0);
  });
  it("uploaded paths persist across reload; missing blobs are reported, not re-sent as new data", async () => {
    const store = memoryStore(); const slot = { store, key: "s" };
    const flow = new RequestSubmission(slot);
    await flow.run(payload, async () => {}, async (id) => { flow.addPath(`${id}/00000000-0000-4000-8000-000000000000-logo.pdf`); return false; }, ["logo.pdf", "brief.docx"]);
    const restored = new RequestSubmission(slot).restore()!;
    expect(restored.paths).toHaveLength(1); expect(missingAttachmentNames(restored)).toEqual(["brief.docx"]);
  });
  it("endpoint rejection clears pending state without resubmitting", async () => {
    const store = memoryStore(); const save = vi.fn().mockResolvedValue(undefined);
    expect((await new RequestSubmission({ store, key: "s" }).run(payload, save, async () => "rejected")).state).toBe("rejected");
    expect(store.m.size).toBe(0); expect(save).toHaveBeenCalledTimes(1);
  });
  it("discards tampered stored state with out-of-scope paths", () => {
    const store = memoryStore(); const id = "11111111-1111-4111-8111-111111111111";
    store.setItem("s", JSON.stringify({ id, key: id, payload: {}, saved: true, paths: ["other/x"], fileNames: [] }));
    expect(new RequestSubmission({ store, key: "s" }).restore()).toBeNull(); expect(store.m.size).toBe(0);
  });
});
