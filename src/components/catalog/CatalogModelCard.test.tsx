import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CatalogModelCard from "./CatalogModelCard";

vi.mock("@/lib/galleryImages", () => ({ prepareGalleryImage: vi.fn().mockResolvedValue(undefined), warmGalleryImages: vi.fn() }));
vi.mock("@/components/BrandLogo", () => ({ BrandLogo: () => null }));

describe("catalog card photo navigation", () => {
  beforeEach(() => vi.clearAllMocks());
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
  it("proxy failure shows the same colour's original, not the model fallback photo", async () => {
    const green = "https://cdn.fruitoftheloom.eu/resources/images/product/0R013M/38/large/28261.jpg";
    const black = "https://cdn.fruitoftheloom.eu/resources/images/product/0R013M/36/large/65636.jpg";
    const proxied = `https://wsrv.nl/?url=${encodeURIComponent(green.replace("https://", ""))}&w=500`;
    const view = render(<CatalogModelCard image={proxied} fallbackImage={black} imageAlt="Krekls" title="Krekls" noImageLabel="" />);
    const photo = view.getByAltText("Krekls") as HTMLImageElement;
    fireEvent.error(photo);
    expect(photo.src).toBe(green);
    fireEvent.error(photo);
    expect(photo.src).toBe(black);
  });
});
