import { describe, it, expect } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import CallToActionBanner from "./CallToActionBanner.vue";

config.global.renderStubDefaultSlot = true;

const factory = (props) =>
  shallowMount(CallToActionBanner, {
    props,
  });

describe("components/generic/CallToAction", () => {
  const props = {
    name: "Call to action headline",
    nameEnglish: "Call to action headline",
    text: "Description with _markup_!",
    link: {
      url: "https://example.org/cta",
      text: "button text",
    },
    illustration: {
      image: {
        description: "Image description",
        url: "https://example.org/image.jpg",
        width: 600,
        height: 400,
        contentType: "image/jpeg",
      },
    },
  };
  it(`has an illustration`, () => {
    const wrapper = factory(props);

    const illustartion = wrapper.find("image-optimised-stub");
    expect(illustartion.attributes("src")).toBe(
      "https://example.org/image.jpg",
    );
  });

  it(`renders the text and name from the props`, () => {
    const wrapper = factory(props);

    const headline = wrapper.find("h2");
    const text = wrapper.find(".cta-content div");
    expect(headline.text()).toBe("Call to action headline");
    expect(text.text()).toBe("Description with markup!");
  });

  it(`renders a button from the link prop`, () => {
    const wrapper = factory(props);

    const ctaButton = wrapper.find("call-to-action-stub");
    expect(ctaButton.attributes("text")).toBe("button text");
  });
});
