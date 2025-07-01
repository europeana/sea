import { describe, it, expect } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";
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
    it("should render a link to the site", async () => {
      const destination = "https://www.example.org/url-example";
      const wrapper = shallowMount(SmartLink, {
        props: { destination },
      });

      expect(wrapper.find("nuxt-link-stub").attributes("to")).toBe(destination);
    });
  });

  it("determines if the URL is an external path or not", async () => {
    const wrapper = shallowMount(SmartLink, {
      props: { destination: "https://www.foo.com/test" },
    });

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
