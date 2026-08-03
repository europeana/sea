// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOpenLayersKeyboardNavigation } from "./openLayersKeyboardNavigation.js";

const mapMock = {
  addControl: vi.fn(),
  addLayer: vi.fn(),
  on: vi.fn(),
  dispatchEvent: vi.fn(),
  getPixelFromCoordinate: vi.fn(() => [10, 20]),
  getSize: vi.fn(() => [100, 100]),
  getControls: () => ({
    getArray: () => [],
  }),
  getView: () => ({
    on: vi.fn(),
    calculateExtent: vi.fn(() => [0, 0, 100, 100]),
  }),
};

const featureMock = {
  get: vi.fn(),
  getGeometry: () => ({
    getCoordinates: vi.fn(() => [10, 20]),
  }),
};

const featureClusterMock = {
  get: vi.fn(() => [featureMock, featureMock]),
  getGeometry: () => ({
    getCoordinates: vi.fn(() => [10, 20]),
  }),
};
const clusterOrPinSourceMock = {
  getFeatures: vi.fn(() => [featureClusterMock, featureMock, featureMock]),
  getFeaturesInExtent: vi.fn(() => [featureClusterMock, featureMock]),
};

const spreadClusterSourceMock = {
  getFeaturesInExtent: vi.fn(() => [featureMock, featureMock]),
};
const elementId = "map";
const keyboardNavButtonId = "map-keyboard-focus-pin-toggle";
const announcerId = "announcer";
const pinSrLabel = {
  single: "Toggle pin",
  multiple: "Zoom in to cluster",
};
const component = {
  template: `<div id="${elementId}"></div>`,
  props: {
    map: {
      type: Object,
      default: null,
    },
    clusterOrPinSource: {
      type: Object,
      default: null,
    },
    navigatePinsButtonId: {
      type: String,
      default: null,
    },
    announcerId: {
      type: String,
      default: null,
    },
    pinSrLabel: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const map = props.map;
    const clusterOrPinSource = props.clusterOrPinSource;
    const pinSrLabel = props.pinSrLabel;
    const navigatePinsButtonId = props.navigatePinsButtonId;
    const announcerId = props.announcerId;

    const {
      clusterOrPinSourceRef,
      focusSource,
      focusedFeatureIndex,
      clearFocusFeature,
      setFocus,
      setCurrentlyVisibleFeatures,
      handleFocusOnKeyDown,
      initLayerAndListeners,
    } = useOpenLayersKeyboardNavigation({
      map,
      clusterOrPinSource,
      pinSrLabel,
      navigatePinsButtonId,
      announcerId,
    });

    return {
      map,
      clusterOrPinSource,
      pinSrLabel,
      navigatePinsButtonId,
      announcerId,
      clusterOrPinSourceRef,
      focusSource,
      focusedFeatureIndex,
      clearFocusFeature,
      setFocus,
      setCurrentlyVisibleFeatures,
      handleFocusOnKeyDown,
      initLayerAndListeners,
    };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersKeyboardNavigation.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("useOpenLayersKeyboardNavigation", () => {
    it("adds a navigate pins control", async () => {
      document.body.innerHTML = `
    <button id="${keyboardNavButtonId}"></button>
  `;
      const wrapper = factory({
        props: {
          map: mapMock,
          navigatePinsButtonId: keyboardNavButtonId,
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.map.addControl).toHaveBeenCalledOnce();
    });

    describe("handleFocusOnKeyDown", () => {
      describe("when right or down arrow key is pressed", () => {
        it("moves focus to the next pin", async () => {
          const wrapper = factory({
            props: {
              map: mapMock,
              clusterOrPinSource: clusterOrPinSourceMock,
              navigatePinsButtonId: keyboardNavButtonId,
            },
          });

          wrapper.vm.setCurrentlyVisibleFeatures();
          wrapper.vm.handleFocusOnKeyDown({ key: "ArrowRight" });
          expect(wrapper.vm.focusedFeatureIndex).toBe(0);
          wrapper.vm.handleFocusOnKeyDown({ key: "ArrowDown" });
          expect(wrapper.vm.focusedFeatureIndex).toBe(1);
        });
      });
      describe("when left or up arrow key is pressed", () => {
        it("moves focus to the previous pin", async () => {
          const wrapper = factory({
            props: {
              map: mapMock,
              clusterOrPinSource: clusterOrPinSourceMock,
              navigatePinsButtonId: keyboardNavButtonId,
            },
          });

          wrapper.vm.focusedFeatureIndex = 2;
          wrapper.vm.setCurrentlyVisibleFeatures();
          wrapper.vm.handleFocusOnKeyDown({ key: "ArrowLeft" });
          expect(wrapper.vm.focusedFeatureIndex).toBe(1);
          wrapper.vm.handleFocusOnKeyDown({ key: "ArrowUp" });
          expect(wrapper.vm.focusedFeatureIndex).toBe(0);
        });
      });
      describe("when Enter or spacebar key is pressed", () => {
        describe("and there is a focused feature", () => {
          it("dispatches a click event", async () => {
            const wrapper = factory({
              props: {
                map: mapMock,
                clusterOrPinSource: clusterOrPinSourceMock,
                navigatePinsButtonId: keyboardNavButtonId,
              },
            });

            wrapper.vm.focusedFeatureIndex = 0;
            wrapper.vm.setCurrentlyVisibleFeatures();
            wrapper.vm.handleFocusOnKeyDown({ key: "Enter" });

            expect(mapMock.dispatchEvent).toHaveBeenCalledWith({
              type: "click",
              pixel: [10, 20],
            });
            expect(mapMock.dispatchEvent).toHaveBeenCalledOnce();
            wrapper.vm.handleFocusOnKeyDown({ key: " " });
            expect(mapMock.dispatchEvent).toHaveBeenCalledTimes(2);
          });
        });
      });
    });

    describe("clearFocusFeature", () => {
      it("clears focus and removes announcer content", async () => {
        document.body.innerHTML = `
    <span id="${announcerId}">message</span>
  `;
        const wrapper = factory({
          props: {
            map: mapMock,
            announcerId,
          },
        });
        vi.spyOn(wrapper.vm.focusSource, "clear");
        wrapper.vm.focusedFeatureIndex = 3;
        wrapper.vm.clearFocusFeature();

        expect(wrapper.vm.focusSource.clear).toHaveBeenCalled();
        expect(wrapper.vm.focusedFeatureIndex).toBe(-1);
        expect(document.getElementById(announcerId).innerHTML).toBe("");
      });
    });

    describe("setFocus", () => {
      it("sets announcer message and focus feature", async () => {
        document.body.innerHTML = `
    <span id="${announcerId}"></span>
  `;
        const wrapper = factory({
          props: {
            map: mapMock,
            clusterOrPinSource: clusterOrPinSourceMock,
            announcerId,
            pinSrLabel,
          },
        });
        vi.spyOn(wrapper.vm.focusSource, "clear");
        vi.spyOn(wrapper.vm.focusSource, "addFeature");
        wrapper.vm.setCurrentlyVisibleFeatures();

        wrapper.vm.setFocus(0);

        expect(document.getElementById(announcerId).innerHTML).toBe(
          `${pinSrLabel.multiple} 2`,
        );
        expect(wrapper.vm.focusSource.clear).toHaveBeenCalled();
        expect(wrapper.vm.focusSource.addFeature).toHaveBeenCalled();
        wrapper.vm.setFocus(1);

        expect(document.getElementById(announcerId).innerHTML).toBe(
          pinSrLabel.single,
        );
      });
    });

    describe("Layers and listeners are initialised", () => {
      describe("on render complete", () => {
        describe("and cluster or pin source exists", () => {
          it("starts listening to rendercomplete", () => {
            const wrapper = factory({
              props: {
                map: mapMock,
              },
            });
            wrapper.vm.initLayerAndListeners();
            wrapper.vm.clusterOrPinSourceRef = clusterOrPinSourceMock;

            expect(mapMock.on).toHaveBeenCalledWith(
              "rendercomplete",
              wrapper.vm.setCurrentlyVisibleFeatures,
            );
          });
        });
        describe("and spread cluster source exists", () => {
          it("starts listening to rendercomplete", () => {
            const wrapper = factory({
              props: {
                map: mapMock,
              },
            });
            wrapper.vm.initLayerAndListeners();
            wrapper.vm.spreadClusterSourceRef = spreadClusterSourceMock;

            expect(mapMock.on).toHaveBeenCalledWith(
              "rendercomplete",
              wrapper.vm.setCurrentlyVisibleFeatures,
            );
          });
        });
      });
    });
  });
});
