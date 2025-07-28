import { describe, it, expect } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import ContentPrimaryCallToAction from "./ContentPrimaryCallToAction.vue";

config.global.renderStubDefaultSlot = true;

const factory = (props) =>
  shallowMount(ContentPrimaryCallToAction, {
    props,
  });

describe("components/Content/ContentPrimaryCallToAction", () => {
  const props = {
    title: "Call to action headline",
    text: "Description with _markup_!",
    link: {
      url: "https://example.org/cta",
      text: "button text",
    },
  };

  it(`renders the text and name from the props`, () => {
    const wrapper = factory(props);

    const headline = wrapper.find("h2");
    const text = wrapper.find(".primary-cta div");
    expect(headline.text()).toBe("Call to action headline");
    expect(text.text()).toBe("Description with markup!");
  });

  it(`renders a button from the link prop`, () => {
    const wrapper = factory(props);

    const ctaButton = wrapper.find("call-to-action-stub");
    expect(ctaButton.attributes("text")).toBe("button text");
  });
});
