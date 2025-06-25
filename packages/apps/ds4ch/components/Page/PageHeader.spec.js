import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import PageHeader from "./PageHeader.vue";

describe("PageHeader", () => {
  it("renders a header element", async () => {
    const wrapper = await mountSuspended(PageHeader);
    const header = wrapper.find("header");

    expect(header.exists()).toBe(true);
  });

  it("renders the PageNavbar component", async () => {
    const wrapper = await mountSuspended(PageHeader);

    expect(wrapper.findComponent({ name: "PageNavbar" }).exists()).toBe(true);
  });
});
