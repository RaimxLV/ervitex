import { describe, expect, it, vi } from "vitest";
import { RequestSubmission, requestContactSchema } from "./requestSubmission";
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