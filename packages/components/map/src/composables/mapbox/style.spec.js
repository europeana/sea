// @vitest-environment happy-dom

import { describe, it, expect, vi } from "vitest";

import { useMapboxStyle } from "./style.js";

import { useMapboxProtomapsStyle } from "./protomapsStyle.js";
import { useMapboxVersatilesStyle } from "./versatilesStyle.js";

const mocks = vi.hoisted(() => {
  return {
    useMapboxProtomapsStyle: vi.fn(),
    useMapboxVersatilesStyle: vi.fn(),
  };
});

vi.mock("./protomapsStyle.js", () => {
  return {
    useMapboxProtomapsStyle: mocks.useMapboxProtomapsStyle,
  };
});
vi.mock("./versatilesStyle.js", () => {
  return {
    useMapboxVersatilesStyle: mocks.useMapboxVersatilesStyle,
  };
});

vi.mocked(useMapboxProtomapsStyle).mockReturnValue("mocked protomaps style");
vi.mocked(useMapboxVersatilesStyle).mockReturnValue("mocked versatiles style");

describe("@/composables/mapbox/style.spec.js", () => {
  describe("useMapboxStyle", () => {
    describe("when styleId is protomaps", () => {
      const styleId = "protomaps";
      const locale = "fr";
      const apiKey = "my_key";
      const styleOptions = { apiKey, locale };

      it("calls protomaps style composable with options", async () => {
        await useMapboxStyle(styleId, styleOptions);

        expect(vi.mocked(useMapboxProtomapsStyle)).toHaveBeenCalledWith({
          apiKey,
          locale,
        });
      });

      it("returns loaded protomaps style from composable", async () => {
        const style = await useMapboxStyle(styleId, styleOptions);

        expect(style).toBe("mocked protomaps style");
      });
    });

    describe("when styleId is versatiles", () => {
      const styleId = "versatiles";

      it("calls versatiles style composable with options", async () => {
        await useMapboxStyle(styleId);

        expect(vi.mocked(useMapboxVersatilesStyle)).toHaveBeenCalledWith({});
      });

      it("returns loaded versatiles style from composable", async () => {
        const style = await useMapboxStyle(styleId);

        expect(style).toBe("mocked versatiles style");
      });
    });

    describe("when styleId is specified but not explicitly supported", () => {
      const styleId = "https://tiles.openfreemap.org/styles/liberty";

      it("returns style ID", async () => {
        const style = await useMapboxStyle(styleId);

        expect(style).toBe(styleId);
      });
    });

    describe("when no styleId is specified", () => {
      const styleId = undefined;

      it("returns default style ID, openstreetmap", async () => {
        const style = await useMapboxStyle(styleId);

        expect(style).toBe("openstreetmap");
      });
    });
  });
});
