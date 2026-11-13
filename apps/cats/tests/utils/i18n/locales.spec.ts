import { describe, it, expect } from "vitest";
import { supportedLocales, localeForLang } from "@/utils/i18n/locales";

describe("@/utils/i18n/locales", () => {
  describe("supportedLocales", () => {
    it("contains all 23 expected EU target locales without duplicates", () => {
      expect(supportedLocales).toHaveLength(23);
      expect(new Set(supportedLocales).size).toBe(23);
      expect(supportedLocales).toEqual([
        "bg-BG",
        "cs-CZ",
        "da-DK",
        "de-DE",
        "el-GR",
        "es-ES",
        "et-EE",
        "fi-FI",
        "fr-FR",
        "ga-IE",
        "hr-HR",
        "hu-HU",
        "it-IT",
        "lt-LT",
        "lv-LV",
        "mt-MT",
        "nl-NL",
        "pl-PL",
        "pt-PT",
        "ro-RO",
        "sk-SK",
        "sl-SI",
        "sv-SE",
      ]);
    });

    it("excludes English (en-GB / en-US) since English is the source locale", () => {
      expect(supportedLocales).not.toContain("en-GB");
      expect(supportedLocales).not.toContain("en-US");
    });
  });

  describe("localeForLang", () => {
    it.each([
      ["FR", "fr-FR"],
      ["DE", "de-DE"],
      ["NL", "nl-NL"],
      ["EL", "el-GR"],
      ["SV", "sv-SE"],
      ["GA", "ga-IE"],
    ])("maps uppercase language code %s to %s", (lang, expectedLocale) => {
      expect(localeForLang(lang)).toBe(expectedLocale);
    });

    it("handles lowercase and mixed-case language codes", () => {
      expect(localeForLang("fr")).toBe("fr-FR");
      expect(localeForLang("De")).toBe("de-DE");
      expect(localeForLang("pT")).toBe("pt-PT");
    });

    it("returns undefined for unsupported language codes", () => {
      expect(localeForLang("EN")).toBeUndefined();
      expect(localeForLang("JA")).toBeUndefined();
      expect(localeForLang("XX")).toBeUndefined();
    });

    it("returns undefined for empty or partial prefixes without matching a hyphenated boundary", () => {
      expect(localeForLang("")).toBeUndefined();
      expect(localeForLang("f")).toBeUndefined();
    });
  });
});
