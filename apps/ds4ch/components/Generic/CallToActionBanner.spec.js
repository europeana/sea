import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import CallToActionBanner from "./CallToActionBanner.vue";

describe("components/Landing/CallToActionBanner", () => {
  describe("when background profile is set to default", () => {
    it("uses the secondary button variant", () => {
      const wrapper = shallowMount(CallToActionBanner, {
        props: {
          backgroundImage: {
            profile: { background: "default" },
          },
        },
      });

      expect(wrapper.vm.buttonClass).toContain("btn-secondary");
    });
  });
  describe("when background profile is set to highlight", () => {
    it("uses the primary button variant", () => {
      const wrapper = shallowMount(CallToActionBanner, {
        props: {
          backgroundImage: {
            profile: { background: "highlight" },
          },
        },
      });

      expect(wrapper.vm.buttonClass).toContain("btn-primary");
    });
  });
  describe("when background profile is set to alternate", () => {
    it("uses the primary button variant", () => {
      const wrapper = shallowMount(CallToActionBanner, {
        props: {
          backgroundImage: {
            profile: { background: "alternate" },
          },
        },
      });

      expect(wrapper.vm.buttonClass).toContain("btn-primary");
    });
  });
});
