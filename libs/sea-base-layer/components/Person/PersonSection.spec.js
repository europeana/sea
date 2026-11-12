import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PersonSection from "./PersonSection.vue";

const title = "example title";
const description = "example description _markup_";

const testProps = {
  people: [
    {
      image: {
        url: "https://images.ctfassets.net/asset",
        width: 400,
        height: 600,
      },
      name: "Frida Kahlo",
      role: "painter",
    },
    {
      name: "Another person",
    },
  ],
};

const factory = (props = testProps) =>
  shallowMount(PersonSection, {
    props,
  });

describe("components/content/PersonSection", () => {
  it("displays a title when present", () => {
    const wrapper = factory({ ...testProps, title });

    expect(wrapper.find("h2").text()).toContain("example title");
  });

  it("displays a description when present", () => {
    const wrapper = factory({ ...testProps, description });
    expect(wrapper.find("p").text()).toContain("example description markup");
  });

  describe("when the titleTag prop is set", () => {
    it("render the title in the tag", () => {
      const wrapper = factory({ ...testProps, title, titleTag: "h3" });

      expect(wrapper.find("h3").text()).toContain("example title");
    });
  });

  it("displays cards for each person", () => {
    const wrapper = factory();
    const cards = wrapper.findAll("person-card-stub");
    expect(cards.length).toEqual(2);
  });
});
