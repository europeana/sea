import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ImageLottiePlayer from "./ImageLottiePlayer.vue";

vi.mock("@lottiefiles/dotlottie-vue", () => ({
  DotLottieVue: { name: "DotLottieVue", template: "<div><slot /></div>" },
}));

const factory = () =>
  shallowMount(ImageLottiePlayer, {
    attachTo: document.body,
    props: {
      src: "https://www.example.org/image.lottie",
    },
  });

describe("components/image/ImageLottiePlayer", () => {
  beforeEach(() => {
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
    };
    window.IntersectionObserverEntry = class {};
  });

  it("renders the Lottie player", () => {
    const wrapper = factory();
    const lottiePlayer = wrapper.find("dot-lottie-vue-stub");
    expect(lottiePlayer.exists()).toBe(true);
  });

  describe("when component intersects viewport", () => {
    it("sets autoplay attribute", async () => {
      const wrapper = factory();
      const lottiePlayer = wrapper.find("dot-lottie-vue-stub");

      expect(wrapper.vm.observer).toBeInstanceOf(IntersectionObserver);
      expect(lottiePlayer.attributes("autoplay")).toBe("false");

      // Simulate the intersection
      const entries = [
        { intersectionRatio: 0.5, target: wrapper.vm.lottiePlayer.$el },
      ];
      wrapper.vm.observer.callback(entries);
      await wrapper.vm.$nextTick();

      expect(lottiePlayer.attributes("autoplay")).toBe("true");
    });
  });

  describe("before component unmounts", () => {
    it("unobserves the lottie player", () => {
      const wrapper = factory();
      const unobserveMock = vi.fn();
      wrapper.vm.observer.unobserve = unobserveMock;

      wrapper.unmount();
      expect(unobserveMock).toHaveBeenCalled();
    });
  });
});
