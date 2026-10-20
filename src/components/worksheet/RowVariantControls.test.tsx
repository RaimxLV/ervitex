import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import RowVariantControls from "./RowVariantControls";
vi.mock("./useVariants", () => ({ useVariants: () => ({ loading: false, colors: [{ c: "black", n: "Black", u: "black.jpg" }, { c: "red", n: "Red", u: null }], sizesFor: (code: string) => code === "red" ? [{ size: "M", raw: "M", price: null }] : [{ size: "M", raw: "M", price: 12 }, { size: "L", raw: "L", price: null }] }) }));
vi.mock("@/components/quote/ColorSelector", () => ({ ColorSelector: ({ onChange }: { onChange: (s: string) => void }) => <button onClick={() => onChange("red")}>Red</button> }));
const item = { id: "one", source: "ss", productId: "STTU169", code: "STTU169", name: "Krekls", brand: null, image: "black.jpg", colorName: "Black", colorHex: null, size: "M", qty: 50, unitPrice: 12 };
it("new colour with missing price clears the old colour price and photo", () => {
  const change = vi.fn(); const view = render(<RowVariantControls item={item} onChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "Red" }));
  expect(change).toHaveBeenCalledWith(expect.objectContaining({ colorName: "Red", colorCode: "red", image: null, unitPrice: null })); view.unmount();
});
it("unpriced size clears the prior priced size instead of borrowing", () => {
  const change = vi.fn(); const view = render(<RowVariantControls item={item} onChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "L" })); expect(change).toHaveBeenCalledWith({ size: "L", unitPrice: null }); view.unmount();
});
it("an unavailable size never auto-fills another size price", () => {
  const change = vi.fn(); const view = render(<RowVariantControls item={{ ...item, size: "XXL", unitPrice: null }} onChange={change} />); expect(change).not.toHaveBeenCalled(); view.unmount();
});
it("preserves an intentional staff-entered zero price", () => {
  const change = vi.fn(); const view = render(<RowVariantControls item={{ ...item, unitPrice: 0 }} onChange={change} />); expect(change).not.toHaveBeenCalled(); view.unmount();
});