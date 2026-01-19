import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import ContentFeaturedCard from "./ContentFeaturedCard.vue";

const testProps = {
  title: "Card title",
};

const factory = (props = testProps) =>
  shallowMount(ContentFeaturedCard, {
    props,
  });

describe("components/content/ContentFeaturedCard", () => {
  it("renders a content card with passed down props and image presets", () => {
    const wrapper = factory();

    const card = wrapper.findComponent("content-card-stub");

    expect(card.exists()).toBe(true);
    expect(card.props("title")).toEqual(testProps.title);
    expect(card.props("imageSizes")).toEqual(wrapper.vm.imageSizes);
    expect(card.props("contentfulImageCropPresets")).toEqual(
      wrapper.vm.imageCropPresets,
    );
  });

  describe("when an image with url and content type are passed", () => {
    it("renders a content card with passed down image props", () => {
      const url = "https://www.example.eu/image.jpg";
      const contentType = "image/jpeg";
      const wrapper = factory({ ...testProps, image: { url, contentType } });

      const card = wrapper.findComponent("content-card-stub");

      expect(card.props("imageUrl")).toEqual(url);
      expect(card.props("imageContentType")).toEqual(contentType);
    });
  });
});
