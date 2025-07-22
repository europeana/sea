import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import LandingCallToActionBanner from "./LandingCallToActionBanner.vue";

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
        url: "https://images.ctfassets.net/image.jpg",
        width: 600,
        height: 400,
        contentType: "image/jpeg",
      },
      profile: { sizes: ["small", "medium"] },
    },
  };

  it("renders the primary call to action contents", () => {
    const wrapper = factory(props);

    const ctaContent = wrapper.find("content-primary-call-to-action-stub");

    expect(ctaContent.attributes("title")).toBe("Call to action headline");
    expect(ctaContent.attributes("text")).toBe("Description with _markup_!");
  });

  it("sets responsive background image CSS variables", () => {
    const wrapper = factory(props);

    const backgroundImage = wrapper.find(".background-image");
    expect(backgroundImage.attributes("style")).toBe(
      "--bg-img-small: url('https://images.ctfassets.net/image.jpg?w=576&h=350&fit=fill&fm=webp&q=40'); --bg-img-medium: url('https://images.ctfassets.net/image.jpg?w=768&h=310&fit=fill&fm=webp&q=40');",
    );
  });

  describe("when background image is a SVG", () => {
    it("sets the SVG without cropping or optimisation as background CSS variables", () => {
      const propsWithSvg = { ...props };
      propsWithSvg.backgroundImage.image.contentType = "image/svg+xml";
      propsWithSvg.backgroundImage.image.url =
        "https://images.ctfassets.net/image.svg";
      const wrapper = factory(propsWithSvg);

      const backgroundImage = wrapper.find(".background-image");
      expect(backgroundImage.attributes("style")).toBe(
        "--bg-img-small: url('https://images.ctfassets.net/image.svg');",
      );
    });
  });

  describe("when background image profile is set to highlight", () => {
    it("sets the container text color to white", () => {
      const propsWithHiglightProfile = { ...props };
      propsWithHiglightProfile.backgroundImage.profile.background = "highlight";
      const wrapper = factory(propsWithHiglightProfile);

      const whiteContainerText = wrapper.find(".container.text-white");
      expect(whiteContainerText.exists()).toBe(true);
    });
  });
});
