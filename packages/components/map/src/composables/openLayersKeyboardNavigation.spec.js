// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Point from "ol/geom/Point.js";

import { useOpenLayersKeyboardNavigation } from "./openLayersKeyboardNavigation.js";

const getViewMock = {
  on: vi.fn(),
  calculateExtent: vi.fn(() => [0, 0, 100, 100]),
  un: vi.fn(),
};
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
  getView: () => getViewMock,
  removeLayer: vi.fn(),
  un: vi.fn(),
};

const featureMock = {
  get: vi.fn(),
  getGeometry: () => new Point([10, 10]),
};

const featureClusterMock = {
  get: vi.fn(() => [featureMock, featureMock]),
  getGeometry: () => ({
    getCoordinates: vi.fn(() => [10, 20]),
  }),
};
const sourceMock = {
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
    source: {
      type: Object,
      default: null,
    },
    spreadClusterSource: {
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
    const spreadClusterSource = props.spreadClusterSource;
    const source = props.source;
    const pinSrLabel = props.pinSrLabel;
    const navigatePinsButtonId = props.navigatePinsButtonId;
    const announcerId = props.announcerId;

    const {
      sourceRef,
      focusSource,
      focusedFeatureIndex,
      clearFocusFeature,
      setFocus,
      getCurrentlyVisibleFeatures,
      setCurrentlyVisibleFeatures,
      handleFocusOnKeyDown,
      initLayerAndListeners,
    } = useOpenLayersKeyboardNavigation({
      map,
      spreadClusterSource,
      source,
      pinSrLabel,
      navigatePinsButtonId,
      announcerId,
    });

    return {
      map,
      source,
      pinSrLabel,
      navigatePinsButtonId,
      announcerId,
      sourceRef,
      focusSource,
      focusedFeatureIndex,
      clearFocusFeature,
      setFocus,
      getCurrentlyVisibleFeatures,
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
    document.body.innerHTML = `
    <button id="${keyboardNavButtonId}"></button>
    <span id="${announcerId}"></span>
  `;
  });
  describe("useOpenLayersKeyboardNavigation", () => {
    it("adds a navigate pins control", async () => {
      const wrapper = factory({
        props: {
          map: mapMock,
          navigatePinsButtonId: keyboardNavButtonId,
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.map.addControl).toHaveBeenCalledOnce();
    });

    describe("When navigate pins button loses focus", () => {
      it("removes layer and listeners", () => {
        const wrapper = factory({
          props: {
            map: mapMock,
            navigatePinsButtonId: keyboardNavButtonId,
          },
        });

        document
          .getElementById(keyboardNavButtonId)
          .dispatchEvent(new Event("blur"));

        expect(mapMock.removeLayer).toHaveBeenCalled();
        expect(mapMock.un).toHaveBeenCalledWith(
          "pointerdown",
          wrapper.vm.clearFocusFeature,
        );
        expect(getViewMock.un).toHaveBeenCalledWith(
          "change:resolution",
          wrapper.vm.clearFocusFeature,
        );
        expect(mapMock.un).toHaveBeenCalledWith(
          "rendercomplete",
          wrapper.vm.setCurrentlyVisibleFeatures,
        );
      });
    });

    describe("handleFocusOnKeyDown", () => {
      describe("when right or down arrow key is pressed", () => {
        it("moves focus to the next pin", async () => {
          const wrapper = factory({
            props: {
              map: mapMock,
              source: sourceMock,
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
              source: sourceMock,
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
                source: sourceMock,
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
      describe("when index is more than -1 and less than total visible features length", () => {
        it("sets announcer message and focus feature", async () => {
          const wrapper = factory({
            props: {
              map: mapMock,
              source: sourceMock,
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
      describe("when index is -1", () => {
        it("does NOT set announcer message NOR focus feature", async () => {
          const wrapper = factory({
            props: {
              map: mapMock,
              source: sourceMock,
              announcerId,
              pinSrLabel,
            },
          });
          vi.spyOn(wrapper.vm.focusSource, "clear");
          vi.spyOn(wrapper.vm.focusSource, "addFeature");
          wrapper.vm.setCurrentlyVisibleFeatures();

          wrapper.vm.setFocus(-1);

          expect(document.getElementById(announcerId).innerHTML).toBe("");
          expect(wrapper.vm.focusSource.clear).not.toHaveBeenCalled();
          expect(wrapper.vm.focusSource.addFeature).not.toHaveBeenCalled();

          wrapper.vm.setFocus(10);
          expect(document.getElementById(announcerId).innerHTML).toBe("");
          expect(wrapper.vm.focusSource.clear).not.toHaveBeenCalled();
          expect(wrapper.vm.focusSource.addFeature).not.toHaveBeenCalled();
        });
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
            wrapper.vm.sourceRef = sourceMock;

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
                spreadClusterSource: spreadClusterSourceMock,
              },
            });
            wrapper.vm.initLayerAndListeners();

            expect(mapMock.on).toHaveBeenCalledWith(
              "rendercomplete",
              wrapper.vm.setCurrentlyVisibleFeatures,
            );
          });
        });
      });
    });

    describe("when spread cluster source exists", () => {
      it("adds visible spread features to the visible features", () => {
        const wrapper = factory({
          props: {
            map: mapMock,
            spreadClusterSource: spreadClusterSourceMock,
          },
        });

        wrapper.vm.spreadClusterSourceRef = spreadClusterSourceMock;
        const visibleFeatures = wrapper.vm.getCurrentlyVisibleFeatures();

        expect(visibleFeatures).toEqual([featureMock, featureMock]);
      });
    });
  });
});
