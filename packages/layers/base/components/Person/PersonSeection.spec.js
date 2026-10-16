import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PersonSection from "./PersonSection.vue";

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
  title: "example title",
  description: "example description",
};

const factory = (props = testProps) =>
  shallowMount(PersonSection, {
    props,
  });

describe("components/content/PersonSection", () => {
  it("displays a title and description when present", () => {
    const wrapper = factory();

    expect(wrapper.find("h2").text()).toContain("example title");
    expect(wrapper.find("p").text()).toContain("example description");
  });

  it("displays cards for each person", () => {
    const wrapper = factory();
    const cards = wrapper.findAll("person-card-stub");
    expect(cards.length).toEqual(2);
  });
});
