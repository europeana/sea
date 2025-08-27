import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
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
          headline: title,
          hasPartCollection: {
            items: [
              {
                __typename: "ImageCard",
              },
              {
                __typename: "ImageCard",
              },
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

  it("annotates parity of image cards", async () => {
    const wrapper = await factory();

    const imageCards = wrapper.findAll(".image-card");

    expect(imageCards[0].classes()).toContain("image-card-odd");
    expect(imageCards[1].classes()).toContain("image-card-even");
  });
});
