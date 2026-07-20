// @vitest-environment happy-dom

import { shallowMount } from "@vue/test-utils";
import { describe, expect, test, it, vi } from "vitest";
import Map from "ol/Map.js";

import { useOpenLayersControls } from "./openLayersControls.js";

const elementId = "map";
const component = {
  template: `<div id="${elementId}" />`,
  props: {
    map: {
      type: Object,
      default: null,
    },
    controls: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const map = props.map;
    const controls = props.controls;

    useOpenLayersControls({ map, controls });
    return { map, controls };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersControls.js", () => {
  describe("useOpenLayersControls", () => {
    describe("when fullscreen and zoom controls are enabled", () => {
      test.each([
        ["zoom", "Zoom"],
        ["attribution", "Attribution"],
        ["full-screen", "FullScreen"],
      ])("has %s control", async (name, className) => {
        const wrapper = factory({
          props: {
            map: new Map({ controls: [] }),
            controls: { fullscreen: {}, zoom: {} },
          },
        });

        const controls = wrapper.vm.map.getControls().getArray();
        const controlExists = controls.some(
          (control) => control.constructor.name === className,
        );

        expect(controlExists).toBe(true);
      });
    });

    describe("when fullscreen and zoom controls are NOT enabled", () => {
      it("only adds attribution control", () => {
        const wrapper = factory({
          props: {
            map: new Map({ controls: [] }),
          },
        });

        const controls = wrapper.vm.map.getControls().getArray();
        const controlExists = (className) =>
          controls.some((control) => control.constructor.name === className);

        expect(controlExists("Attribution")).toBe(true);
        expect(controlExists("Zoom")).toBe(false);
        expect(controlExists("Fullscreen")).toBe(false);
      });
    });

    describe("when zoom controls are enabled", () => {
      it("disables button when at zoom limit", () => {
        const zoomIn = document.createElement("button");
        zoomIn.classList.add("ol-zoom-in");
        document.body.appendChild(zoomIn);

        const zoomOut = document.createElement("button");
        zoomOut.classList.add("ol-zoom-out");
        document.body.appendChild(zoomOut);

        const map = new Map({ controls: [] });
        const view = map.getView();
        view.getMaxZoom = vi.fn(() => 20);
        view.getMinZoom = vi.fn(() => 1);
        view.getZoom = vi.fn(() => 1.5);
        view.getZoomForResolution = vi.fn(() => 1);

        factory({
          props: {
            map,
            controls: { zoom: {} },
          },
        });

        expect(zoomOut.getAttribute("disabled")).toBe("true");
        expect(zoomIn.getAttribute("disabled")).toBeNull();

        view.getZoom = vi.fn(() => 20);
        view.dispatchEvent("change:resolution");

        expect(zoomIn.getAttribute("disabled")).toBe("true");
        expect(zoomOut.getAttribute("disabled")).toBeNull();
      });
    });
  });
});
