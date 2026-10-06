import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGalleryNavigation } from "./useGalleryNavigation";
import { prepareGalleryImage } from "@/lib/galleryImages";

vi.mock("@/lib/galleryImages", () => ({ prepareGalleryImage: vi.fn(), warmGalleryImages: vi.fn() }));

describe("gallery frame readiness", () => {
  beforeEach(() => vi.resetAllMocks());
  it("retains the previous frame until every bento image is decoded", async () => {
    let finish: (() => void) | undefined;
    vi.mocked(prepareGalleryImage).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    const { result } = renderHook(() => useGalleryNavigation(["one", "two"], 1, false));
    act(() => result.current.move(1));
    expect(result.current.index).toBe(0);
    expect(result.current.busy).toBe(true);
    await act(async () => { finish?.(); });
    expect(result.current.index).toBe(1);
    expect(result.current.busy).toBe(false);
  });
  it("keeps the last usable frame after a failed download", async () => {
    vi.mocked(prepareGalleryImage).mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useGalleryNavigation(["one", "two"], 1, false));
    act(() => result.current.move(1));
    await waitFor(() => expect(result.current.busy).toBe(false));
    expect(result.current.index).toBe(0);
  });
  it("ignores an older download finishing after a newer selection", async () => {
    const finish = new Map<string, () => void>();
    vi.mocked(prepareGalleryImage).mockImplementation((src) => new Promise<void>((resolve) => { finish.set(src, resolve); }));
    const { result } = renderHook(() => useGalleryNavigation(["one", "two", "three"], 1, false));
    act(() => { void result.current.select(1); void result.current.select(2); });
    await act(async () => { finish.get("three")?.(); });
    expect(result.current.index).toBe(2);
    await act(async () => { finish.get("two")?.(); });
    expect(result.current.index).toBe(2);
  });
});