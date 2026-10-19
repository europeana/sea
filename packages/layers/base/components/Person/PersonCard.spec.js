import { describe, it, expect } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import PersonCard from "./PersonCard.vue";

mockNuxtImport("useNuxtApp", () => {
  return () => {
    return {
      $bs: {
        Tooltip: class Tooltip {},
      },
    };
  };
});

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

  describe("when there is no image", () => {
    it("displays a placeholder image", () => {
      const wrapper = factory({ name: testProps.name, role: testProps.role });
      expect(wrapper.find(".person-fallback-image").exists()).toBeTruthy();
    });
  });

  describe("when the image throws an error", () => {
    it("displays a placeholder image", async () => {
      const wrapper = factory({
        image: { url: "invalid", width: 0, height: 0 },
      });

      const imageStub = wrapper.find("image-optimised-stub");

      expect(imageStub.exists()).toBe(true);

      await imageStub.trigger("error");

      expect(wrapper.find(".person-fallback-image").isVisible()).toBe(true);
    });
  });

  describe("when there is an email", () => {
    it("renders an e-mail button link", () => {
      const wrapper = factory({ email: "info@example.eu" });

      expect(wrapper.find(".email-btn").isVisible()).toBe(true);
    });
  });

  describe("when there is a LinkedIn url in the website prop", () => {
    it("renders a LinkedIn button link", () => {
      const wrapper = factory({ website: "https://www.linkedin.com/profile" });

      expect(wrapper.find(".linkedin-btn").isVisible()).toBe(true);
    });
  });

  describe("when there is a different url in the website prop", () => {
    it("does NOT render a LinkedIn button link", () => {
      const wrapper = factory({ website: "https://www.social.com/profile" });

      expect(wrapper.find(".linkedin-btn").exists()).toBe(false);
    });
  });
});
