import { describe, expect, it } from "vitest";
import { catalogItemHead, type CatalogItemSeo } from "./catalogItemSeo";

const base: CatalogItemSeo = {
  source: "ss",
  id: "STTU169",
  name: "Creator 2.0",
  brand: "Stanley/Stella",
  category: "T-krekli",
  description: "Organiskās kokvilnas T-krekls.",
  image: "https://example.com/a.jpg",
  lowPrice: 9.5,
  highPrice: 12,
};

const schemaOf = (head: ReturnType<typeof catalogItemHead>) =>
  JSON.parse((head as { scripts: { children: string }[] }).scripts[0]!.children);

describe("catalogItemHead", () => {
  it("publishes the price range in EUR when prices exist", () => {
    const schema = schemaOf(catalogItemHead(base));
    expect(schema.offers).toMatchObject({ priceCurrency: "EUR", lowPrice: "9.50", highPrice: "12.00" });
  });

  it("omits prices for price-on-request products (zero price)", () => {
    const schema = schemaOf(catalogItemHead({ ...base, lowPrice: null, highPrice: null }));
    expect(schema.offers).toBeUndefined();
  });
});
