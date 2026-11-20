import { describe, it, expect } from "vitest";
import { mockNuxtImport, shallowMount } from "@vue/test-utils";

import LandingIllustrationGroup from "./LandingIllustrationGroup.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
    };
  };
});

const factory = (propsData) =>
  shallowMount(LandingIllustrationGroup, {
    propsData,
  });

describe("components/landing/LandingIllustrationGroup", () => {
  it("displays a title", () => {
    const title = "Title for an illustration group";
    const wrapper = factory({ title });

    const titleElement = wrapper.find("h2");

    expect(titleElement.text()).toBe(title);
  });

  it("passes a srcset for responsive images", () => {
    const illustrations = [
      {
        image: {
          url: "https://images.ctfassets.net/example.png",
          width: 100,
          height: 100,
        },
      },
    ];
    const wrapper = factory({ illustrations });

    const imageStub = wrapper.find("image-optimised-stub");

    expect(imageStub.attributes("contentfulimagecroppresets")).toBeTruthy();
  });
});
