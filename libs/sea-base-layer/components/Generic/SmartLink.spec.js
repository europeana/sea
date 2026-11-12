import { describe, it, expect } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount, mount } from "@vue/test-utils";
import SmartLink from "./SmartLink.vue";

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      internalLinkDomain: "www.foo.com",
    },
  });
});

describe("SmartLink", () => {
  describe("when passed a URL", () => {
    it("renders a link to the site", async () => {
      const destination = "https://www.example.org/url-example";
      const wrapper = shallowMount(SmartLink, {
        props: { destination },
      });

      expect(wrapper.find("nuxt-link-locale-stub").attributes("to")).toBe(
        destination,
      );
    });
  });

  describe("when link is external", () => {
    const factory = (props) => {
      return mount(SmartLink, {
        props: { destination: "https://www.example.org/url-example", ...props },
        global: { stubs: ["RouterLink"] },
      });
    };

    it("adds visually hidden text to note AT users that link opens in new window", async () => {
      const wrapper = factory();

      expect(wrapper.find(".visually-hidden").text()).toBe("(newWindow)");
    });
    it("adds an icon to note users that link opens in new window", async () => {
      const wrapper = factory();

      expect(wrapper.find(".icon-external-link").exists()).toBe(true);
    });

    describe("when hideExternalIcon prop is set", () => {
      it("does NOT add an icon", async () => {
        const wrapper = factory({ hideExternalIcon: true });

        expect(wrapper.find(".icon-external-link").exists()).toBe(false);
      });
    });
  });

  it("determines if the URL is an external path or not", async () => {
    const wrapper = shallowMount(SmartLink);

    await wrapper.setProps({
      destination: "http://www.example.org/url-example",
    });
    expect(wrapper.vm.isExternalLink).toBe(true);

    await wrapper.setProps({
      destination: "https://www.example.org/url-example",
    });
    expect(wrapper.vm.isExternalLink).toBe(true);

    await wrapper.setProps({ destination: "/test" });
    expect(wrapper.vm.isExternalLink).toBe(false);

    await wrapper.setProps({ destination: "https://www.foo.com/test" });
    expect(wrapper.vm.isExternalLink).toBe(false);

    await wrapper.setProps({ destination: "https://pro.foo.com/test" });
    expect(wrapper.vm.isExternalLink).toBe(true);

    await wrapper.setProps({ destination: { name: "index" } });
    expect(wrapper.vm.isExternalLink).toBe(false);
  });
});
