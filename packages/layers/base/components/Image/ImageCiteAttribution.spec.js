import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ImageCiteAttribution from "./ImageCiteAttribution.vue";

const requiredProps = {
  rightsStatement: "http://creativecommons.org/publicdomain/mark/1.0/",
};

const url = "http://www.example.org/something";

const factory = (props) =>
  mount(ImageCiteAttribution, {
    attachTo: document.body,
    props: {
      ...requiredProps,
      ...props,
    },
    global: { stubs: ["RouterLink"] },
  });

describe("components/generic/ImageCiteAttribution", () => {
  it("has a link", () => {
    const url = "http://www.example.org/something";
    const wrapper = factory({ url });

    const link = wrapper.find("cite a");
    expect(link.attributes().href).toBe(url);
  });

  it("has an attribution", () => {
    const creator = "Johannes Vermeer";
    const wrapper = factory({ creator, extended: true, url });

    const attribution = wrapper.find("cite a");
    expect(attribution.text()).toContain(creator);
  });

  it("has a rights statement", () => {
    const wrapper = factory({
      rightsStatement: "http://rightsstatements.org/vocab/InC/1.0/",
      url,
    });

    const rights = wrapper.find("cite a span");
    expect(rights.text()).toContain("In Copyright");
  });

  describe(".linkText", () => {
    it("is concatenates name, creator and provider", () => {
      const name = "Something";
      const creator = "Someone";
      const provider = "Somewhere";
      const wrapper = factory({ name, creator, provider });

      expect(wrapper.vm.linkText).toBe("Something, Someone, Somewhere");
    });

    it("omits empty fields", () => {
      const name = "Something";
      const provider = "Somewhere";
      const wrapper = factory({ name, provider });

      expect(wrapper.vm.linkText).toBe("Something, Somewhere");
    });
  });

  describe("when extended through keyboard navigation", () => {
    it("sets focus on the first link", () => {
      const wrapper = factory({
        ...requiredProps,
        extended: true,
        setFocus: true,
      });

      const link = wrapper.find("cite a:focus");
      expect(link.exists()).toBe(true);
    });
  });
});
