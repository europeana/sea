// @vitest-environment happy-dom

import { ref } from "vue";
import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";

import { useOpenLayersFeatureStyles } from "./openLayersFeatureStyles.js";

const coordinates = [9.254419, 50.102223];

const createMapStub = ({ coordinate, pixel, zoom }) => {
  return {
    getPixelFromCoordinate: () => pixel || [10, 10],
    getCoordinateFromPixel: () => coordinate || coordinates,
    getView: () => ({
      getZoom: () => zoom || 4,
    }),
  };
};

const component = {
  template: `<div />`,
  props: {
    icon: {
      type: Object,
      default: null,
    },
    zoom: {
      type: Number,
      default: 4,
    },
  },
  setup(props) {
    const map = ref(createMapStub({ zoom: props.zoom }));

    const icon = props.icon;

    const { styleFeature } = useOpenLayersFeatureStyles({ icon, map });

    return { map, styleFeature };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/openLayersFeatureStyles.spec.js", () => {
  describe("useOpenLayersFeatureStyles", () => {
    describe("styleFeature", () => {
      describe("single feature", () => {
        const feature = new Feature({
          features: [new Feature({ geometry: new Point(coordinates) })],
        });

        describe("when icon is supplied with src", () => {
          const icon = {
            src: "https://example.org/icons/location.svg",
            width: 32,
            height: 32,
          };

          it("styles point as an icon using that image", () => {
            const wrapper = factory({ props: { icon } });

            const styleFeature = wrapper.vm.styleFeature;
            const style = styleFeature(feature);

            expect(style.getImage().getSrc()).toBe(icon.src);
            expect(style.getText()).toBeNull();
          });
        });

        describe("when icon is not supplied", () => {
          it("styles point as a circle", () => {
            const wrapper = factory();

            const styleFeature = wrapper.vm.styleFeature;
            const style = styleFeature(feature);

            expect(style.getImage().radius).toBe(12);
            expect(style.getText().getText()).toBe("1");
          });
        });
      });

      describe("multiple features", () => {
        const feature = new Feature({
          features: [
            new Feature({ geometry: new Point(coordinates) }),
            new Feature({ geometry: new Point(coordinates) }),
          ],
        });

        describe("at zoom levels below 19", () => {
          const zoom = 18;

          it("styles features clustered as a circle with number in text", () => {
            const wrapper = factory({ props: { zoom } });

            const styleFeature = wrapper.vm.styleFeature;
            const style = styleFeature(feature);

            expect(style.getImage().radius).toBe(12);
            expect(style.getText().getText()).toBe("2");
          });
        });

        describe("at zoom levels 19 and over and expanded", () => {
          const zoom = 19;

          it("styles original cluster features as a dot", async () => {
            const wrapper = factory({ props: { zoom } });

            const expandedFeature = new Feature({
              features: [
                new Feature({
                  geometry: new Point(coordinates),
                  expanded: true,
                }),
                new Feature({
                  geometry: new Point(coordinates),
                  expanded: true,
                }),
              ],
            });
            const styleFeature = wrapper.vm.styleFeature;
            const style = styleFeature(expandedFeature);

            expect(style.getImage().constructor.name).toBe("CircleStyle");
          });
        });
      });
    });
  });
});
