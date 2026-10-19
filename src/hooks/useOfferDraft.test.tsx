import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOfferDraft } from "./useOfferDraft";
import type { Offer } from "@/lib/offer";
const mocks = vi.hoisted(() => ({ update: vi.fn(), result: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({
  update: (payload: unknown) => { mocks.update(payload); const q = { eq: () => q, select: () => q, maybeSingle: () => mocks.result() }; return q; },
}) } }));
const remote: Offer = { id: "offer-1", title: "Piedāvājums", client_name: "", client_company: null,
  client_email: null, client_phone: null, note: null, status: "draft", vat_rate: 21, items: [],
  created_at: "2026-10-19T06:00:00Z", updated_at: "2026-10-19T06:00:00Z" };
const item = { id: "line-1", source: "ss", productId: "STTU169", code: "STTU169", name: "Krekls", brand: "Stanley/Stella", image: null, colorName: "Black", colorHex: null, size: "M", qty: 25, unitPrice: 12 };
const setup = () => {
  const hook = renderHook(() => useOfferDraft("user-1", remote.id, remote));
  act(() => hook.result.current.initialize(remote)); return hook;
};
describe("offer draft recovery", () => {
  beforeEach(() => {
    localStorage.clear(); vi.clearAllMocks();
    mocks.result.mockResolvedValue({ data: { id: remote.id, updated_at: "2026-10-19T06:01:00Z" }, error: null });
  });
  it("automatically saves the full list without manual Save", async () => {
    const { result } = setup();
    act(() => result.current.setOffer((o) => ({ ...o, items: [item] })));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ items: [item], status: "draft" })), { timeout: 2500 });
    await waitFor(() => expect(result.current.saveState).toBe("saved"));
  });
  it("persists and restores the chosen per-item discount", async () => {
    const first = setup();
    const discounted = { ...item, discountPercent: 12.5 };
    act(() => first.result.current.setOffer((o) => ({ ...o, items: [discounted] })));
    first.unmount();
    const second = setup();
    expect(second.result.current.offer.items[0].discountPercent).toBe(12.5);
    await act(async () => { expect(await second.result.current.persist()).toBe(true); });
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ items: [discounted] }));
  });
  it("restores unsaved items and client fields after remount", () => {
    const first = setup();
    act(() => first.result.current.setOffer((o) => ({ ...o, items: [item], client_name: "Edīte", note: "DTF" })));
    first.unmount(); const second = setup();
    expect(second.result.current.offer.items).toEqual([item]);
    expect(second.result.current.offer.client_name).toBe("Edīte");
    expect(second.result.current.offer.note).toBe("DTF");
  });
  it("preserves newer edits when an older save finishes", async () => {
    let finish: ((value: unknown) => void) | undefined;
    mocks.result.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const { result } = setup();
    act(() => result.current.setOffer((o) => ({ ...o, items: [item] })));
    let pending: Promise<boolean> | undefined;
    act(() => { pending = result.current.persist(); });
    await waitFor(() => expect(mocks.update).toHaveBeenCalled());
    act(() => result.current.setOffer((o) => ({ ...o, items: [{ ...item, qty: 50 }] })));
    await act(async () => { finish?.({ data: { id: remote.id, updated_at: "next" }, error: null }); await pending; });
    expect(result.current.offer.items[0].qty).toBe(50);
    expect(result.current.saveState).toBe("pending");
  });
  it("retains offline backup and retries online", async () => {
    mocks.result.mockResolvedValueOnce({ data: null, error: new Error("offline") });
    const { result } = setup();
    act(() => result.current.setOffer((o) => ({ ...o, items: [item] })));
    await act(async () => { expect(await result.current.persist()).toBe(false); });
    expect(result.current.saveState).toBe("error");
    expect(localStorage.getItem("ervitex:offer-draft:user-1:offer-1")).toContain("STTU169");
    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(result.current.saveState).toBe("saved"));
  });
  it("rejects zero-row writes without losing items", async () => {
    mocks.result.mockResolvedValue({ data: null, error: null });
    const { result } = setup();
    act(() => result.current.setOffer((o) => ({ ...o, items: [item] })));
    await act(async () => { expect(await result.current.persist()).toBe(false); });
    expect(result.current.saveState).toBe("conflict");
    expect(result.current.offer.items).toEqual([item]);
  });
  it("never restores a different user's draft", () => {
    const first = setup();
    act(() => first.result.current.setOffer((o) => ({ ...o, items: [item] })));
    first.unmount();
    const second = renderHook(() => useOfferDraft("user-2", remote.id, remote));
    act(() => second.result.current.initialize(remote));
    expect(second.result.current.offer.items).toEqual([]);
  });
});