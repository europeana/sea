// @vitest-environment happy-dom

import { nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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
    hash: {
      type: Boolean,
      default: false,
    },
    map: {
      type: OpenLayersMap,
      default: null,
    },
    style: {
      type: String,
      default: null,
    },
    target: {
      type: String,
      default: elementId,
    },
    zoom: {
      type: Number,
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

      describe("view", () => {
        describe("maxZoom", () => {
          it("is 20", () => {
            const wrapper = factory();

            const maxZoom = wrapper.vm.map.getView().getMaxZoom();

            expect(maxZoom).toBe(20);
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
          it("defaults to using an OSM tile layer", async () => {
            const wrapper = factory();
            await nextTick();

            const map = wrapper.vm.map;
            const layer = map.getLayers().getArray()[0];
            expect(layer.constructor.name).toBe("TileLayer");
            const source = layer.getSource();
            expect(source.constructor.name).toBe("OSM");
          });
        });
      });
    });

    describe("hash", () => {
      afterEach(() => {
        window.location.hash = undefined;
      });

      describe("when `true`", () => {
        const hash = true;

        it("reads centre and zoom from window.location.hash", () => {
          window.location.hash = "#z=5&c=-5%2C36";
          const wrapper = factory({ props: { hash } });

          const map = wrapper.vm.map;

          expect(map.getView().getCenter()).toEqual([-5, 36]);
          expect(map.getView().getZoom()).toBe(5);
        });

        it("updates hash with centre and zoom on moveend event", () => {
          const centre = [-5, 36];
          const zoom = 5;
          const wrapper = factory({ props: { centre, hash, zoom } });

          const map = wrapper.vm.map;
          map.dispatchEvent("moveend");

          expect(window.location.hash).toBe("#c=-5%2C36&z=5");
        });
      });

      describe("when `false` (default)", () => {
        it("ignores centre and zoom from window.location.hash", () => {
          window.location.hash = "#z=5&c=-5%2C36";
          const wrapper = factory();

          const map = wrapper.vm.map;

          expect(map.getView().getCenter()).not.toEqual([-5, 36]);
          expect(map.getView().getZoom()).not.toBe(5);
        });

        it("does not update hash with centre and zoom on moveend event", () => {
          const centre = [-5, 36];
          const zoom = 5;
          const wrapper = factory({ props: { centre, zoom } });

          const map = wrapper.vm.map;
          map.dispatchEvent("moveend");

          expect(window.location.hash).not.toBe("#c=-5%2C36&z=5");
        });
      });
    });
  });
});
