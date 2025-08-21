import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import slugPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const title = "DS4CH about us";
const description = "DS4CH text";
const contentfulResponse = {
  data: {
    landingPageCollection: {
      items: [
        {
          headline: title,
          text: description,
          primaryImageOfPage: { image: "stubed Image" },
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
  await mountSuspended(slugPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

describe("slugPage", () => {
  it("renders landing hero with the attributes from Contentful", async () => {
    const wrapper = await factory();

    const landingHero = wrapper.find(".landing-hero");

    expect(landingHero.text()).toContain(title);
    expect(landingHero.text()).toContain(description);
  });

  it("annotates parity of image cards", async () => {
    const wrapper = await factory();

    const imageCards = wrapper.findAll(".image-card");

    expect(imageCards[0].classes()).toContain("image-card-odd");
    expect(imageCards[1].classes()).toContain("image-card-even");
  });
});
