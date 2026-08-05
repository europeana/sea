// @vitest-environment happy-dom

import { ref, nextTick } from "vue";
import { shallowMount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { useLocationHash } from "./locationHash.js";

const component = {
  template: `<div />`,
  props: {
    centre: {
      type: Array,
      default: null,
    },
    elementId: {
      type: String,
      default: "map",
    },
    zoom: {
      type: Number,
      default: null,
    },
  },
  setup(props) {
    const centre = ref(props.centre);
    const elementId = props.elementId;
    const zoom = ref(props.zoom);

    useLocationHash({ centre, elementId, zoom });

    return { centre, zoom };
  },
};

const factory = ({ props } = {}) =>
  shallowMount(component, {
    props,
  });

describe("@/composables/locationHash.js", () => {
  describe("useLocationHash", () => {
    afterEach(() => {
      window.location.hash = undefined;
    });

    it("reads centre and zoom from window.location.hash", () => {
      window.location.hash = "#em-id=map&em-z=5&em-c=-5%2C36";
      const wrapper = factory();

      const centre = wrapper.vm.centre;
      const zoom = wrapper.vm.zoom;

      expect(centre).toEqual([-5, 36]);
      expect(zoom).toBe(5);
    });

    it("updates hash when centre/zoom change", async () => {
      const centre = [-5, 36];
      const zoom = 5;
      const wrapper = factory();

      wrapper.vm.zoom = zoom;
      wrapper.vm.centre = centre;

      await nextTick();

      expect(window.location.hash).toBe("#em-id=map&em-c=-5%2C36&em-z=5");
    });
  });
});
