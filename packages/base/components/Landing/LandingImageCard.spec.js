import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import LandingImageCard from "./LandingImageCard.vue";

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
  shallowMount(LandingImageCard, {
    props,
  });

describe("components/landing/LandingImageCard", () => {
  describe("when there are no imageSrcSet and imageSizes props set", () => {
    it("passes default image srcset and sizes", () => {
      const wrapper = factory();

      const imageWithAttribution = wrapper.find("image-with-attribution-stub");
      expect(imageWithAttribution.attributes("imagesizes")).toEqual(
        wrapper.vm.props.imageSizes,
      );
      expect(
        imageWithAttribution.attributes("contentfulimagecroppresets"),
      ).not.toBeFalsy();
    });
  });
});
