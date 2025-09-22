import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PageFooter from "./PageFooter.vue";

describe("PageFooter", () => {
  it("renders a footer element", () => {
    const wrapper = shallowMount(PageFooter);
    const footer = wrapper.find("footer");

    expect(footer.exists()).toBe(true);
  });

  it("renders the sections", () => {
    const wrapper = shallowMount(PageFooter);
    const footerSections = wrapper.findAll(".footer-section");
    expect(footerSections.length).toBe(3);
  });

  it("renders the Language selector", () => {
    const wrapper = shallowMount(PageFooter);

    expect(wrapper.findComponent("language-selector-stub").exists()).toBe(true);
  });
});
