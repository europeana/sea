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
    styleLabels: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const map = props.map;
    const controls = props.controls;
    const styleLabels = props.styleLabels;

    useOpenLayersControls({ map, controls, styleLabels });
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

    describe("styleLabels option", () => {
      const styleLabels = {
        "font-size": "0",
      };

      describe.each([
        ["string", (string) => string],
        ["Text", (string) => document.createTextNode(string)],
        [
          "HTMLElement",
          (string) => {
            const element = document.createElement("span");
            element.appendChild(document.createTextNode(string));
            return element;
          },
        ],
      ])("with %s labels", async (argType, labelOptionGenerator) => {
        const controls = {
          fullscreen: {
            label: labelOptionGenerator("fullscreen label"),
            labelActive: labelOptionGenerator("fullscreen label active"),
            tipLabel: "fullscreen tip label",
          },
          zoom: {
            zoomInLabel: labelOptionGenerator("zoom in label"),
            zoomOutLabel: labelOptionGenerator("zoom out label"),
            zoomInTipLabel: "zoom in tip label",
            zoomOutTipLabel: "zoom out tip label",
          },
          attribution: {
            label: labelOptionGenerator("attribution label"),
            collapseLabel: labelOptionGenerator("attribution collapse label"),
            tipLabel: "attribution tip label",
          },
        };

        it("applies style properties to each label option as a span element", () => {
          const wrapper = factory({
            props: {
              map: new Map({ controls: [] }),
              controls,
              styleLabels,
            },
          });

          const zoomControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[0]
            .element.getHTML();
          const fullscreenControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[1]
            .element.getHTML();
          const attributionControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[2]
            .element.getHTML();

          expect(
            zoomControlHTML.includes(
              '<span style="font-size: 0px;">zoom in label</span>',
            ),
          ).toBe(true);
          expect(
            zoomControlHTML.includes(
              '<span style="font-size: 0px;">zoom out label</span>',
            ),
          ).toBe(true);

          expect(
            fullscreenControlHTML.includes(
              '<span style="font-size: 0px;">fullscreen label</span>',
            ),
          ).toBe(true);

          expect(
            attributionControlHTML.includes(
              '<span style="font-size: 0px;">attribution label</span>',
            ),
          ).toBe(true);
        });

        it("does not apply style properties to tip label options", () => {
          const wrapper = factory({
            props: {
              map: new Map({ controls: [] }),
              controls,
              styleLabels,
            },
          });

          const zoomControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[0]
            .element.getHTML();
          const fullscreenControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[1]
            .element.getHTML();
          const attributionControlHTML = wrapper.vm.map
            .getControls()
            .getArray()[2]
            .element.getHTML();

          expect(zoomControlHTML.includes('title="zoom in tip label"')).toBe(
            true,
          );
          expect(zoomControlHTML.includes('title="zoom out tip label"')).toBe(
            true,
          );

          expect(
            fullscreenControlHTML.includes('title="fullscreen tip label"'),
          ).toBe(true);

          expect(
            attributionControlHTML.includes('title="attribution tip label"'),
          ).toBe(true);
        });
      });
    });
  });
});
