import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import useClickOutside from "./clickOutside";

const component = {
  template: `<div class="outside"><div ref="dropdown"><div class="inside" /></div></div>`,
};

describe("useClickOutside", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("enable", () => {
    it("adds event listeners", () => {
      const wrapper = shallowMount(component);
      const { enable } = useClickOutside(ref(wrapper.vm.$refs.dropdown));

      vi.spyOn(window, "addEventListener");
      enable();

      expect(window.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        "dblclick",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        "focusin",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function),
        {
          capture: true,
        },
      );
    });
  });

  describe("disable", () => {
    it("removes event listeners", () => {
      const wrapper = shallowMount(component);
      const { disable } = useClickOutside(ref(wrapper.vm.$refs.dropdown));
      vi.spyOn(window, "removeEventListener");

      disable();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        "dblclick",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        "focusin",
        expect.any(Function),
        {
          capture: true,
        },
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        "touchstart",
        expect.any(Function),
        {
          capture: true,
        },
      );
    });
  });

  describe("when clicking outside", () => {
    it("sets clickedOutside to true", async () => {
      const wrapper = shallowMount(component, { attachTo: document.body });
      const { clickedOutside, enable } = useClickOutside(
        ref(wrapper.vm.$refs.dropdown),
      );

      enable();
      await nextTick();

      wrapper.find(".outside").trigger("click");

      expect(clickedOutside.value).toEqual(true);
    });
  });

  describe("when clicking inside", () => {
    it("sets clickedOutside to false", async () => {
      const wrapper = shallowMount(component, { attachTo: document.body });
      const { clickedOutside, enable } = useClickOutside(
        ref(wrapper.vm.$refs.dropdown),
      );

      enable();
      await nextTick();

      wrapper.find(".inside").trigger("click");

      expect(clickedOutside.value).toEqual(false);
    });
  });
});
