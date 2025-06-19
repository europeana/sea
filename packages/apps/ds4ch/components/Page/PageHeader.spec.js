import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import PageHeader from "./PageHeader.vue";

describe("PageHeader", () => {
  it("renders a header element", () => {
    const wrapper = shallowMount(PageHeader);
    const header = wrapper.find("header");

    expect(header.exists()).toBe(true);
  });

  it("renders the PageNavbar component", () => {
    const wrapper = shallowMount(PageHeader);

    expect(wrapper.findComponent({ name: "PageNavbar" }).exists()).toBe(true);
  });
});
