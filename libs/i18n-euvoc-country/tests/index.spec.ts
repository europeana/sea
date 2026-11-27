import { describe, expect, it } from "vitest";
import * as i18n from "../src/index.js";
import { languages } from "../src/index.js";
import { LANGUAGE_CODES } from "../src/codes.js";

describe("@europeana/i18n-euvoc-country", () => {
  it("exports all 25 expected EU language codes", () => {
    expect(LANGUAGE_CODES).toHaveLength(25);
    expect(LANGUAGE_CODES).toContain("en");
    expect(LANGUAGE_CODES).toContain("fr");
    expect(LANGUAGE_CODES).toContain("de");
  });

  it("exports each language individually and inside the languages map", () => {
    const moduleExports = i18n as Record<string, unknown>;

    for (const code of LANGUAGE_CODES) {
      expect(moduleExports[code]).toBeDefined();
      expect(languages[code]).toBeDefined();
      expect(moduleExports[code]).toBe(languages[code]);
    }
  });

  it("uses 3-letter uppercase country/territory codes across all dictionaries", () => {
    for (const code of LANGUAGE_CODES) {
      const dictionary = languages[code];
      const keys = Object.keys(dictionary);

      expect(keys.length).toBeGreaterThan(0);

      for (const countryCode of keys) {
        expect(countryCode, `${code} has invalid key "${countryCode}"`).toMatch(
          /^[A-Z]{3}$/,
        );
      }
    }
  });

  it("only contains valid country keys that exist in English", () => {
    const enKeys = new Set(Object.keys(languages.en));

    for (const code of LANGUAGE_CODES) {
      const langKeys = Object.keys(languages[code]);
      const unexpectedKeys = langKeys.filter((key) => !enKeys.has(key));

      expect(
        unexpectedKeys,
        `${code}.json has keys not present in en.json: ${unexpectedKeys.join(", ")}`,
      ).toEqual([]);
    }
  });

  it("includes core country and EU codes across all languages", () => {
    const coreCodes = [
      "BEL",
      "DEU",
      "ESP",
      "EUR",
      "FRA",
      "GBR",
      "ITA",
      "NLD",
      "POL",
    ];

    for (const code of LANGUAGE_CODES) {
      for (const countryCode of coreCodes) {
        expect(
          languages[code][countryCode as keyof typeof languages.en],
          `${code}.json is missing ${countryCode}`,
        ).toBeDefined();
      }
    }
  });

  it("has non-empty string values for all country entries", () => {
    for (const code of LANGUAGE_CODES) {
      const dictionary = languages[code];

      for (const [countryCode, label] of Object.entries(dictionary)) {
        expect(typeof label, `${code}.${countryCode} should be a string`).toBe(
          "string",
        );
        expect(
          label.trim().length,
          `${code}.${countryCode} should not be empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("returns expected English and localized country labels", () => {
    expect(languages.en.BEL).toBe("Belgium");
    expect(languages.en.EUR).toBe("European Union");
    expect(languages.en.GBR).toBe("United Kingdom");
    expect(languages.en.NLD).toBe("Netherlands");

    expect(languages.fr.FRA).toBe("France");
    expect(languages.de.DEU).toBe("Deutschland");
    expect(languages.nl.NLD).toBe("Nederland");
  });
});
