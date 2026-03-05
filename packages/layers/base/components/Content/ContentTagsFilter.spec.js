import { describe, it, expect, vi, afterEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentTagsFilter from "./ContentTagsFilter.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return {
      path: "/en/listing",
      fullPath: "/en/listing",
      params: { slug: "listing" },
      query: {},
    };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useI18n", () => {
  return () => {
    return {
      t: (key) => key,
      localeProperties: { value: { language: "en-GB" } },
    };
  };
});

const categoriesContentfulResponse = {
  data: {
    categoryCollection: {
      items: [
        { identifier: "3d", name: "3D" },
        { identifier: "cooking", name: "cooking" },
        { identifier: "postcards", name: "postcards" },
      ],
    },
  },
};

const mockQuery = vi.fn(() => categoriesContentfulResponse);

const factory = async () =>
  await mountSuspended(ContentTagsFilter, {
    global: {
      provide: {
        $contentful: {
          query: mockQuery,
        },
      },
    },
    props: {
      supportedTaxonomiesAndTypes: ["blog post"],
      site: "dataspace-culturalheritage.eu",
    },
  });

describe("components/Content/contentTagsFilter", () => {
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });

  it("fetches categories from Contentful", async () => {
    const wrapper = await factory();

    expect(wrapper.vm.tags.length).toBe(3);
  });
  // describe("when NOT in preview mode", () => {
  //   it("requests from contentful without the preview arg", async () => {
  //     await factory();
  //     expect(mockQuery).toHaveBeenCalledWith(expect.any(Object), expect.not.objectContaining({ preview: true } ));
  //   });
  // });

  // describe("when in preview mode", () => {
  //   it("requests from contentful with the preview arg set to true", async () => {
  //     useRouteMock.mockImplementation(() => ({
  //       path: '/en/listing',
  //       fullPath: '/en/listing?mode=preview',
  //       params: { slug: 'listing' },
  //       query: {
  //         mode: 'preview',
  //       },
  //     }));

  //     await factory();
  //     expect(mockQuery).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ preview: true } ));
  //   });
  // });
});
