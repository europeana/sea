// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";

import { useMapboxProtomapsStyle } from "./protomapsStyle.js";
const countSubStrings = (string, substring) => {
  return (string.match(new RegExp(substring, "g")) || []).length;
};

describe("@/composables/mapbox/protomapsStyle.spec.js", () => {
  describe("useMapboxProtomapsStyle", () => {
    it("uses Europeana-proxied Protomaps as vector tile source", () => {
      const style = useMapboxProtomapsStyle();

      const tileUrl = style.sources.protomaps.tiles[0];

      expect(tileUrl).toBe(
        "https://protomaps.tiles.test.eanadev.org/tiles/v4/{z}/{x}/{y}.mvt",
      );
    });

    describe("without locale specified", () => {
      const locale = undefined;

      it("uses default en for text fields", () => {
        const styleJson = JSON.stringify(useMapboxProtomapsStyle({ locale }));

        const nameEnCount = countSubStrings(styleJson, '"name:en"');

        expect(nameEnCount).toBe(132);
      });
    });

    describe("with supported locale specified", () => {
      const locale = "fr";

      it("uses that locale for text fields", () => {
        const styleJson = JSON.stringify(useMapboxProtomapsStyle({ locale }));

        const nameFrCount = countSubStrings(styleJson, '"name:fr"');

        expect(nameFrCount).toBe(132);
      });
    });

    describe("with unsupported locale specified", () => {
      const locale = "eu";

      it("uses default en for text fields", () => {
        const styleJson = JSON.stringify(useMapboxProtomapsStyle({ locale }));

        const nameEnCount = countSubStrings(styleJson, '"name:en"');

        expect(nameEnCount).toBe(132);
      });
    });
  });
});
