// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { useFetch } from "@vueuse/core";

import EuropeanaMap from "./EuropeanaMap.vue";
import { useMapboxProtomapsStyle } from "@/composables/mapboxProtomapsStyle.js";
import { fixtures } from "@test/fixtures.js";

const mocks = vi.hoisted(() => {
  return {
    useFetch: vi.fn(),
    useMapboxProtomapsStyle: vi.fn(),
  };
});

vi.mock("@vueuse/core", () => {
  return {
    useFetch: mocks.useFetch,
  };
});
vi.mock("@/composables/mapboxProtomapsStyle.js", () => {
  return {
    useMapboxProtomapsStyle: mocks.useMapboxProtomapsStyle,
  };
});

vi.mocked(useFetch).mockReturnValue({
  json: vi.fn().mockResolvedValue({
    data: { value: fixtures.twoPointsFeatureCollection },
  }),
});
vi.mocked(useMapboxProtomapsStyle).mockReturnValue({
  version: 8,
  name: "mocked protomaps style",
  layers: [
    {
      id: "background",
      type: "background",
    },
  ],
  sources: {},
});

const factory = ({ props } = {}) =>
  shallowMount(EuropeanaMap, {
    props,
  });

describe("@/components/EuropeanaMap.vue", () => {
  it("renders a map container element", () => {
    const wrapper = factory({
      props: {
        json: JSON.stringify(fixtures.onePointFeatureCollection),
      },
    });

    const map = wrapper.get("#europeana-map-map");

    expect(map.isVisible()).toBe(true);
  });

  describe("data", () => {
    describe("when supplied `json` in props", () => {
      const props = {
        json: JSON.stringify(fixtures.onePointFeatureCollection),
      };

      it("uses parsed JSON for data value", () => {
        const wrapper = factory({ props });

        const data = wrapper.vm.data;

        expect(data).toEqual(fixtures.onePointFeatureCollection);
      });
    });

    describe("when supplied `url` in props", () => {
      const props = { url: fixtures.url };

      it("fetches GeoJSON from URL", async () => {
        const wrapper = factory({ props });

        await new Promise(process.nextTick);
        const data = wrapper.vm.data;

        expect(data).toEqual(fixtures.twoPointsFeatureCollection);
      });
    });

    describe("when supplied neither in props", () => {
      const props = {};

      it("throws an error", () => {
        let error;
        try {
          factory({ props });
        } catch (e) {
          error = e;
        }

        expect(error.message).toBe("No data JSON or URL supplied.");
      });
    });
  });

  describe("style", () => {
    describe("when using protomaps", () => {
      const style = "protomaps";

      it("passes locale (from props) and API key (from styleOptions) to the useMapboxProtomapsStyle composable", () => {
        const locale = "fr";
        const apiKey = "my_key";
        const styleOptions = { apiKey };
        const props = {
          json: JSON.stringify(fixtures.onePointFeatureCollection),
          locale,
          style,
          styleOptions,
        };

        const wrapper = factory({ props });

        expect(vi.mocked(useMapboxProtomapsStyle)).toHaveBeenCalledWith({
          apiKey,
          locale,
        });
        expect(wrapper.vm.style.name).toBe("mocked protomaps style");
      });
    });
  });
});
