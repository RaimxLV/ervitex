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
    it("krāsa jāsakrīt veseliem vārdiem", () => {
      expect(m.bbImageMentionsColor(`${H}webimage-beechfield_b15_classic-red_lifestyle_3246`, "Red")).toBe(false);
      expect(m.bbImageMentionsColor(`${H}webimage-beechfield_b15_classic-red_lifestyle_3246`, "Classic Red")).toBe(true);
      expect(m.bbImageMentionsColor(`${H}webimage-beechfield_b15_olive-green_rear`, "Green")).toBe(false);
    });
  });
}
