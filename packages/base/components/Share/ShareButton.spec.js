import { afterEach, describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { shallowMount } from "@vue/test-utils";

import ShareButton from "./ShareButton.vue";

const trackMock = vi.fn((args) => args);

mockNuxtImport("useRoute", () => {
  return () => {
    return {
      path: "/path",
    };
  };
});

mockNuxtImport("useNuxtApp", () => {
  return () => {
    return {
      vueApp: {
        config: {
          globalProperties: {
            $matomo: {
              trackEvent: trackMock,
            },
          },
        },
      },
    };
  };
});

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
    it("logs to matomo", async () => {
      const wrapper = shallowMount(ShareButton, { props: testProps });
      const button = wrapper.find("button");
      await button.trigger("click");

      expect(trackMock.mock.calls[0]).toEqual([
        "Open modal",
        "Social share modal opened",
        "Opened share modal on /path",
      ]);
    });
  });
});
