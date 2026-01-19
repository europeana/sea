import { afterEach, describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";

import ShareButton from "./ShareButton.vue";

const trackEventMock = vi.fn((args) => args);

mockNuxtImport("useMatomo", () => () => ({
  matomo: { value: { trackEvent: trackEventMock } },
}));

const testProps = {
  headline: "Headline text",
  text: "Header text",
};

describe("components/landing/ShareButton", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders a button", () => {
    const wrapper = shallowMount(ShareButton, { props: testProps });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
  });

  describe("when the button is clicked", () => {
    it("logs to Matomo", async () => {
      const wrapper = shallowMount(ShareButton, { props: testProps });
      const button = wrapper.find("button");
      await button.trigger("click");

      expect(trackEventMock.mock.calls[0]).toEqual([
        "CTAs",
        "Click CTA",
        "Share",
      ]);
    });
  });
});
