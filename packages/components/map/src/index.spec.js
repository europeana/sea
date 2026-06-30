// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";
import OpenLayersMap from "ol/Map.js";

import EuropeanaMap from "./index.js";

describe("@/index.js", () => {
  describe("EuropeanaMap", () => {
    describe(".olMap", () => {
      it("is an OpenLayers Map", () => {
        const europeanaMap = new EuropeanaMap();

        const olMap = europeanaMap.olMap;

        expect(olMap instanceof OpenLayersMap).toBe(true);
      });
    });

    describe(".config", () => {
      it("is a config object", () => {
        const options = {
          url: "https://example.org/geo.json",
          style: "https://example.org/style.json",
          json: null,
        };
        const europeanaMap = new EuropeanaMap(null, options);

        const config = europeanaMap.config;

        expect(config.url).toBe(options.url);
        expect(config.style).toBe(options.style);
        expect(config.json).toBe(options.json);
      });
    });

    describe(".app", () => {
      it("is a Vue app instance mounting the EuropeanaMap component", () => {
        const europeanaMap = new EuropeanaMap();

        const app = europeanaMap.app;

        expect(app["_component"]["__name"]).toBe("EuropeanaMap");
      });
    });

    describe(".set()", () => {
      it("updates config if setting is known", () => {
        const europeanaMap = new EuropeanaMap();
        const style = "https://example.org/style.json";

        europeanaMap.set("style", style);

        expect(europeanaMap.config.style).toBe(style);
      });
    });
  });
});
