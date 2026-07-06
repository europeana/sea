// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import Map from "ol/Map.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import { useGeographic } from "ol/proj.js";

import { useOpenLayersPointClusters } from "./openLayersPointClusters.js";
import { fixtures } from "@test/fixtures.js";

const elementId = "map";
const component = {
  template: `<div id="${elementId}" />`,
  props: {
    pointIconSrc: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const data = ref(null);
    const map = ref(null);
    const pointIconSrc = props.pointIconSrc;

    useGeographic();
    useOpenLayersPointClusters({ data, map, pointIconSrc });

    return { data, map, pointIconSrc };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersPointClusters.js", () => {
  describe("useOpenLayersPointClusters", () => {
    describe("when data and map values become present", () => {
      it("adds VectorLayer for clustered points to map", async () => {
        const wrapper = factory();
        wrapper.vm.map = new Map();
        wrapper.vm.data = fixtures.twoPointsFeatureCollection;
        await nextTick();

        const map = wrapper.vm.map;
        const layers = map.getLayers().getArray();
        expect(layers.length).toBe(1);
        expect(layers[0] instanceof VectorLayer).toBe(true);

        const clusterSource = layers[0].getSource();
        expect(clusterSource instanceof Cluster).toBe(true);
        expect(clusterSource.getSource().getFeatures().length).toBe(
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
        describe("single point", () => {
          describe("when pointIconSrc is supplied", () => {
            const pointIconSrc = "https://example.org/icons/location.svg";

            it("styles point as an icon using that image", async () => {
              const feature = {
                get: () => ({ length: 1 }),
              };
              const wrapper = factory({ props: { pointIconSrc } });
              wrapper.vm.map = new Map();
              wrapper.vm.data = fixtures.onePointFeatureCollection;
              await nextTick();

              const map = wrapper.vm.map;
              const layers = map.getLayers().getArray();
              const clusterLayer = layers[0];
              const style = clusterLayer.getStyleFunction()(feature);

              expect(style.getImage().getSrc()).toBe(pointIconSrc);
              expect(style.getText()).toBeNull();
            });
          });

          describe("when pointIconSrc is not supplied", () => {
            it("styles point as a circle", async () => {
              const feature = {
                get: () => ({ length: 1 }),
              };
              const wrapper = factory();
              wrapper.vm.map = new Map();
              wrapper.vm.data = fixtures.onePointFeatureCollection;
              await nextTick();

              const map = wrapper.vm.map;
              const layers = map.getLayers().getArray();
              const clusterLayer = layers[0];
              const style = clusterLayer.getStyleFunction()(feature);

              expect(style.getImage().radius).toBe(14);
              expect(style.getText().getText()).toBe("1");
            });
          });
        });

        describe("multiple points", () => {
          it("styles points as a circle", async () => {
            const feature = {
              get: () => ({ length: 2 }),
            };
            const wrapper = factory();
            wrapper.vm.map = new Map();
            wrapper.vm.data = fixtures.twoPointsFeatureCollection;
            await nextTick();

            const map = wrapper.vm.map;
            const layers = map.getLayers().getArray();
            const clusterLayer = layers[0];
            const style = clusterLayer.getStyleFunction()(feature);

            expect(style.getImage().radius).toBe(14);
            expect(style.getText().getText()).toBe("2");
          });
        });
      });
    });
  });
});
