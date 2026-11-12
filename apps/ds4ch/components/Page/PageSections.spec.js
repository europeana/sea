import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PageSections from "./PageSections.vue";

const props = {
  sections: [
    { __typename: "ImageCard", nameEN: "about us" },
    { __typename: "PrimaryCallToAction", nameEN: "Use APIs" },
    { __typename: "TestimonialCardGroup", nameEN: "Testimonial quotes" },
    { __typename: "LandingSubSection", nameEN: "Landing Sub-Section" },
  ],
};

describe("components/Page/PageSections", () => {
  it("derives section IDs from their English name", () => {
    const wrapper = shallowMount(PageSections, { props });

    const aboutUs = wrapper.find("#about-us");

    expect(aboutUs.exists()).toBe(true);
  });
  describe("image card sections", () => {
    it("renders the section as an image card", () => {
      const wrapper = shallowMount(PageSections, { props });

      const imageCard = wrapper.find("image-text-card-stub");

      expect(imageCard.exists()).toBe(true);
    });
  });
  describe("primary call to action sections", () => {
    it("renders the section as a call to action banner", () => {
      const wrapper = shallowMount(PageSections, { props });

      const landingCTA = wrapper.find("call-to-action-banner-stub");

      expect(landingCTA.exists()).toBe(true);
    });
  });
  describe("testimonial card group sections", () => {
    it("renders the section as a card group", () => {
      const wrapper = shallowMount(PageSections, { props });

      const cardGroup = wrapper.find("card-group-stub");

      expect(cardGroup.exists()).toBe(true);
    });
  });
  describe("landing sub-sections", () => {
    it("renders the section as a landing sub section", () => {
      const wrapper = shallowMount(PageSections, { props });

      const cardGroup = wrapper.find("landing-sub-section-stub");

      expect(cardGroup.exists()).toBe(true);
    });
  });
});
