import { describe, expect, it } from "vitest";
import { offerEditorPath } from "./offerNavigation";

describe("staff offer navigation", () => {
  it("opens a created offer outside the admin panel", () => {
    expect(offerEditorPath("test-offer")).toBe("/offers/test-offer");
  });
});