import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import CardQuoteCard from "./CardQuoteCard.vue";

const testProps = {
  quoteText:
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  attribution: "M, Museum X",
};

describe("components/landing/CardQuoteCard", () => {
  it("renders a card", () => {
    const wrapper = shallowMount(CardQuoteCard, { props: testProps });

    const card = wrapper.find(".card blockquote");
    expect(card.isVisible()).toBe(true);
  });

  describe("when attribution props are set", () => {
    it("adds a caption with the attribution", () => {
      const wrapper = shallowMount(CardQuoteCard, { props: testProps });

      expect(wrapper.vm.attribution).toEqual(`M, Museum X`);
    });
  });

  describe("when no attribtuion prop is set", () => {
    it("does not render a caption", async () => {
      const wrapper = shallowMount(CardQuoteCard, {
        props: { quoteText: "quote text" },
      });

      expect(wrapper.find("figcaption").exists()).toBe(false);
    });
  });
});
