// @vitest-environment happy-dom

import { nextTick, ref } from "vue";
import { shallowMount } from "@vue/test-utils";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import OpenLayersMap from "ol/Map.js";

import { createOpenLayersMap, useOpenLayersMap } from "./openLayersMap.js";

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
    elementId: {
      type: String,
      default: elementId,
    },
    zoom: {
      type: Number,
      default: null,
    },
  },
  setup(props) {
    const centre = ref(props.centre);
    const zoom = ref(props.zoom);

    const { map } = useOpenLayersMap({
      ...props,
      centre,
      zoom,
    });

    return { centre, map, zoom };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersMap.js", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("createOpenLayersMap", () => {
    it("returns a new instance of OpenLayers Map class", () => {
      const map = createOpenLayersMap();

      expect(map.constructor.name).toBe("Map");
    });

    it("has no controls by default", () => {
      const map = createOpenLayersMap();

      const controlsCount = map.getControls().getLength();

      expect(controlsCount).toBe(0);
    });

    it("disables rotation interactions", () => {
      const map = createOpenLayersMap();

      const interactions = map
        .getInteractions()
        .getArray()
        .map((interaction) => interaction.constructor.name);

      expect(interactions.includes("DragRotate")).toBe(false);
      expect(interactions.includes("PinchRotate")).toBe(false);
    });
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
        it("is set from supplied elementId arg", () => {
          const elementId = "#europeana-map";
          const wrapper = factory({ props: { elementId } });

          expect(wrapper.vm.map.getTarget()).toBe(elementId);
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

      // it("updates hash with centre and zoom on moveend event (after loadend event)", () => {

      //   const wrapper = factory({ props: { centre, hash, zoom } });

      //   const map = wrapper.vm.map;
      //   map.dispatchEvent("loadend");
      //   map.dispatchEvent("moveend");

      //   expect(window.location.hash).toBe("#em-id=map&em-c=-5%2C36&em-z=5");
      // });

      describe("moveend event listener", () => {
        const centre = [-5, 36];
        const zoom = 5;

        describe("before loadend event", () => {
          it("does not update centre and zoom ref values", async () => {
            const wrapper = factory();

            const map = wrapper.vm.map;
            map.getView().setCenter(centre);
            map.getView().setZoom(zoom);
            map.dispatchEvent("moveend");

            await nextTick();

            expect(wrapper.vm.zoom).not.toBe(zoom);
            expect(wrapper.vm.centre).not.toEqual(centre);
          });
        });

        describe("after loadend event", () => {
          it("updates centre and zoom ref values", async () => {
            const wrapper = factory();

            const map = wrapper.vm.map;
            map.getView().setCenter(centre);
            map.getView().setZoom(zoom);
            map.dispatchEvent("loadend");
            map.dispatchEvent("moveend");

            await nextTick();

            expect(wrapper.vm.zoom).toBe(zoom);
            expect(wrapper.vm.centre).toEqual(centre);
          });
        });
      });
    });

    //   describe("hash", () => {
    //     afterEach(() => {
    //       window.location.hash = undefined;
    //     });

    //     describe("when `true`", () => {
    //       const hash = true;

    //       it("reads centre and zoom from window.location.hash", () => {
    //         window.location.hash = "#em-id=map&em-z=5&em-c=-5%2C36";
    //         const wrapper = factory({ props: { hash } });

    //         const map = wrapper.vm.map;

    //         expect(map.getView().getCenter()).toEqual([-5, 36]);
    //         expect(map.getView().getZoom()).toBe(5);
    //       });
    //     });

    //     describe("when `false` (default)", () => {
    //       it("ignores centre and zoom from window.location.hash", () => {
    //         window.location.hash = "#em-id=map&em-z=5&em-c=-5%2C36";
    //         const wrapper = factory();

    //         const map = wrapper.vm.map;

    //         expect(map.getView().getCenter()).not.toEqual([-5, 36]);
    //         expect(map.getView().getZoom()).not.toBe(5);
    //       });

    //       it("does not update hash with centre and zoom on moveend event", () => {
    //         const centre = [-5, 36];
    //         const zoom = 5;
    //         const wrapper = factory({ props: { centre, zoom } });

    //         const map = wrapper.vm.map;
    //         map.dispatchEvent("moveend");

    //         expect(window.location.hash).not.toBe("#c=-5%2C36&z=5");
    //       });
    //     });
    //   });
  });
});
