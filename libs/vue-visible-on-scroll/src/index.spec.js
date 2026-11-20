// @vitest-environment happy-dom

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VisibleOnScrollDirective from "./index.js";

const component = {
  template: '<div><p v-visible-on-scroll="binding">Test</p></div>',
  directives: {
    "visible-on-scroll": VisibleOnScrollDirective,
  },
  props: ["binding"],
};

const bindingProps = (routeHash = null, desktopBreakpoint = 992) => ({
  props: {
    binding: {
      routeHash,
      desktopBreakpoint,
    },
  },
});

describe("vue-visible-on-scroll directive", () => {
  describe("when on desktop", () => {
    it("sets initial transform style and 'show' class", () => {
      window.innerWidth = 1200;
      const wrapper = mount(component, bindingProps());

      const visibleOnScrollElement = wrapper.find("p");

      expect(visibleOnScrollElement.attributes("style")).toBe(
        "transform: translate3d(0, 0, 0);",
      );
      expect(visibleOnScrollElement.classes()).toContain("show");
    });

    describe("and no route hash", () => {
      it("sets scrollVisible to true", () => {
        const wrapper = mount(component, bindingProps());

        const visibleOnScrollElement = wrapper.find("p");

        expect(visibleOnScrollElement.element.scrolledVisible).toBe(true);
      });
    });

    describe("and route hash", () => {
      it("sets scrollVisible to false", () => {
        const wrapper = mount(component, bindingProps("#example"));

        const visibleOnScrollElement = wrapper.find("p");

        expect(visibleOnScrollElement.element.scrolledVisible).toBe(false);
      });
    });

    describe("scrolling down past threshold an up again", () => {
      it("hides and shows the element again", () => {
        const wrapper = mount(component, bindingProps());

        const visibleOnScrollElement = wrapper.find("p");

        visibleOnScrollElement.element.scrollPosition = 200;
        window.scrollY = 300;
        window.dispatchEvent(new Event("scroll"));

        expect(visibleOnScrollElement.attributes("style")).toBe(
          "transform: translate3d(0, -100%, 0);",
        );
        expect(visibleOnScrollElement.classes()).not.toContain("show");
        expect(visibleOnScrollElement.element.scrolledVisible).toBe(false);

        window.scrollY = 100;
        window.dispatchEvent(new Event("scroll"));
        expect(visibleOnScrollElement.attributes("style")).toBe(
          "transform: translate3d(0, 0, 0);",
        );
        expect(visibleOnScrollElement.classes()).toContain("show");
        expect(visibleOnScrollElement.element.scrolledVisible).toBe(true);
      });
    });

    describe("scrolling down before threshold", () => {
      it("does not hide the element", () => {
        const wrapper = mount(component, bindingProps());

        const visibleOnScrollElement = wrapper.find("p");

        visibleOnScrollElement.element.scrollPosition = 150;
        window.scrollY = 300;
        window.dispatchEvent(new Event("scroll"));

        expect(visibleOnScrollElement.attributes("style")).toBe(
          "transform: translate3d(0, 0, 0);",
        );
        expect(visibleOnScrollElement.classes()).toContain("show");
        expect(visibleOnScrollElement.element.scrolledVisible).toBe(true);
      });
    });

    describe("route hash is changed", () => {
      it("sets scrollVisible to false", () => {
        const wrapper = mount(component, bindingProps());

        const visibleOnScrollElement = wrapper.find("p");
        window.dispatchEvent(new Event("hashchange"));

        expect(visibleOnScrollElement.element.scrolledVisible).toBe(false);
      });
    });
  });

  describe("when on small screen", () => {
    describe("and desktopBreakpoint is defined", () => {
      it("does not set initial transform style and 'show' class", () => {
        window.innerWidth = 400;
        const wrapper = mount(component, bindingProps());

        const visibleOnScrollElement = wrapper.find("p");

        expect(visibleOnScrollElement.attributes("style")).toBeUndefined();
        expect(visibleOnScrollElement.classes()).not.toContain("show");
      });
    });
    describe("and desktopBreakpoint is NOT defined", () => {
      it("sets initial transform style and 'show' class", () => {
        const wrapper = mount(component, bindingProps(null, null));

        const visibleOnScrollElement = wrapper.find("p");

        expect(visibleOnScrollElement.attributes("style")).toBe(
          "transform: translate3d(0, 0, 0);",
        );
        expect(visibleOnScrollElement.classes()).toContain("show");
      });
    });
  });

  describe("when changing the viewport from desktop to smaller", () => {
    it("disables the visible on scroll effect", () => {
      window.innerWidth = 1200;
      const wrapper = mount(component, bindingProps());

      const visibleOnScrollElement = wrapper.find("p");

      visibleOnScrollElement.element.scrollPosition = 200;
      window.scrollY = 300;
      window.dispatchEvent(new Event("scroll"));

      expect(visibleOnScrollElement.attributes("style")).toBe(
        "transform: translate3d(0, -100%, 0);",
      );
      expect(visibleOnScrollElement.classes()).not.toContain("show");

      window.innerWidth = 400;
      window.dispatchEvent(new CustomEvent("resize"));

      expect(visibleOnScrollElement.attributes("style")).toBe(
        "transform: translate3d(0, 0, 0);",
      );
      expect(visibleOnScrollElement.classes()).not.toContain("show");
    });
  });

  describe("when changing the viewport from small to desktop", () => {
    it("enables the visible on scroll effect", () => {
      window.innerWidth = 400;
      const wrapper = mount(component, bindingProps());

      const visibleOnScrollElement = wrapper.find("p");

      window.innerWidth = 1200;
      window.dispatchEvent(new CustomEvent("resize"));

      expect(visibleOnScrollElement.attributes("style")).toBe(
        "transform: translate3d(0, 0, 0);",
      );
      expect(visibleOnScrollElement.classes()).toContain("show");
    });
  });

  describe("on unmount", () => {
    it("disables the scroll effect and resets directive", () => {
      const wrapper = mount(component, bindingProps());

      const visibleOnScrollElement = wrapper.find("p");

      wrapper.unmount();

      expect(visibleOnScrollElement.classes()).not.toContain("show");
    });
  });

  // Vue 2 support
  it("on inserted it sets initial transform style and 'show' class", () => {
    const el = document.createElement("p");
    VisibleOnScrollDirective.inserted(el, {});

    expect(el.classList).toContain("show");
    expect(el.style.transform).toBe("translate3d(0, 0, 0)");
  });

  it("on unbind disables the scroll effect and resets directive", () => {
    const el = document.createElement("p");
    VisibleOnScrollDirective.inserted(el, {});
    VisibleOnScrollDirective.unbind();

    expect(el.classList).not.toContain("show");
    expect(el.style.transform).toBe("translate3d(0, 0, 0)");
  });
});
