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

mockNuxtImport("useRoute", () => {
  return () => {
    return {
      path: "/data-space",
      fullPath: "/data-space",
      query: {
        page: 1,
      },
    };
  };
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

const blogPostingListingMinimalContentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          date: "2022-02-12T08:00:00.000+01:00",
          sys: { id: "796f5YKe4b1u8uXtizSBu0" },
          cats: { items: [{ id: "3d" }, null] },
        },
        {
          date: "2023-02-12T07:00:00.000+01:00",
          sys: { id: "2abe0ffb2af8b39dfdb83d" },
          cats: { items: [{ id: "network" }, null] },
        },
      ],
    },
  },
};

const contentBySysIdContentfulResponse = {
  data: {
    blogPostingCollection: {
      items: [
        {
          __typename: "BlogPosting",
          sys: {
            id: "796f5YKe4b1u8uXtizSBu0",
          },
          identifier: "blog-identifier",
          name: "Blog entry",
          primaryImageOfPage: {
            image: {
              url: "https://images.ctfassets.net/i01duvb6kq77/7Jnq4yka0vfYdWKo7IV7Dc/5778788f0359b1a6a81ef1f57a260982/feature_1920Olympics.jpg",
              contentType: "image/jpeg",
            },
          },
        },
        {
          __typename: "BlogPosting",
          sys: {
            id: "2abe0ffb2af8b39dfdb83d",
          },
          identifier: "blog-no-image",
          name: "Blog no Image",
        },
      ],
    },
  },
};

const contentHubPageContentfulResponse = {
  data: {
    contentHubPageCollection: {
      items: [
        {
          name: title,
          headline: description,
          primaryImageOfPage: { image: "stubbed Image" },
          contentTypes: ["blog post"],
        },
      ],
    },
  },
};

const categoriesContentfulResponse = {
  data: {
    categoryCollection: {
      items: [
        {
          identifier: "3d",
          name: "3D",
        },
        {
          identifier: "network",
          name: "network",
        },
      ],
    },
  },
};

const handleContentfulQuery = (graphQL) => {
  if (graphQL.definitions?.[0]?.name?.value === "ContentBySysId") {
    return contentBySysIdContentfulResponse;
  }
  if (graphQL.definitions?.[0]?.name?.value === "BlogPostingListingMinimal") {
    return blogPostingListingMinimalContentfulResponse;
  }
  if (graphQL.definitions?.[0]?.name?.value === "ContentHubPage") {
    return contentHubPageContentfulResponse;
  }
  if (graphQL.definitions?.[0]?.name?.value === "Categories") {
    return categoriesContentfulResponse;
  }
};

const factory = async () =>
  await mountSuspended(dataSpacePage, {
    global: {
      provide: {
        $contentful: {
          query: (graphQL) => handleContentfulQuery(graphQL),
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

    const contentCardLinks = wrapper.findAll(".card-link");

    expect(contentCardLinks[0].attributes("href")).toBe(
      "/en/news/blog-no-image",
    );
    expect(contentCardLinks[1].attributes("href")).toBe(
      "/en/news/blog-identifier",
    );
  });

  it("renders images for each news posts", async () => {
    const wrapper = await factory();

    const contentCardImages = wrapper.findAll(".card-img img");

    expect(contentCardImages[0].attributes("src")).toBe(
      "https://www.example.org/image.jpg",
    );
    expect(contentCardImages[1].attributes("src")).toBe(
      "https://images.ctfassets.net/i01duvb6kq77/7Jnq4yka0vfYdWKo7IV7Dc/5778788f0359b1a6a81ef1f57a260982/feature_1920Olympics.jpg?q=80&fm=webp",
    );
  });
});
