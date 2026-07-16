// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";
import OpenLayersMap from "ol/Map.js";

import { EuropeanaMapComponent, EuropeanaMapWrapper } from "./index.js";

describe("@/index.js", () => {
  describe("EuropeanaMapComponent", () => {
    it("exports the EuropeanaMap component", () => {
      expect(EuropeanaMapComponent["__name"]).toBe("EuropeanaMap");
    });
  });

  describe("EuropeanaMapWrapper", () => {
    describe(".olMap", () => {
      it("is an OpenLayers Map", () => {
        const europeanaMap = new EuropeanaMapWrapper();

        const olMap = europeanaMap.olMap;

        expect(olMap instanceof OpenLayersMap).toBe(true);
      });
    });

    describe(".config", () => {
      it("is a config object", () => {
        const options = {
          json: "{}",
          style: "https://example.org/style.json",
          url: "https://example.org/geo.json",
        };
        const europeanaMap = new EuropeanaMapWrapper(null, options);

        const config = europeanaMap.config;

        expect(config.url).toBe(options.url);
        expect(config.style).toBe(options.style);
        expect(config.json).toBe(options.json);
      });
    });

    describe(".app", () => {
      it("is a Vue app instance mounting the EuropeanaMap component", () => {
        const europeanaMap = new EuropeanaMapWrapper();

        const app = europeanaMap.app;

        expect(app["_component"]["__name"]).toBe("EuropeanaMap");
      });
    });

    describe(".set()", () => {
      it("updates config if setting is known", () => {
        const europeanaMap = new EuropeanaMapWrapper();
        const style = "https://example.org/style.json";

        europeanaMap.set("style", style);

        expect(europeanaMap.config.style).toBe(style);
      });

      it("does nothing to config if setting is not known", () => {
        const europeanaMap = new EuropeanaMapWrapper();
        const unknown = "https://example.org/style.json";

        europeanaMap.set("unknown", unknown);

        expect(europeanaMap.config.unknown).toBeUndefined();
      });
    });
  });
});
