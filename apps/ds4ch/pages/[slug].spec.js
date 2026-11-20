import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import slugPage from "./[slug].vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return {
      path: "/en/about",
      fullPath: "/en/about",
      params: { slug: "about" },
      query: {},
    };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);

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
const mockQuery = vi.fn(() => contentfulResponse);

const factory = async () =>
  await mountSuspended(slugPage, {
    global: {
      provide: {
        $contentful: { query: mockQuery },
      },
    },
  });

describe("slugPage", () => {
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

  it("annotates parity of image cards", async () => {
    const wrapper = await factory();

    const imageCards = wrapper.findAll(".image-card");

    expect(imageCards[0].classes()).toContain("image-card-odd");
    expect(imageCards[1].classes()).toContain("image-card-even");
  });

  describe("when NOT in preview mode", () => {
    it("requests from contentful with the preview arg set to false", async () => {
      useRouteMock.mockImplementation(() => ({
        path: "/en/test-no-preview",
        params: { slug: "test-no-preview" },
        fullPath: "/en/test-no-preview",
        query: {},
      }));
      await factory();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ preview: false }),
      );
    });
  });

  describe("when in preview mode", () => {
    it("requests from contentful with the preview arg set to true", async () => {
      useRouteMock.mockImplementation(() => ({
        path: "/en/test-preview",
        params: { slug: "test-preview" },
        fullPath: "/en/test-preview",
        query: {
          mode: "preview",
        },
      }));
      await factory();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ preview: true }),
      );
    });
  });
});
