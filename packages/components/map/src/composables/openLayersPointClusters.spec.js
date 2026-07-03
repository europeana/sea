// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
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
    icon: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const data = ref(null);
    const map = ref(null);
    const icon = props.icon;

    useGeographic();
    useOpenLayersPointClusters({ data, map, icon });

    return { data, map, icon };
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

      describe("styling", () => {
        it("calls the supplied style fn");
      });
    });
  });
});
