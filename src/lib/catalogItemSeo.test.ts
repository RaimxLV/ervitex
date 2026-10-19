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

  it("never claims stock availability (B2B stock is not published)", () => {
    const schema = schemaOf(catalogItemHead(base));
    expect(JSON.stringify(schema)).not.toContain("availability");
  });

  it("emits a self-referencing canonical, og:url and lv hreflang", () => {
    const head = catalogItemHead(base);
    const url = "https://www.ervitex.lv/catalog/item/ss/STTU169";
    expect(head.links).toContainEqual({ rel: "canonical", href: url });
    expect(head.links).toContainEqual({ rel: "alternate", hrefLang: "lv", href: url });
    expect(head.meta).toContainEqual({ property: "og:url", content: url });
    expect(head.meta).toContainEqual({ name: "robots", content: "index, follow" });
  });

  it("emits a BreadcrumbList matching the visible navigation path", () => {
    const head = catalogItemHead(base);
    const breadcrumb = JSON.parse(
      (head as { scripts: { children: string }[] }).scripts[1]!.children,
    );
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[2].name).toBe("Creator 2.0");
  });
});
