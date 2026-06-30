// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import OpenLayersMap from "ol/Map.js";

import { useOpenLayersMap } from "./openLayersMap.js";

const elementId = "map";
const component = {
  template: `<div id="${elementId}" />`,
  props: {
    centre: {
      type: Array,
      default: null,
    },
    map: {
      type: OpenLayersMap,
      default: null,
    },
    target: {
      type: String,
      default: elementId,
    },
  },
  setup(props) {
    const { map } = useOpenLayersMap(props);
    return { map };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersMap.js", () => {
  describe("useOpenLayersMap", () => {
    describe("map", () => {
      it("uses existing map when supplied", () => {
        const map = new OpenLayersMap();
        const wrapper = factory({ props: { map } });

        expect(wrapper.vm.map).toEqual(map);
      });

      it("initialises an OpenLayersMap when one not supplied", () => {
        const wrapper = factory();

        const map = wrapper.vm.map;

        expect(map instanceof OpenLayersMap).toBe(true);
      });

      describe("centre", () => {
        describe("when supplied in args", () => {
          const centre = [5.0, 4.0];

          it("uses those coordinates", () => {
            const wrapper = factory({ props: { centre } });

            const map = wrapper.vm.map;

            expect(map.getView().getCenter()).toEqual(centre);
          });
        });

        describe("when not supplied in args", () => {
          it("defaults to centre of Europe coordinates", () => {
            const wrapper = factory();

            const map = wrapper.vm.map;

            expect(map.getView().getCenter()).toEqual([
              9.254419, 50.10222300000001,
            ]);
          });
        });
      });
    });
  });
});
