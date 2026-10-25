import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AddToQuoteBlock from "./AddToQuoteBlock";

const state = vi.hoisted(() => ({ isAdmin: false }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => state }));
vi.mock("@/hooks/useProductOrderMinimum", () => ({ useProductOrderMinimum: () => ({ data: null, save: vi.fn() }) }));
vi.mock("@/hooks/useQuoteCart", () => ({ useQuoteCart: () => ({ items: [], add: vi.fn(), updateQty: vi.fn(), remove: vi.fn() }) }));
vi.mock("@/i18n/LanguageContext", () => ({ useLanguage: () => ({ lang: "lv" }) }));
vi.mock("./CreateOfferButton", () => ({ useCreateOffer: () => ({ create: vi.fn(), busy: false }) }));
vi.mock("@/lib/router-compat", () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));

const props = { source: "ss", category: "Trousers", productId: "isolated", name: "Trousers", code: "isolated", brand: null, image: null, colorCode: null, colorName: null, colorHex: null, sizes: ["M"] };
afterEach(cleanup);
describe("informational notice is independent of staff role", () => {
  it.each([false, true])("standalone notice is available with admin=%s", (isAdmin) => {
    state.isAdmin = isAdmin;
    render(<AddToQuoteBlock {...props} />);
    expect(screen.getAllByRole("complementary", { name: "Pasūtījuma daudzums" })).toHaveLength(1);
  });
  it.each([false, true])("gallery-owned notice is not duplicated with admin=%s", (isAdmin) => {
    state.isAdmin = isAdmin;
    render(<AddToQuoteBlock {...props} showMinimumNotice={false} />);
    expect(screen.queryByRole("complementary", { name: "Pasūtījuma daudzums" })).toBeNull();
  });
});