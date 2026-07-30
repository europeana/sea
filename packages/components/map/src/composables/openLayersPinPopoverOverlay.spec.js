// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { computed } from "vue";

import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import { useGeographic } from "ol/proj.js";

import { useOpenLayersPinPopoverOverlay } from "./openLayersPinPopoverOverlay.js";

const elementId = "map";
const component = {
  template: `<div id="${elementId}" /><div id="popover"/>`,
  props: {
    map: {
      type: Object,
      default: null,
    },
    pinPopover: {
      type: [Object, String],
      default: null,
    },
  },
  setup(props) {
    const map = props.map;
    const pinPopover = computed(() => props.pinPopover);

    useGeographic();
    useOpenLayersPinPopoverOverlay({ map, pinPopover });

    return { map, pinPopover };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersPinPopoverOverlay.js", () => {
  describe("useOpenLayersPinPopoverOverlay", () => {
    describe("when map value become present", () => {
      describe("and popover element is present", () => {
        it("adds Overlay for popover content", async () => {
          const wrapper = factory({
            props: {
              map: new Map(),
              pinPopover: "popover",
            },
          });

          const map = wrapper.vm.map;
          const overlays = map.getOverlays().getArray();
          expect(overlays).toHaveLength(1);
          expect(overlays[0]).toBeInstanceOf(Overlay);
        });

        // FIXME
        // describe("and a point is clicked", () => {
        //   it("dispatches change:activefeature event and sets overlay position", async () => {
        //     const wrapper = factory({
        //       props: {
        //         map: new Map(),
        //         pinPopover: "popover",
        //       },
        //     });

        //     const map = wrapper.vm.map;
        //     const dispatchEventSpy = vi.spyOn(map, "dispatchEvent");
        //     const name = "feature name";

        //     vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
        //       {
        //         get: () => [
        //           {
        //             getGeometry: () => ({
        //               getCoordinates: () => [0, 0],
        //             }),
        //             get: () => name,
        //           },
        //         ],
        //       },
        //     ]);

        //     const overlay = map.getOverlays().getArray()[0];
        //     const setPositionSpy = vi.spyOn(overlay, "setPosition");

        //     await map.dispatchEvent({
        //       type: "click",
        //     });

        //     expect(dispatchEventSpy).toHaveBeenCalledWith({
        //       type: "change:activefeature",
        //       activeFeatureName: name,
        //     });
        //     expect(setPositionSpy).toHaveBeenCalled();
        //   });
        // });
      });
    });
  });
});
