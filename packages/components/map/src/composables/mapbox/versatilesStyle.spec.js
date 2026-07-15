// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";

import { useMapboxVersatilesStyle } from "./versatilesStyle.js";

describe("@/composables/mapbox/versatilesStyle.spec.js", () => {
  describe("useMapboxVersatilesStyle", () => {
    it("uses Versatiles as vector tile source", () => {
      const style = useMapboxVersatilesStyle();

      const tileUrl = style.sources["versatiles-shortbread"].tiles[0];

      expect(tileUrl).toBe(
        "https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}",
      );
    });
  });
});
