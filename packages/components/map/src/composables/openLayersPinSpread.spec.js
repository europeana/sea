// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { afterEach, describe, it, expect, vi } from "vitest";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import Style from "ol/style/Style.js";

import { useOpenLayersPinSpread } from "./openLayersPinSpread.js";

const mapMock = {
  addLayer: vi.fn(),
  once: vi.fn(),
  getPixelFromCoordinate: vi.fn(() => [100, 200]),
  getCoordinateFromPixel: vi.fn(() => [10, 20]),
  getView: () => ({
    getZoom: vi.fn(),
  }),
};
const featureOtions = { geometry: new Point([0, 0]) };
const featuresToSpread = [
  new Feature(featureOtions),
  new Feature(featureOtions),
];
const component = {
  template: `<div/>`,

  setup() {
    const map = mapMock;
    const getSingleFeatureStyleMinDimension = vi.fn(() => 24);
    const styleSingleFeature = vi.fn(() => new Style({}));

    const {
      resetSpreadCluster,
      spreadCluster,
      spreadClusterSource,
      spreadPinsAllowed,
    } = useOpenLayersPinSpread({
      getSingleFeatureStyleMinDimension,
      map,
      styleSingleFeature,
    });

    return {
      getSingleFeatureStyleMinDimension,
      map,
      styleSingleFeature,
      resetSpreadCluster,
      spreadCluster,
      spreadClusterSource,
      spreadPinsAllowed,
    };
  },
};

const factory = () => shallowMount(component);

describe("@/composables/openLayersPinSpread.js", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe("useOpenLayersPinSpread", () => {
    describe("spreadCluster", () => {
      describe("when there is no spreadLayer", () => {
        it("creates and adds a new vector layer", () => {
          const wrapper = factory();

          wrapper.vm.spreadCluster(featuresToSpread);

          expect(mapMock.addLayer).toHaveBeenCalledOnce();
        });
      });

      describe("for each feature", () => {
        it("adds a line and a clone of the feature to the spread source; sets expanded prop", () => {
          const wrapper = factory();

          wrapper.vm.spreadCluster(featuresToSpread);
          const spreadSourceFeatures =
            wrapper.vm.spreadClusterSource.getFeatures();

          expect(spreadSourceFeatures).toHaveLength(4);
          expect(spreadSourceFeatures[0].getGeometry()).toBeInstanceOf(
            LineString,
          );
          expect(spreadSourceFeatures[1].getGeometry()).toBeInstanceOf(Point);
          expect(spreadSourceFeatures[2].getGeometry()).toBeInstanceOf(
            LineString,
          );
          expect(spreadSourceFeatures[3].getGeometry()).toBeInstanceOf(Point);
          expect(featuresToSpread[0].get("expanded")).toBe(true);
          expect(featuresToSpread[1].get("expanded")).toBe(true);
        });
      });

      it("starts listening to moveend once", () => {
        const wrapper = factory();

        wrapper.vm.spreadCluster(featuresToSpread);

        expect(mapMock.once).toHaveBeenCalledWith(
          "moveend",
          expect.any(Function),
        );
      });
    });

    describe("on resetSpreadCluster", () => {
      describe("and spread is allowed", () => {
        it("calls spreadCluster", () => {
          mapMock.getView = () => ({
            getZoom: vi.fn(() => 19),
          });

          const wrapper = factory();

          vi.spyOn(wrapper.vm, "spreadCluster");
          wrapper.vm.spreadCluster(featuresToSpread);
          wrapper.vm.resetSpreadCluster(featuresToSpread);

          expect(wrapper.vm.spreadCluster).toHaveBeenCalled();
          expect(wrapper.vm.spreadCluster).toHaveBeenCalledWith(
            featuresToSpread,
          );
        });
      });

      describe("and spread is NOT allowed", () => {
        it("unsets expanded prop for each feature and clears source", () => {
          mapMock.getView = () => ({
            getZoom: vi.fn(() => 18),
          });

          const wrapper = factory();

          wrapper.vm.spreadCluster(featuresToSpread);
          vi.spyOn(wrapper.vm.spreadClusterSource, "clear");
          wrapper.vm.resetSpreadCluster(featuresToSpread);

          expect(featuresToSpread[0].get("expanded")).toBe(undefined);
          expect(featuresToSpread[1].get("expanded")).toBe(undefined);
          expect(wrapper.vm.spreadClusterSource.clear).toHaveBeenCalled();
        });
      });
    });
  });
});
