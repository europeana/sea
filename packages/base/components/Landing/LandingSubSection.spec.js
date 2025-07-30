import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LandingSubSection from "./LandingSubSection.vue";

describe("components/Landing/LandingSubSection", () => {
  it("displays a title", () => {
    const title = "Title for a sub section";
    const wrapper = shallowMount(LandingSubSection, { props: { title } });

    const titleElement = wrapper.find("h2");

    expect(titleElement.text()).toBe(title);
  });

  it("displays text", () => {
    const text = "Text for a sub section";
    const wrapper = shallowMount(LandingSubSection, { props: { text } });

    const textElement = wrapper.find(".text");

    expect(textElement.text()).toBe(text);
  });

  describe("when there are image card sections", () => {
    it("displays the sections", () => {
      const sections = [{ __typename: "ImageCard" }];

      const wrapper = shallowMount(LandingSubSection, { props: { sections } });

      const imageCardElement = wrapper.find("landing-image-card-stub");

      expect(imageCardElement.exists()).toBe(true);
    });
    it("passes the imageCardCtaClasses prop", () => {
      const sections = [{ __typename: "ImageCard" }];
      const imageCardCtaClasses = "btn-primary";

      const wrapper = shallowMount(LandingSubSection, {
        props: { sections, imageCardCtaClasses },
      });

      const imageCardElement = wrapper.getComponent({
        name: "LandingImageCard",
      });

      expect(imageCardElement.props("ctaClasses")).toEqual(imageCardCtaClasses);
    });
  });
});
