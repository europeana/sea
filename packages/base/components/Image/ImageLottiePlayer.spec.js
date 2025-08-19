import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import ImageLottiePlayer from "./ImageLottiePlayer.vue";

const removeEventSpy = vi.fn();
const addEventSpy = vi.fn();
const playSpy = vi.fn();

const lottieInstance = {
  play: playSpy,
  removeEventListener: removeEventSpy,
  addEventListener: addEventSpy,
};

vi.mock("@lottiefiles/dotlottie-vue", () => ({
  DotLottieVue: {
    name: "DotLottieVue",
    template: "<div id='lotti-vue' :src='src'><slot /></div>",
    methods: {
      getDotLottieInstance: () => lottieInstance,
    },
  },
}));

const factory = () =>
  mount(ImageLottiePlayer, {
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
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the Lottie player", () => {
    const wrapper = factory();
    const lottiePlayer = wrapper.find("#lotti-vue");
    expect(lottiePlayer.exists()).toBe(true);
  });

  it("uses the src prop for the lottie src", () => {
    const wrapper = factory();
    const lottiePlayer = wrapper.find("#lotti-vue");
    expect(lottiePlayer.attributes("src")).toBe(
      "https://www.example.org/image.lottie",
    );
  });

  describe("when component scrolls to intersect viewport", () => {
    describe("when the animation hasn't played yet", () => {
      it("triggers a play call", () => {
        const wrapper = factory();

        expect(wrapper.vm.observer).toBeInstanceOf(IntersectionObserver);

        // Simulate the intersection
        const entries = [
          { intersectionRatio: 0.5, target: wrapper.vm.lottiePlayer.$el },
        ];
        wrapper.vm.observer.callback(entries);

        expect(lottieInstance.play).toHaveBeenCalled();
      });
    });
    describe("when the animation has been played already", () => {
      it("does not re-trigger a play call", () => {
        const wrapper = factory();
        wrapper.vm.played = true;
        expect(wrapper.vm.observer).toBeInstanceOf(IntersectionObserver);

        // Simulate the intersection
        const entries = [
          { intersectionRatio: 0.5, target: wrapper.vm.lottiePlayer.$el },
        ];
        wrapper.vm.observer.callback(entries);

        expect(lottieInstance.play).toHaveBeenCalledTimes(0);
      });
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
