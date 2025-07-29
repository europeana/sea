import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const title = "DS4CH home page";
const contentfulResponse = {
  data: {
    landingPageCollection: {
      items: [
        {
          name: title,
          hasPartCollection: {
            items: [
              { __typename: "ImageCard", nameEN: "about us" },
              { __typename: "PrimaryCallToAction", nameEN: "Use APIs" },
            ],
          },
        },
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(IndexPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

describe("IndexPage", () => {
  it("renders an h1 element with the page title from Contentful", async () => {
    const wrapper = await factory();

    const h1 = wrapper.find("h1");

    expect(h1.text()).toBe(title);
  });
  it("derives section IDs from their English name", async () => {
    const wrapper = await factory();

    const aboutUs = wrapper.find("#about-us");

    expect(aboutUs.exists()).toBe(true);
  });
  describe("image card sections", () => {
    it("renders the section as an image card", async () => {
      const wrapper = await factory();

      const imageCard = wrapper.find(".image-card");

      expect(imageCard.exists()).toBe(true);
    });
  });
  describe("primary call to action sections", () => {
    it("renders the section as a call to action banner", async () => {
      const wrapper = await factory();

      const landingCTA = wrapper.find(".landing-cta");

      expect(landingCTA.exists()).toBe(true);
    });
  });
});
