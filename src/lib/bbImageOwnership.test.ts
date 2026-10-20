import { describe, expect, it } from "vitest";
import * as web from "./bbImageOwnership";
import * as sync from "../../supabase/functions/_shared/bbImageOwnership";

const H = "https://mediahub.beechfieldbrands.com/asset/x/thumbnail/";
for (const [label, m] of [["lapa", web], ["sinhronizācija", sync]] as const) {
  describe(`Beechfield attēlu piederība (${label})`, () => {
    it("B15 nepaņem B15C sandwich foto", () => {
      expect(m.bbImageBelongsToStyle(`${H}webimage-B15C-Ultimate-5-Panel-Cap-Sandwich-Peak-Bottle-Green-White-Front-on-shot`, "B15")).toBe(false);
      expect(m.bbImageBelongsToStyle(`${H}webimage-beechfield_b15c_classic-red_white_lifestyle_17573`, "B15")).toBe(false);
      expect(m.bbImageBelongsToStyle(`${H}webimage-beechfield_b15_bottle-green`, "B15")).toBe(true);
    });
    it("B25 nepaņem B25C ar navy apmali", () => {
      expect(m.bbImageBelongsToStyle(`${H}webimage-beechfield_b25c_white_french-navy`, "B25")).toBe(false);
      expect(m.bbImageBelongsToStyle(`${H}webimage-beechfield_b25_white`, "B25")).toBe(true);
    });
    it("īsi kodi neatbilst garākiem (B67/b673, BG5/bg542)", () => {
      expect(m.bbImageBelongsToStyle(`${H}webimage-b673-contrast-peak-cap-product-shot-01`, "B67")).toBe(false);
      expect(m.bbImageBelongsToStyle(`${H}webimage-bagbase_bg542_black_black`, "BG5")).toBe(false);
    });
    it("krāsa = garākā pilnā modeļa krāsa tieši aiz koda; nekādu minējumu", () => {
      const cols = ["Black", "Black/White", "Bottle Green", "Classic Red", "White"];
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_black-white_front`, "B15", cols)).toBe("Black/White");
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_black_front`, "B15", cols)).toBe("Black");
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_bottle-green`, "B15", cols)).toBe("Bottle Green");
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_classic-red_lifestyle_3246`, "B15", cols)).toBe("Classic Red");
      // Modelim nav "Black/White" → divkrāsu fails nav "Black"
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_black-white_front`, "B15", ["Black", "White"])).toBeNull();
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_bottle-green-white`, "B15", ["Bottle Green"])).toBeNull();
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_bottlegreenwhite`, "B15", ["Bottle Green"])).toBeNull();
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_bottlegreen`, "B15", ["Bottle Green"])).toBe("Bottle Green");
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_classic-red`, "B15", ["Red"])).toBeNull();
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15_lifestyle_black`, "B15", cols)).toBeNull();
      expect(m.bbAssignImageColor(`${H}webimage-beechfield_b15c_black`, "B15", cols)).toBeNull();
    });
  });
}

describe("bezkrāsas modeļa foto", () => {
  it("rāda tikai vienkrāsas modelim, citādi godīgi tukšs", () => {
    expect(web.neutralFallback(["a.jpg"], 1)).toEqual(["a.jpg"]);
    expect(web.neutralFallback(["a.jpg"], 2)).toEqual([]);
  });
});
