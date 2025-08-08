import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";

import InfoCard from "./InfoCard.vue";

const testProps = {
  url: { name: "fakeURL" },
  info: "12,000,000",
  label: "IMAGE",
  image: "ic-image",
  variant: "default",
};

const factory = (props = testProps) =>
  shallowMount(InfoCard, {
    props,
  });

describe("components/Generic/InfoCard", () => {
  it("renders an info-card", () => {
    const wrapper = factory();

    const infoCard = wrapper.find(".info-card");
    expect(infoCard.isVisible()).toBe(true);
  });

  it("shows a smartlink for the url", async () => {
    const wrapper = factory();

    expect(wrapper.findAll("smartlink").length).toBe(1);
  });
  it("shows an icon based of the passed in image", async () => {
    const wrapper = factory();

    expect(wrapper.findAll(".card-img span.ic-image").length).toBe(1);
  });
  it("contains the info", async () => {
    const wrapper = factory();

    expect(wrapper.find(".info-card h3").text()).toBe("12,000,000");
  });
  it("contains the label", async () => {
    const wrapper = factory();

    expect(wrapper.find(".card-text").text()).toBe("IMAGE");
  });
  describe("cardClass", () => {
    it("is based on the variant", async () => {
      const wrapper = factory({
        ...testProps,
        url: null,
      });

      expect(wrapper.vm.cardClass).toBe("default-card");
    });
  });
});
