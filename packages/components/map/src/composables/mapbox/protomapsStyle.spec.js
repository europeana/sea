// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";

import { useMapboxProtomapsStyle } from "./protomapsStyle.js";
const countSubStrings = (string, substring) => {
  return (string.match(new RegExp(substring, "g")) || []).length;
};

describe("@/composables/mapbox/protomapsStyle.spec.js", () => {
  describe("useMapboxProtomapsStyle", () => {
    describe("without protomaps API key", () => {
      const apiKey = undefined;

      it("throws error", () => {
        let error;
        try {
          useMapboxProtomapsStyle({ apiKey });
        } catch (e) {
          error = e;
        }

        expect(error.message).toBe(
          "protomaps style requires API key in apiKey option",
        );
      });
    });

    describe("with protomaps API key", () => {
      const apiKey = "my_key";

      it("uses Protomaps as vector tile source, with API key injected", () => {
        const style = useMapboxProtomapsStyle({ apiKey });

        const tileUrl = style.sources.protomaps.tiles[0];

        expect(tileUrl).toBe(
          `https://api.protomaps.com/tiles/v4/%7Bz%7D/%7Bx%7D/%7By%7D.mvt?key=${apiKey}`,
        );
      });

      describe("without locale specified", () => {
        const locale = undefined;

        it("uses default en for text fields", () => {
          const styleJson = JSON.stringify(
            useMapboxProtomapsStyle({ apiKey, locale }),
          );

          const nameEnCount = countSubStrings(styleJson, '"name:en"');

          expect(nameEnCount).toBe(132);
        });
      });

      describe("with supported locale specified", () => {
        const locale = "fr";

        it("uses that locale for text fields", () => {
          const styleJson = JSON.stringify(
            useMapboxProtomapsStyle({ apiKey, locale }),
          );

          const nameFrCount = countSubStrings(styleJson, '"name:fr"');

          expect(nameFrCount).toBe(132);
        });
      });

      describe("with unsupported locale specified", () => {
        const locale = "eu";

        it("uses default en for text fields", () => {
          const styleJson = JSON.stringify(
            useMapboxProtomapsStyle({ apiKey, locale }),
          );

          const nameEnCount = countSubStrings(styleJson, '"name:en"');

          expect(nameEnCount).toBe(132);
        });
      });
    });
  });
});
