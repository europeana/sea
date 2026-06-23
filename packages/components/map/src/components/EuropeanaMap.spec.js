// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";

import EuropeanaMap from "./EuropeanaMap.vue";
import { fixtures } from "@test/fixtures.js";

describe("@/components/EuropeanaMap.vue", () => {
  it("renders a map container element", () => {
    const wrapper = shallowMount(EuropeanaMap, {
      propsData: {
        json: JSON.stringify(fixtures.onePointFeatureCollection),
      },
    });

    const map = wrapper.get("#europeana-map-map");

    expect(map.isVisible()).toBe(true);
  });
});
