// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { afterEach, describe, it, expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import Cluster from "ol/source/Cluster.js";
import Map from "ol/Map.js";
import VectorLayer from "ol/layer/Vector.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { useGeographic } from "ol/proj.js";

import { useOpenLayersPointsVectorLayer } from "./openLayersPointsVectorLayer.js";
import { fixtures } from "@test/fixtures.js";

const elementId = "map";
const spreadPinsAllowedMock = vi.fn();
const spreadClusterMock = vi.fn();
const component = {
  template: `<div id="${elementId}" />`,
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
    const spreadPinsAllowed = spreadPinsAllowedMock;
    const spreadCluster = spreadClusterMock;

    useGeographic();
    useOpenLayersPointsVectorLayer({
      data,
      map,
      icon,
      spreadPinsAllowed,
      spreadCluster,
    });

    return { data, map, icon, spreadPinsAllowed, spreadCluster };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersPointsVectorLayer.js", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe("useOpenLayersPointsVectorLayer", () => {
    describe("when there are NO features", () => {
      it("adds NO VectorLayer for clustered points to map", async () => {
        const wrapper = factory();
        wrapper.vm.map = new Map();
        wrapper.vm.data = {};
        await nextTick();

        const map = wrapper.vm.map;
        const layers = map.getLayers().getArray();
        expect(layers).toHaveLength(0);
      });
    });

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
              new Feature({ geometry: new Point([0, 0]) }),
              new Feature({ geometry: new Point([10, 10]) }),
            ]);
            await map.dispatchEvent({
              type: "click",
            });

            expect(fitViewSpy).toHaveBeenCalled();
          });
          describe("when spread pins is allowed and clustered features share the same coordinate", () => {
            it("spreads the clustered pins", async () => {
              const wrapper = factory();
              wrapper.vm.map = new Map();
              wrapper.vm.data = fixtures.multiplePointsFeatureCollection;
              spreadPinsAllowedMock.mockReturnValue(true);
              await nextTick();

              const map = wrapper.vm.map;
              vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
                new Feature({ geometry: new Point([0, 0]) }),
                new Feature({ geometry: new Point([0, 0]) }),
              ]);

              await map.dispatchEvent({
                type: "click",
              });

              expect(spreadClusterMock).toHaveBeenCalled();
            });
          });
        });
        describe("and single point is clicked", () => {
          it("does not zoom or spreads cluster", async () => {
            const wrapper = factory();
            wrapper.vm.map = new Map();
            wrapper.vm.data = fixtures.multiplePointsFeatureCollection;
            await nextTick();

            const map = wrapper.vm.map;
            const fitViewSpy = vi.spyOn(map.getView(), "fit");

            vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
              new Feature({ geometry: new Point([0, 0]) }),
            ]);

            await map.dispatchEvent({
              type: "click",
            });

            expect(fitViewSpy).not.toHaveBeenCalled();
            expect(spreadClusterMock).not.toHaveBeenCalled();
          });
        });
      });

      describe("styling", () => {
        it("calls the supplied style fn");
      });
    });
  });
});
