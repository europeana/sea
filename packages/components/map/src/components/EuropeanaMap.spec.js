// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { useFetch } from "@vueuse/core";

import EuropeanaMap from "./EuropeanaMap.vue";
import { fixtures } from "@test/fixtures.js";

const mocks = vi.hoisted(() => {
  return {
    useFetch: vi.fn(),
  };
});

vi.mock("@vueuse/core", () => {
  return {
    useFetch: mocks.useFetch,
  };
});

vi.mocked(useFetch).mockReturnValue({
  json: vi.fn().mockResolvedValue({
    data: { value: fixtures.twoPointsFeatureCollection },
  }),
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

        expect(error.message).toBe("No data JSON or URL supplied in props.");
      });
    });
  });
});
