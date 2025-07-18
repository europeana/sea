import { describe, it, expect } from "vitest";
import { shallowMount, config } from "@vue/test-utils";
import LandingCallToActionBanner from "./LandingCallToActionBanner.vue";

config.global.renderStubDefaultSlot = true;

const factory = (props) =>
  shallowMount(LandingCallToActionBanner, {
    props,
  });

describe("components/Landing/LandingCallToActionBanner", () => {
  const props = {
    title: "Call to action headline",
    text: "Description with _markup_!",
    link: {
      url: "https://example.org/cta",
      text: "button text",
    },
    backgroundImage: {
      image: {
        description: "Image description",
        url: "https://example.org/image.jpg",
        width: 600,
        height: 400,
        contentType: "image/jpeg",
      },
    },
  };
  it(`has a background image`, () => {
    const wrapper = factory(props);

    const backgroundImage = wrapper.find(".background-image");
    expect(backgroundImage.attributes("style")).toBe(
      "--bg-img-small: url('https://example.org/image.jpg');",
    );
  });

  it(`renders the primary call to action contents`, () => {
    const wrapper = factory(props);

    const ctaContent = wrapper.find("content-primary-call-to-action-stub");

    expect(ctaContent.attributes("title")).toBe("Call to action headline");
    expect(ctaContent.attributes("text")).toBe("Description with _markup_!");
  });
});
