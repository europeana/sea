import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

import ShareSocialLink from "./ShareSocialLink.vue";

const trackEventMock = vi.fn((args) => args);

mockNuxtImport("useMatomo", () => () => ({
  matomo: { value: { trackEvent: trackEventMock } },
}));

vi.mock("~/composables/canonicalUrl", () => ({
  default: () => ({ urlWithOnlyQuery: ref("/en/page") }),
}));

const testProps = {
  network: "bluesky",
};

describe("components/Share/ShareSocialLink", () => {
  it("renders a share link for the network", () => {
    const wrapper = shallowMount(ShareSocialLink, { props: testProps });

    const link = wrapper.find("nuxt-link-stub");

    expect(link.attributes("to")).toEqual(wrapper.vm.allNetworks.bluesky.url);
  });

  describe("when the link is clicked", () => {
    it("logs to Matomo", async () => {
      const wrapper = shallowMount(ShareSocialLink, { props: testProps });

      const link = wrapper.find("nuxt-link-stub");
      await link.trigger("click");

      expect(trackEventMock.mock.calls[0]).toEqual([
        "Social media",
        "Click social network",
        wrapper.vm.allNetworks.bluesky.name,
      ]);
    });
  });
});
