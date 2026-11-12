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
    parity: "odd",
  },
};

const factory = (props = testProps) =>
  shallowMount(LandingImageCard, {
    props,
  });

describe("components/landing/LandingImageCard", () => {
  it("sets a class based on card's parity property", () => {
    const wrapper = factory();

    const imageCard = wrapper.find(".image-card");

    expect(imageCard.classes()).toContain("image-card-odd");
  });

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
