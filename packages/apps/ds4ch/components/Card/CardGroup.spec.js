import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import CardGroup from "./CardGroup.vue";

const testProps = {
  cards: [
    {
      quoteText:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      attribution: "M, Museum X",
      variant: "quote",
    },
    {
      quoteText:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      attribution: "A. B., European Commission",
      variant: "quote",
    },
  ],
};

describe("components/landing/CardGroup", () => {
  it("renders a row with columns of cards", () => {
    const wrapper = shallowMount(CardGroup, { props: testProps });

    const column = wrapper.find(".row .col");
    expect(column.isVisible()).toBe(true);
  });

  describe("when card variant is quote", () => {
    it("renders a quote card", () => {
      const wrapper = shallowMount(CardGroup, { props: testProps });

      const quoteCards = wrapper.findAll("card-quote-card-stub");

      expect(quoteCards.length).toBe(2);
    });
  });
});
