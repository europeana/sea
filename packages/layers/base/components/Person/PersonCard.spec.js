import { describe, it, expect } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import PersonCard from "./PersonCard.vue";

const testProps = {
  image: {
    url: "https://images.ctfassets.net/asset",
    width: 400,
    height: 600,
  },
  name: "Frida Kahlo",
  role: "painter",
};

const factory = (props = testProps) =>
  shallowMount(PersonCard, {
    props,
  });

describe("components/content/PersonCard", () => {
  it("displays a face focused, round, cropped, optimised image", () => {
    const wrapper = mount(PersonCard, { props: testProps });
    expect(wrapper.find("img").attributes("srcset")).toContain(
      "w=120&h=120&fit=fill&f=face&r=100&q=80&fm=webp",
    );
  });

  it("displays a name and role", () => {
    const wrapper = factory();
    expect(wrapper.find(".person-name").text()).toEqual(testProps.name);
    expect(wrapper.find(".person-role").text()).toEqual(testProps.role);
  });

  describe("when no name and/or role", () => {
    it("does not display a name and/or role", () => {
      const wrapper = factory({ image: { ...testProps.image } });
      expect(wrapper.find(".person-name").exists()).toBeFalsy();
      expect(wrapper.find(".person-role").exists()).toBeFalsy();
    });
  });
});
