import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import CardGroup from "./CardGroup.vue";

const testProps = {
  cards: [
    {
      name: "News post",
      __typename: "ContentCard",
    },
    {
      testimonialText:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      attribution: "M, Museum X",
      __typename: "TestimonialCard",
    },
    {
      testimonialText:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      attribution: "A. B., European Commission",
      __typename: "TestimonialCard",
    },
  ],
};

describe("components/landing/CardGroup", () => {
  it("renders a row with columns of cards", () => {
    const wrapper = shallowMount(CardGroup, { props: testProps });

    const column = wrapper.find(".row .col");
    expect(column.isVisible()).toBe(true);
  });

  describe("when card type is content", () => {
    it("renders a content card", () => {
      const wrapper = shallowMount(CardGroup, { props: testProps });

      const testimonialCards = wrapper.findAll("content-card-stub");

      expect(testimonialCards.length).toBe(1);
    });
  });

  describe("when card type is testimonial", () => {
    it("renders a testimonial card", () => {
      const wrapper = shallowMount(CardGroup, { props: testProps });

      const testimonialCards = wrapper.findAll("card-testimonial-card-stub");

      expect(testimonialCards.length).toBe(2);
    });
  });
});
