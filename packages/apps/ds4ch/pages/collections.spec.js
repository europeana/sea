import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import dataPage from "./collections.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const title = "Explore the collections";
const description = "DS4CH text description";
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
                __typename: "IllustrationGroup",
                hasPartCollection: {
                  items: [{ name: "title 1" }, { name: "title 2" }],
                },
              },
            ],
          },
        },
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(dataPage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

describe("DataPage", () => {
  it("renders landing hero with the attributes from Contentful", async () => {
    const wrapper = await factory();

    const landingHero = wrapper.find(".landing-hero");

    expect(landingHero.text()).toContain(title);
    expect(landingHero.text()).toContain(description);
  });

  it("renders content cards for an illustration group", async () => {
    const wrapper = await factory();

    const cards = wrapper.findAllComponents({ name: "ContentCard" });

    expect(cards.length).toBe(2);
  });
});
