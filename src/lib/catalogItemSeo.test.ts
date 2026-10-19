import { describe, expect, it } from "vitest";
import { catalogItemHead, type CatalogItemSeo } from "./catalogItemSeo";
import { grossFromNet } from "./vat";

// lowPrice/highPrice are public GROSS prices (incl. 21% VAT) — the same
// values the product page displays.
const base: CatalogItemSeo = {
  source: "ss",
  id: "STTU169",
  name: "Creator 2.0",
  brand: "Stanley/Stella",
  category: "T-krekli",
  description: "Organiskās kokvilnas T-krekls.",
  image: "https://example.com/a.jpg",
  lowPrice: 11.5,
  highPrice: 14.52,
};

const schemaOf = (head: ReturnType<typeof catalogItemHead>) =>
  JSON.parse((head as { scripts: { children: string }[] }).scripts[0]!.children);

describe("catalogItemHead", () => {
  it("publishes the gross price range in EUR when prices exist", () => {
    const schema = schemaOf(catalogItemHead(base));
    expect(schema.offers).toMatchObject({ priceCurrency: "EUR", lowPrice: "11.50", highPrice: "14.52" });
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

describe("JSON-LD prices are gross (net × 1.21), matching the visible page price", () => {
  it("PF 210777 regression: net 5.94 publishes as gross 7.19", () => {
    const gross = grossFromNet(5.94);
    expect(gross).toBe(7.19);
    const schema = schemaOf(
      catalogItemHead({ ...base, source: "pf", id: "210777", lowPrice: gross, highPrice: gross }),
    );
    expect(schema.offers.lowPrice).toBe("7.19");
    expect(schema.offers.highPrice).toBe("7.19");
  });

  it("ETX regression: normalized net gets VAT exactly once, never twice", () => {
    // ETX manual products store normalized NET in catalog_variant_prices;
    // gross must be net × 1.21 (12.10), not net × 1.21² (14.64).
    const gross = grossFromNet(10);
    expect(gross).toBe(12.1);
    expect(grossFromNet(gross)).not.toBe(gross);
    const schema = schemaOf(
      catalogItemHead({ ...base, source: "etx", id: "shirt", lowPrice: gross, highPrice: gross }),
    );
    expect(schema.offers.lowPrice).toBe("12.10");
    expect(JSON.stringify(schema.offers)).not.toContain("14.64");
  });
});
