import { describe, expect, it } from "vitest";

import { generator, LOCALES } from "./index.js";

describe("@/styles/versatiles/index.js", () => {
  describe("generator", () => {
    it("generates localised versions for all supported locales, plus the base style", () => {
      const iterator = generator();
      const versions = [];

      let result = iterator.next();
      while (!result.done) {
        versions.push(result.value);
        result = iterator.next();
      }

      expect(versions.length).toBe(LOCALES.size + 1);
      expect(
        Array.from(LOCALES.values()).every((locale) =>
          versions.some(
            (version) =>
              version.file === `europeana-map-styles.versatiles.${locale}.json`,
          ),
        ),
      ).toBe(true);
      expect(
        versions.some(
          (version) => version.file === `europeana-map-styles.versatiles.json`,
        ),
      ).toBe(true);
    });
  });
});
