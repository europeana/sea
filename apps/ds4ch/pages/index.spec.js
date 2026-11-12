import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

mockNuxtImport("useI18n", () => {
  return () => {
    return {
      locale: "en",
      localeProperties: { value: { language: "en-GB" } },
      t: (key) => key,
    };
  };
});
const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return {
      path: "/en",
      fullPath: "/en",
      params: {},
      query: {},
    };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useAsyncPageData", () => async (cacheId, callback) => {
  const result = await callback();
  return { page: ref(result.page) };
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

const mockQuery = vi.fn(() => contentfulResponse);

const factory = async () =>
  await mountSuspended(IndexPage, {
    global: {
      provide: {
        $contentful: {
          query: mockQuery,
        },
      },
    },
  });

describe("IndexPage", () => {
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });
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

  describe("when NOT in preview mode", () => {
    it("requests from contentful with the preview arg set to false", async () => {
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
        path: "/en/",
        params: { slug: "" },
        fullPath: "/en?mode=preview",
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
