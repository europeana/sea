// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import Cluster from "ol/source/Cluster.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import VectorLayer from "ol/layer/Vector.js";
import { useGeographic } from "ol/proj.js";

import { useOpenLayersPointsVectorLayer } from "./openLayersPointsVectorLayer.js";
import { fixtures } from "@test/fixtures.js";

const elementId = "map";
const component = {
  template: `<div id="${elementId}" /><div id="popover"/>`,
  props: {
    icon: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const data = ref(null);
    const map = ref(null);
    const icon = props.icon;
    const pinPopover = ref(null);

    useGeographic();
    useOpenLayersPointsVectorLayer({ data, map, icon, pinPopover });

    return { data, map, icon, pinPopover };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersPointsVectorLayer.js", () => {
  describe("useOpenLayersPointsVectorLayer", () => {
    describe("when data and map values become present", () => {
      it("adds VectorLayer for clustered points to map", async () => {
        const wrapper = factory();
        wrapper.vm.map = new Map();
        wrapper.vm.data = fixtures.twoPointsFeatureCollection;
        await nextTick();

        const map = wrapper.vm.map;
        const layers = map.getLayers().getArray();
        expect(layers).toHaveLength(1);
        expect(layers[0]).toBeInstanceOf(VectorLayer);

        const clusterSource = layers[0].getSource();
        expect(clusterSource).toBeInstanceOf(Cluster);
        expect(clusterSource.getSource().getFeatures()).toHaveLength(
          fixtures.twoPointsFeatureCollection.features.length,
        );
      });

      describe("when data has a single point", () => {
        it("centres map on that point", async () => {
          const wrapper = factory();
          wrapper.vm.map = new Map();
          wrapper.vm.data = fixtures.onePointFeatureCollection;
          await nextTick();

          const map = wrapper.vm.map;
          expect(map.getView().getCenter()).toEqual(
            fixtures.onePointFeatureCollection.features[0].geometry.coordinates,
          );
        });

        describe("and popover element is present", () => {
          it("adds Overlay for popover content", async () => {
            const wrapper = factory();
            wrapper.vm.map = new Map();
            wrapper.vm.data = fixtures.onePointFeatureCollection;
            wrapper.vm.pinPopover = wrapper.find("#popover").element;
            await nextTick();

            const map = wrapper.vm.map;
            const overlays = map.getOverlays().getArray();
            expect(overlays).toHaveLength(1);
            expect(overlays[0]).toBeInstanceOf(Overlay);
          });

          describe("and a point is clicked", () => {
            it("dispatches change:activefeature event and sets overlay position", async () => {
              const wrapper = factory();
              wrapper.vm.map = new Map();
              wrapper.vm.data = fixtures.onePointFeatureCollection;
              wrapper.vm.pinPopover = wrapper.find("#popover").element;
              await nextTick();

              const map = wrapper.vm.map;
              const dispatchEventSpy = vi.spyOn(map, "dispatchEvent");
              const name = "feature name";

              vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
                {
                  get: () => [
                    {
                      getGeometry: () => ({
                        getCoordinates: () => [0, 0],
                      }),
                      get: () => name,
                    },
                  ],
                },
              ]);

              const overlay = map.getOverlays().getArray()[0];
              const setPositionSpy = vi.spyOn(overlay, "setPosition");

              await map.dispatchEvent({
                type: "click",
              });

              expect(dispatchEventSpy).toHaveBeenCalledWith({
                type: "change:activefeature",
                activeFeatureName: name,
              });
              expect(setPositionSpy).toHaveBeenCalled();
            });
          });
        });
      });

      describe("when data has multiple points", () => {
        describe("and cluster is clicked", () => {
          it("zooms in to the extent of the clustered points", async () => {
            const wrapper = factory();
            wrapper.vm.map = new Map();
            wrapper.vm.data = fixtures.multiplePointsFeatureCollection;
            await nextTick();

            const map = wrapper.vm.map;
            const fitViewSpy = vi.spyOn(map.getView(), "fit");

            vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
              {
                get: () => [
                  {
                    getGeometry: () => ({
                      getCoordinates: () => [0, 0],
                    }),
                  },
                  {
                    getGeometry: () => ({
                      getCoordinates: () => [10, 10],
                    }),
                  },
                ],
              },
            ]);

            await map.dispatchEvent({
              type: "click",
            });

            expect(fitViewSpy).toHaveBeenCalled();
          });
        });
      });

      describe("styling", () => {
        it("calls the supplied style fn");
      });
    });
  });
});
