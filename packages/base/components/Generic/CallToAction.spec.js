import { describe, it, expect, vi } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import CallToAction from "./CallToAction.vue";

const trackEventMock = vi.fn((args) => args);

mockNuxtImport("useMatomo", () => () => ({
  matomo: { value: { trackEvent: trackEventMock } },
}));

config.global.renderStubDefaultSlot = true;

const factory = (props) =>
  shallowMount(CallToAction, {
    props,
  });

describe("components/generic/CallToAction", () => {
  const props = {
    url: "https://example.org/cta",
    text: "Click the CTA",
  };

  it(`has a link to the URL prop`, () => {
    const wrapper = factory(props);

    const link = wrapper.find(".btn");
    expect(link.attributes("destination")).toBe("https://example.org/cta");
  });

  it(`renders the text from the text prop`, () => {
    const wrapper = factory(props);

    const cta = wrapper.find("div");
    expect(cta.text()).toBe("Click the CTA");
  });

  describe("when the CTA is clicked", () => {
    it("logs to Matomo", async () => {
      const wrapper = factory(props);

      const link = wrapper.find(".btn");
      await link.trigger("click");

      expect(trackEventMock.mock.calls[0]).toEqual([
        "CTAs",
        "Click CTA",
        props.text,
      ]);
    });
  });
});
