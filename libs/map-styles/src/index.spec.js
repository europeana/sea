import { describe, expect, it } from "vitest";

import { useEuropeanaMapStyle } from "./index.js";

describe("@/index.js", () => {
  describe("useEuropeanaMapStyle", () => {
    describe.each([
      {
        styleName: "protomaps",
        baseURL: undefined,
        locale: undefined,
        version: undefined,
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles/dist/protomaps/europeana-map-styles.protomaps.en.json",
      },
      {
        styleName: "protomaps",
        baseURL: undefined,
        locale: undefined,
        version: "0.1.13",
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles@0.1.13/dist/protomaps/europeana-map-styles.protomaps.en.json",
      },
      {
        styleName: "protomaps",
        baseURL: undefined,
        locale: "fr",
        version: undefined,
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles/dist/protomaps/europeana-map-styles.protomaps.fr.json",
      },
      {
        styleName: "protomaps",
        baseURL: undefined,
        locale: "fr",
        version: "0.1.13",
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles@0.1.13/dist/protomaps/europeana-map-styles.protomaps.fr.json",
      },
      {
        styleName: "protomaps",
        baseURL: "https://unpkg.com",
        locale: undefined,
        version: undefined,
        expected:
          "https://unpkg.com/@europeana/map-styles/dist/protomaps/europeana-map-styles.protomaps.en.json",
      },
      {
        styleName: "protomaps",
        baseURL: "https://unpkg.com",
        locale: undefined,
        version: "0.1.13",
        expected:
          "https://unpkg.com/@europeana/map-styles@0.1.13/dist/protomaps/europeana-map-styles.protomaps.en.json",
      },
      {
        styleName: "protomaps",
        baseURL: "https://unpkg.com",
        locale: "fr",
        version: undefined,
        expected:
          "https://unpkg.com/@europeana/map-styles/dist/protomaps/europeana-map-styles.protomaps.fr.json",
      },
      {
        styleName: "protomaps",
        baseURL: "https://unpkg.com",
        locale: "fr",
        version: "0.1.13",
        expected:
          "https://unpkg.com/@europeana/map-styles@0.1.13/dist/protomaps/europeana-map-styles.protomaps.fr.json",
      },
      {
        styleName: "versatiles",
        baseURL: undefined,
        locale: undefined,
        version: undefined,
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: undefined,
        locale: undefined,
        version: "0.1.13",
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles@0.1.13/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: undefined,
        locale: "fr",
        version: undefined,
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.fr.json",
      },
      {
        styleName: "versatiles",
        baseURL: undefined,
        locale: "fi",
        version: undefined,
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: undefined,
        locale: "fr",
        version: "0.1.13",
        expected:
          "https://cdn.jsdelivr.net/npm/@europeana/map-styles@0.1.13/dist/versatiles/europeana-map-styles.versatiles.fr.json",
      },
      {
        styleName: "versatiles",
        baseURL: "https://unpkg.com",
        locale: undefined,
        version: undefined,
        expected:
          "https://unpkg.com/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: "https://unpkg.com",
        locale: undefined,
        version: "0.1.13",
        expected:
          "https://unpkg.com/@europeana/map-styles@0.1.13/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: "https://unpkg.com",
        locale: "fr",
        version: undefined,
        expected:
          "https://unpkg.com/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.fr.json",
      },
      {
        styleName: "versatiles",
        baseURL: "https://unpkg.com",
        locale: "fi",
        version: undefined,
        expected:
          "https://unpkg.com/@europeana/map-styles/dist/versatiles/europeana-map-styles.versatiles.json",
      },
      {
        styleName: "versatiles",
        baseURL: "https://unpkg.com",
        locale: "fr",
        version: "0.1.13",
        expected:
          "https://unpkg.com/@europeana/map-styles@0.1.13/dist/versatiles/europeana-map-styles.versatiles.fr.json",
      },
    ])(
      "with: styleName $styleName, baseURL $baseURL; locale $locale; version $version",
      ({ styleName, baseURL, locale, version, expected }) => {
        it(`returns ${expected}`, () => {
          const style = useEuropeanaMapStyle(styleName, {
            baseURL,
            locale,
            version,
          });

          expect(style).toBe(expected);
        });
      },
    );
  });
});
