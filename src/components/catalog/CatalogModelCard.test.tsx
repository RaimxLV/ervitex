import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CatalogModelCard from "./CatalogModelCard";

vi.mock("@/lib/galleryImages", () => ({ prepareGalleryImage: vi.fn().mockResolvedValue(undefined), warmGalleryImages: vi.fn() }));
vi.mock("@/components/BrandLogo", () => ({ BrandLogo: () => null }));

describe("catalog card photo navigation", () => {
  beforeEach(() => vi.clearAllMocks());
  it("changes the photo without opening the product from the next control", async () => {
    const open = vi.fn();
    const view = render(<CatalogModelCard image="front.jpg" images={["front.jpg", "back.jpg"]} imageAlt="Krekls" title="Krekls" noImageLabel="" onClick={open} />);
    fireEvent.click(view.getByRole("button", { name: "Nākamais attēls" }));
    await waitFor(() => expect(view.getByAltText("Krekls").getAttribute("src")).toBe("back.jpg"));
    expect(open).not.toHaveBeenCalled();
  });
  it("swipes horizontally without opening the card, while a normal tap still opens it", async () => {
    const open = vi.fn();
    const view = render(<CatalogModelCard image="front.jpg" images={["front.jpg", "back.jpg"]} imageAlt="Krekls" title="Krekls" noImageLabel="" onClick={open} />);
    const photo = view.getByAltText("Krekls");
    fireEvent.click(photo);
    expect(open).toHaveBeenCalledTimes(1);
    fireEvent.touchStart(photo, { touches: [{ clientX: 140, clientY: 80 }] });
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 50, clientY: 84 }] });
    fireEvent.click(photo);
    await waitFor(() => expect(photo.getAttribute("src")).toBe("back.jpg"));
    expect(open).toHaveBeenCalledTimes(1);
  });
  it("does not change the photo during vertical scrolling", () => {
    const view = render(<CatalogModelCard image="front.jpg" images={["front.jpg", "back.jpg"]} imageAlt="Krekls" title="Krekls" noImageLabel="" />);
    const photo = view.getByAltText("Krekls");
    fireEvent.touchStart(photo, { touches: [{ clientX: 140, clientY: 80 }] });
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 130, clientY: 180 }] });
    expect(photo.getAttribute("src")).toBe("front.jpg");
  });
});