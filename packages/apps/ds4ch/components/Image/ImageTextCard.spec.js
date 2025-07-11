import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import ImageTextCard from "./ImageTextCard.vue";

const testProps = {
  card: {
    name: "Title for an image card",
    image: {
      image: {
        url: "https://www.example.eu/img.jpg",
        contentType: "image/jpeg",
      },
    },
  },
};

const factory = (props = testProps) =>
  shallowMount(ImageTextCard, {
    props,
  });

describe("components/landing/ImageTextCard", () => {
  it("renders a landing image card", () => {
    const wrapper = factory();

    const LandingImageCard = wrapper.find("landing-image-card-stub");
    expect(LandingImageCard.isVisible()).toBe(true);
  });

  describe("when there are no imageSrcSet and imageSizes props set", () => {
    it("passes default image srcset and sizes", () => {
      const wrapper = factory();

      const LandingImageCard = wrapper.find("landing-image-card-stub");
      expect(LandingImageCard.attributes("imagesizes")).toEqual(
        wrapper.vm.props.imageSizes,
      );
      expect(LandingImageCard.attributes("imagesrcset")).not.toBeFalsy();
    });
  });
});
