import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import useClickOutside from "./clickOutside";

const isActive = ref(false);
const onOutsideClick = vi.fn();

const component = {
  template: `<div class="outside"><div ref="dropdown"><div class="inside" /></div></div>`,
  setup() {
    const dropdown = useTemplateRef("dropdown");
    useClickOutside(dropdown, isActive, onOutsideClick);
  },
};

describe("useClickOutside", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isActive.value = false;
  });

  it("adds event listeners when activated", async () => {
    shallowMount(component);

    vi.spyOn(window, "addEventListener");

    isActive.value = true;
    await nextTick();

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

  it("removes event listeners when deactivated", async () => {
    shallowMount(component);
    vi.spyOn(window, "removeEventListener");

    isActive.value = true;
    await nextTick();
    isActive.value = false;
    await nextTick();

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

  it("calls callback when clicking outside", async () => {
    const wrapper = shallowMount(component, { attachTo: document.body });

    isActive.value = true;
    await nextTick();

    wrapper.find(".outside").trigger("click");

    expect(onOutsideClick).toHaveBeenCalled();
  });

  it("does not call callback when clicking inside", async () => {
    const onOutsideClick = vi.fn();

    const wrapper = shallowMount(component, { attachTo: document.body });

    isActive.value = true;
    await nextTick();

    wrapper.find(".inside").trigger("click");

    expect(onOutsideClick).not.toHaveBeenCalled();
  });
});
