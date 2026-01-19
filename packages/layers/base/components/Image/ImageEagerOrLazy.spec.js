import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ImageEagerOrLazy from "./ImageEagerOrLazy.vue";

const factory = (props) =>
  shallowMount(ImageEagerOrLazy, {
    props: {
      height: 200,
      width: 200,
      src: "https://www.example.eu/image.webp",
      ...props,
    },
  });

describe("ImageEagerOrLazy", () => {
  it("renders an image with alt attribute", () => {
    const altText = "alternative text";
    const wrapper = factory({ alt: altText });
    const img = wrapper.find("img");

    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toBe(altText);
  });
  describe("when lazy is set to true", () => {
    it("lazy loads the image", () => {
      const wrapper = factory({ lazy: true });
      const img = wrapper.find("img");

      expect(img.attributes("loading")).toBe("lazy");
    });
  });
  describe("when lazy is set to false", () => {
    it("eager loads the image", () => {
      const wrapper = factory({ lazy: false });
      const img = wrapper.find("img");

      expect(img.attributes("loading")).toBe("eager");
    });
  });
});
