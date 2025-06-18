import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import PageNavbar from "./PageNavbar.vue";

describe("PageNavbar", () => {
  it("renders a nav element", async () => {
    const wrapper = await mountSuspended(PageNavbar);
    const nav = wrapper.find("nav");

    expect(nav.exists()).toBe(true);
  });

  it("renders the DS4CH logo and has an alt attribute", async () => {
    const wrapper = await mountSuspended(PageNavbar);

    const img = wrapper.find(".navbar-brand img");
    expect(img.attributes("src")).toContain(
      "@europeana/style/img/DS4CH/logo.svg",
    );
    expect(img.attributes("alt")).toBe("nav.home");
  });

  it("renders links as nav links", async () => {
    const wrapper = await mountSuspended(PageNavbar);

    const navLinks = wrapper.findAllComponents(".nav-link");
    expect(navLinks).toHaveLength(4);

    navLinks.forEach((link, index) => {
      expect(link.text()).toBe(wrapper.vm.links[index].text);
      expect(link.attributes("href")).toBe(wrapper.vm.links[index].url);
    });
  });
});
