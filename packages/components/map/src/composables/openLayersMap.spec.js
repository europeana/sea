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
    style: {
      type: String,
      default: null,
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

      describe("target", () => {
        it("is set from supplied arg", () => {
          const target = "#europeana-map";
          const wrapper = factory({ props: { target } });

          expect(wrapper.vm.map.getTarget()).toBe(target);
        });
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

      describe("style", () => {
        // describe("when supplied in args", () => {
        // const style = "https://example.org/style.json"

        // TODO: this will call fetch, so need to mock that
        // it("uses that style URL to create a Mapbox style layer group", () => {
        //   const wrapper = factory({ props: { style } });

        //   const map = wrapper.vm.map;
        //   const layer = map.getLayers().getArray()[0]
        // });
        // });

        describe("when not supplied in args", () => {
          it("defaults to using an OSM tile layer", () => {
            const wrapper = factory();

            const map = wrapper.vm.map;
            const layer = map.getLayers().getArray()[0];
            expect(layer.constructor.name).toBe("TileLayer");
            const source = layer.getSource();
            expect(source.constructor.name).toBe("OSM");
          });
        });
      });
    });
  });
});
