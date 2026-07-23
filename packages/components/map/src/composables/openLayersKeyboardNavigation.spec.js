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
  getGeometry: () => ({
    intersectsExtent: vi.fn(() => true),
    getCoordinates: vi.fn(() => [10, 20]),
  }),
};
const clusterOrPinSourceMock = {
  getFeatures: vi.fn(() => [featureMock, featureMock, featureMock]),
};

const elementId = "map";
const keyboardNavButtonId = "map-keyboard-focus-pin-toggle";
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
      handleFocusOnKeyDown,
      clearFocusFeature,
      setCurrentlyVisibleFeatures,
      focusedFeatureIndex,
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
      handleFocusOnKeyDown,
      clearFocusFeature,
      setCurrentlyVisibleFeatures,
      focusedFeatureIndex,
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
    });
  });
});
