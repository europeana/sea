import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import CardQuoteCard from "./CardQuoteCard.vue";

const testProps = {
  quoteText:
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  initials: "M",
  organisation: "Museum X",
};

describe("components/landing/CardQuoteCard", () => {
  it("renders a card", () => {
    const wrapper = shallowMount(CardQuoteCard, { props: testProps });

    const card = wrapper.find(".card blockquote");
    expect(card.isVisible()).toBe(true);
  });

  describe("when initials and organisation props are set", () => {
    it("adds a caption with initials and organisation", () => {
      const wrapper = shallowMount(CardQuoteCard, { props: testProps });

      expect(wrapper.vm.caption).toEqual(
        `- ${testProps.initials}, ${testProps.organisation}`,
      );
    });
  });

  describe("when only initials or organisation prop is set", () => {
    it("adds a caption with only initials or organisation", async () => {
      const wrapper = shallowMount(CardQuoteCard, {
        props: { ...testProps, initials: null },
      });

      expect(wrapper.vm.caption).toEqual(`- ${testProps.organisation}`);

      await wrapper.setProps({ ...testProps, organisation: null });

      expect(wrapper.vm.caption).toEqual(`- ${testProps.initials}`);
    });
  });

  describe("when no initials or organisation prop is set", () => {
    it("does not render a caption", async () => {
      const wrapper = shallowMount(CardQuoteCard, {
        props: { quoteText: "quote text" },
      });

      expect(wrapper.vm.caption).toBe(null);
      expect(wrapper.find("figcaption").exists()).toBe(false);
    });
  });
});
