import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { QuoteCartProvider, useQuoteCart } from "./useQuoteCart";
const key = "ervitex:quote-cart:v1";
function Consumer() { const { totalQty } = useQuoteCart(); return <span>{totalQty}</span>; }
it("restores saved quantities before persisting, including StrictMode mount replay", async () => {
  localStorage.setItem(key, JSON.stringify([{ id: "synthetic", source: "ss", productId: "STTU169", colorCode: "Black", size: "M", qty: 50 }]));
  const view = render(<StrictMode><QuoteCartProvider><Consumer /></QuoteCartProvider></StrictMode>);
  await waitFor(() => expect(screen.getByText("50")).toBeInTheDocument());
  expect(JSON.parse(localStorage.getItem(key) || "[]")[0].qty).toBe(50);
  view.unmount(); localStorage.removeItem(key);
});