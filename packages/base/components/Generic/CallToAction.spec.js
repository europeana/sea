import { describe, it, expect } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import CallToAction from "./CallToAction.vue";

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
});
