import { describe, it, expect } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import dataSpacePage from "./data-space.vue";

const defaultThumbnail = "https://www.example.org/image.jpg";

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      defaultThumbnail,
      i18n: {
        // NOTE: without this in the mock, link generation fails...
        routesNameSeparator: "___",
      },
    },
  });
});

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      d: (datetime) => datetime,
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
    };
  };
});

const title = "Explore the data space";
const description = "DS4CH text";
const defaultContentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          name: "News post",
          identifier: "post",
          primaryImageOfPage: { image: {} },
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
const factory = async (contentfulResponse = defaultContentfulResponse) =>
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

  it("renders content card links to the retrieved news posts", async () => {
    const wrapper = await factory();

    const contentCardLink = wrapper.find(".content-card a");

    expect(contentCardLink.attributes().href).toBe("/en/news/post");
  });

  it("sets a default thumbnail for cards without an image", async () => {
    const contentfulResponseNoImage = { ...defaultContentfulResponse };
    contentfulResponseNoImage.data.blogPostingCollection.items.forEach(
      (item) => delete item.primaryImageOfPage,
    );

    const wrapper = await factory(contentfulResponseNoImage);

    expect(wrapper.vm.cards.every((card) => !!card.primaryImageOfPage)).toBe(
      true,
    );
    expect(wrapper.vm.cards[0].primaryImageOfPage.image.url).toBe(
      defaultThumbnail,
    );
  });
});
