import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import collectionsPage from "./collections.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return {
      path: "/en/collections",
      fullPath: "/en/collections",
      params: { slug: "collections" },
      query: {},
    };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
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
          featuredContent: {
            name: "Featured content",
          },
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

const mockQuery = vi.fn(() => contentfulResponse);

const factory = async () =>
  await mountSuspended(collectionsPage, {
    global: {
      provide: {
        $contentful: {
          query: mockQuery,
        },
      },
    },
  });

describe("Collections page", () => {
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });
  it("renders landing hero with the attributes from Contentful", async () => {
    const wrapper = await factory();

    const landingHero = wrapper.find(".landing-hero");

    expect(landingHero.text()).toContain(title);
    expect(landingHero.text()).toContain(description);
  });

  it("renders featured content card for featured content", async () => {
    const wrapper = await factory();

    const featuredCard = wrapper.findComponent({ name: "ContentFeaturedCard" });

    expect(featuredCard.exists()).toBe(true);
  });

  it("renders content cards for an illustration group", async () => {
    const wrapper = await factory();

    const cards = wrapper.findAllComponents(
      ".illustration-group .content-card",
    );

    expect(cards.length).toBe(2);
  });
  // UNCOMMENT:
  // describe("when NOT in preview mode", () => {
  //   it("requests from contentful without the preview arg", async () => {
  //     await factory();
  //     expect(mockQuery).toHaveBeenCalledWith(expect.any(Object), expect.not.objectContaining({ preview: true } ));
  //   });
  // });

  // describe("when in preview mode", () => {
  //   it("requests from contentful with the preview arg set to true", async () => {
  //     await useRouteMock.mockImplementation(() => ({
  //       path: "/en/collections",
  //       params: { slug: 'collections' },
  //       fullPath: '/en/collections?mode=preview',
  //       query: {
  //         mode: 'preview',
  //       },
  //     }));
  //     console.log('when in preview mode', useRouteMock.mock);
  //     await factory();
  //     expect(mockQuery).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ preview: true } ));
  //   });
  // });
});
