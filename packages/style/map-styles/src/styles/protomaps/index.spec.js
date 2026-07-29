import { describe, expect, it } from "vitest";

import { generator, LOCALES } from "./index.js";

describe("@/styles/protomaps/index.js", () => {
  describe("generator", () => {
    it("generates localised versions for all supported locales", () => {
      const iterator = generator();
      const versions = [];

      let result = iterator.next();
      while (!result.done) {
        versions.push(result.value);
        result = iterator.next();
      }

      expect(versions.length).toBe(LOCALES.size);
      expect(
        Array.from(LOCALES.values()).every((locale) =>
          versions.some(
            (version) =>
              version.file === `europeana-map-styles.protomaps.${locale}.json`,
          ),
        ),
      ).toBe(true);
    });
  });
});
