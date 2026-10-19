import { describe, expect, it } from "vitest";
import { ADMIN_HOME } from "./adminNavigation";
describe("admin entry", () => {
  it("opens requests first", () => { expect(ADMIN_HOME).toBe("/admin/quotes"); });
});
