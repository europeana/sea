// @vitest-environment happy-dom

import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import { afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import OpenLayersMap from "ol/Map.js";

import { useOpenLayersMap } from "./openLayersMap.js";

const mockFetch = vi.fn();
global.fetch = mockFetch;

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
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

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
        describe("when supplied in args", () => {
          const style = "https://example.org/style.json";

          it("uses that style URL to create a Mapbox style layer group", async () => {
            const styleResponse = {
              version: 8,
              name: "example-style",
              sources: {
                "example-source": {
                  tiles: ["https://tiles.example.org/tiles/osm/{z}/{x}/{y}"],
                  type: "vector",
                  scheme: "xyz",
                  bounds: [-180, -85.0511287798066, 180, 85.0511287798066],
                  minzoom: 0,
                  maxzoom: 14,
                },
              },
              layers: [
                {
                  source: "example-source",
                  id: "water-ocean",
                  type: "fill",
                  "source-layer": "ocean",
                  paint: {
                    "fill-color": "rgb(193,219,242)",
                  },
                },
              ],
            };
            mockFetch.mockResolvedValueOnce({
              ok: true,
              status: 200,
              json: () => Promise.resolve(styleResponse),
            });

            const wrapper = factory({ props: { style } });

            await nextTick();
            expect(mockFetch).toHaveBeenCalledTimes(1);
            const map = wrapper.vm.map;
            const layer = map.getLayers().getArray()[0];
            expect(layer.constructor.name).toBe("LayerGroup");
            // TODO: test that the layer(s) are based on the style response
            //       ... but how? the following is undefined...
            // console.log(layer.getLayers().getArray()[0])
          });
        });

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
