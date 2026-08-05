// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { computed } from "vue";

import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import { useGeographic } from "ol/proj.js";

import { useOpenLayersPinPopoverOverlay } from "./openLayersPinPopoverOverlay.js";

const coordinates = [0, 0];
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

        describe("and popover element is HTML element", () => {
          it("adds Overlay for popover content", async () => {
            const popoverElement = document.createElement("div");
            const wrapper = factory({
              props: {
                map: new Map(),
                pinPopover: popoverElement,
              },
            });

            const map = wrapper.vm.map;
            const overlays = map.getOverlays().getArray();
            expect(overlays).toHaveLength(1);
            expect(overlays[0]).toBeInstanceOf(Overlay);
          });
        });

        describe("and a point is clicked", () => {
          describe("and feature has a name", () => {
            it("dispatches change:activefeature event and sets overlay position", async () => {
              const wrapper = factory({
                props: {
                  map: new Map(),
                  pinPopover: "popover",
                },
              });

              const map = wrapper.vm.map;
              const dispatchEventSpy = vi.spyOn(map, "dispatchEvent");
              const name = "feature name";
              vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
                new Feature({ geometry: new Point(coordinates), name }),
              ]);
              const overlay = map.getOverlays().getArray()[0];
              const setPositionSpy = vi.spyOn(overlay, "setPosition");

              await map.dispatchEvent({
                type: "click",
              });

              expect(dispatchEventSpy).toHaveBeenCalledTimes(2); // Once for the click trigger above and second for the actual code to test
              expect(dispatchEventSpy).toHaveBeenCalledWith({
                type: "change:activefeature",
                activeFeatureName: name,
              });
              expect(setPositionSpy).toHaveBeenCalled();
            });
          });

          describe("and feature has NO name", () => {
            it("does NOT dispatch change:activefeature event, but sets overlay position", async () => {
              const wrapper = factory({
                props: {
                  map: new Map(),
                  pinPopover: "popover",
                },
              });

              const map = wrapper.vm.map;
              const dispatchEventSpy = vi.spyOn(map, "dispatchEvent");

              vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([
                new Feature({ geometry: new Point(coordinates) }),
              ]);
              const overlay = map.getOverlays().getArray()[0];
              const setPositionSpy = vi.spyOn(overlay, "setPosition");

              await map.dispatchEvent({
                type: "click",
              });

              expect(dispatchEventSpy).toHaveBeenCalledTimes(1); // Once for the click trigger above
              expect(dispatchEventSpy).not.toHaveBeenCalledWith({
                type: "change:activefeature",
                activeFeatureName: name,
              });
              expect(setPositionSpy).toHaveBeenCalled();
            });
          });
        });

        describe("and NO point is clicked", () => {
          it("hides popover by setting overlay position to undefined", async () => {
            const wrapper = factory({
              props: {
                map: new Map(),
                pinPopover: "popover",
              },
            });

            const map = wrapper.vm.map;
            vi.spyOn(map, "getFeaturesAtPixel").mockReturnValue([]);
            const overlay = map.getOverlays().getArray()[0];
            const setPositionSpy = vi.spyOn(overlay, "setPosition");

            await map.dispatchEvent({
              type: "click",
            });

            expect(setPositionSpy).toHaveBeenCalledWith(undefined);
          });
        });
      });
    });
  });
});
