import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import dataSpacePage from "./data-space.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const title = "Explore the data space";
const description = "DS4CH text";
const contentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          name: "News post",
          identifier: "post",
        },
      ],
    },
    landingPageCollection: {
      items: [
        {
          headline: title,
          text: description,
          primaryImageOfPage: { image: "stubbed Image" },
        },
      ],
    },
  },
};
const factory = async () =>
  await mountSuspended(dataSpacePage, {
    global: {
      provide: {
        $contentful: {
          query: () => contentfulResponse,
        },
      },
    },
  });

describe("dataSpacePage", () => {
  it("renders landing hero with the attributes from Contentful", async () => {
    const wrapper = await factory();

    const landingHero = wrapper.find(".landing-hero");

    expect(landingHero.text()).toContain(title);
    expect(landingHero.text()).toContain(description);
  });

  it("renders the alternate variant of the hero", async () => {
    const wrapper = await factory();

    const hero = wrapper.findComponent({ name: "LandingHero" });

    expect(hero.props("variant")).toBe("alternate");
  });

  it("renders links to the retrieved news posts", async () => {
    const wrapper = await factory();

    const postLink = wrapper.find("ol li a");

    expect(postLink.attributes().href).toBe("/en/news/post");
  });
});
