import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentInterface from "./ContentInterface.vue";

const { useRouteMock } = vi.hoisted(() => ({
  useRouteMock: vi.fn(() => {
    return { query: {} };
  }),
}));
mockNuxtImport("useRoute", () => useRouteMock);
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

const categories = ["network", "postcards"];

const mockBlogMetadata = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  date: `2023-01-${index}`,
  cats: {
    items: [{ id: categories[0] }, { id: categories[1] }],
  },
}));

const mockBlogMetadataWithCategories = [
  {
    __typename: "BlogPosting",
    sys: { id: "id1" },
    date: "2023-01-01",
    cats: { items: [{ id: "network" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "id2" },
    date: "2023-01-02",
    cats: { items: [{ id: "postcards" }] },
  },
  {
    __typename: "BlogPosting",
    sys: { id: "id3" },
    date: "2023-01-03",
    cats: { items: [{ id: "unknown" }] },
  },
];

const mockBlogEntries = Array.from({ length: 24 }, (key, index) => ({
  __typename: "BlogPosting",
  sys: { id: `id${index}` },
  datePublished: `2023-01-${index}`,
  name: `Entry ${index}`,
}));

const mockQuery = vi.fn();

// Use this function to create custom mock responses for different test cases
const contentfulResponse = (query, entries, metadata) => {
  if (query.definitions?.[0]?.name?.value === "ContentBySysId") {
    return Promise.resolve({
      data: {
        blogPostingCollection: { items: entries.blogs },
        projectPageCollection: { items: [] },
        storyCollection: { items: [] },
        exhibitionPageCollection: { items: [] },
      },
    });
  }
  if (query.definitions?.[0]?.name?.value === "BlogPostingListingMinimal") {
    return Promise.resolve({
      data: { blogPostingCollection: { items: metadata.blogs } },
    });
  }
  if (query.definitions?.[0]?.name?.value === "ProjectPageListingMinimal") {
    return Promise.resolve({
      data: { projectPageCollection: { items: [] } },
    });
  }
};

const factory = (props = {}) =>
  mountSuspended(ContentInterface, {
    global: {
      provide: {
        $contentful: { query: mockQuery },
      },
      mocks: {
        $route: {
          query: { page: 1 },
        },
      },
      stubs: ["ContentTagsDropdown"],
    },
    props: {
      contentTypes: ["blog post"],
      site: "dataspace-culturalheritage.eu",
      ...props,
    },
  });

describe("components/content/contentInterface", () => {
  beforeEach(() => {
    mockQuery.mockImplementation((query) =>
      contentfulResponse(
        query,
        { blogs: mockBlogEntries },
        { blogs: mockBlogMetadata },
      ),
    );
  });
  afterEach(() => {
    useRouteMock.mockReset();
    vi.clearAllMocks();
  });

  it("fetches and renders content entries", async () => {
    const wrapper = await factory();

    expect(mockQuery).toHaveBeenCalled();
    expect(wrapper.findAllComponents({ name: "ContentCard" }).length).toBe(24);
  });
  describe("selectedTags", () => {
    it("defaults to an empty array", async () => {
      const wrapper = await factory();

      expect(wrapper.vm.selectedTags).toEqual([]);
    });

    it("has a selected tag when one is present in the URL", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: categories[0],
        },
      }));
      const wrapper = await factory();
      expect(wrapper.vm.selectedTags.length).toBe(1);
    });

    it("has multiple tags when present in the URL", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: "network,art,manuscripts",
        },
      }));
      const wrapper = await factory();

      expect(wrapper.vm.selectedTags.length).toBe(3);
    });
  });

  describe("selectedType", () => {
    it("defaults to false", async () => {
      const wrapper = await factory();

      expect(wrapper.vm.selectedType).toBe(false);
    });

    it('is set to "project" when the type is set in the URL', async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          type: "project",
        },
      }));
      const wrapper = await factory();

      expect(wrapper.vm.selectedType).toBe("ProjectPage");
    });
  });
  describe("filteredTags", () => {
    describe("when content is filtered to a tag", () => {
      it("selects and sorts categories that are shared with the active filter", async () => {
        const tag = "network";
        mockQuery.mockImplementation((query) =>
          contentfulResponse(
            query,
            { blogs: mockBlogEntries },
            { blogs: mockBlogMetadataWithCategories },
          ),
        );
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: tag,
          },
        }));
        const wrapper = await factory();

        const filteredTags = wrapper.vm.filteredTags;

        expect(filteredTags).toEqual([tag]);
      });
    });
  });
  describe("relevantContentMetadata", () => {
    describe("when no tags are selected", () => {
      it("defaults to all content", async () => {
        const wrapper = await factory();

        const relevantContentMetadata = wrapper.vm.relevantContentMetadata;
        const allContentMetaData = wrapper.vm.allContentMetadata.value;

        expect(relevantContentMetadata).toEqual(allContentMetaData);
      });
    });

    describe("when a tag is selected", () => {
      it("only selects content which has the selected tags", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            tags: categories[0],
          },
        }));
        const wrapper = await factory();

        const relevantContentMetadata = wrapper.vm.relevantContentMetadata;

        const expectedContentData = wrapper.vm.allContentMetadata.value.filter(
          (entry) => entry.cats.includes(categories[0]),
        );
        expect(relevantContentMetadata).toEqual(expectedContentData);
      });
    });

    describe("when a type is selected", () => {
      it("only selects content which has the selected type", async () => {
        useRouteMock.mockImplementation(() => ({
          query: {
            type: "blog post",
          },
        }));
        const wrapper = await factory();

        const relevantContentMetadata = wrapper.vm.relevantContentMetadata;

        const expectedContentData = wrapper.vm.allContentMetadata.value.filter(
          (entry) => entry.__typename === "BlogPosting",
        );
        expect(relevantContentMetadata).toEqual(expectedContentData);
      });
    });
  });
  describe("total", () => {
    it("defaults to 0", async () => {
      mockQuery.mockImplementation((query) =>
        contentfulResponse(query, { blogs: [] }, { blogs: [] }),
      );
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(0);
    });

    it("is based of the relevantContentMetadata length", async () => {
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(24);
    });

    it("takes into account applied tags", async () => {
      const tag = "network";
      mockQuery.mockImplementation((query) =>
        contentfulResponse(
          query,
          { blogs: mockBlogEntries },
          { blogs: mockBlogMetadataWithCategories },
        ),
      );
      useRouteMock.mockImplementation(() => ({
        query: {
          tags: tag,
        },
      }));
      const wrapper = await factory();

      const total = wrapper.vm.total;

      expect(total).toEqual(1);
    });
  });

  describe("page", () => {
    it("defaults to 1 when no other value is in the URL", async () => {
      const wrapper = await factory();

      const page = wrapper.vm.page;

      expect(page).toBe(1);
    });

    it("uses the page value from the URL when present", async () => {
      useRouteMock.mockImplementation(() => ({
        query: {
          page: "3",
        },
      }));
      const wrapper = await factory();

      const page = wrapper.vm.page;

      expect(page).toBe(3);
    });
  });
  it("normalises blog content correctly", async () => {
    const wrapper = await factory();

    const firstEntry = wrapper.vm.contentEntries.value[0][0];

    expect(firstEntry.text).toBe("authored.createdDate");
    expect(firstEntry.primaryImageOfPage).toBe(null);
  });
  describe("when there is a default card thumbnail", () => {
    it("is used for when there is no primary image of page", async () => {
      const defaultCardThumbnail = {
        image: {
          url: "https://www.example.eu/img.jpg",
          contentType: "image/jpeg",
        },
      };
      const wrapper = await factory({ defaultCardThumbnail });

      const result = await wrapper.vm.fetchContent();
      const firstEntry = result[0][0];

      expect(firstEntry.primaryImageOfPage).toStrictEqual(defaultCardThumbnail);
    });
  });
  describe("isCtaBanner", () => {
    it("detects CTA banner strings correctly", async () => {
      const wrapper = await factory();

      expect(wrapper.vm.isCtaBanner("cta-banner-0")).toBe(true);
      expect(wrapper.vm.isCtaBanner("something-else")).toBe(false);
    });
  });

  it("inserts CTA banners in between content entries", async () => {
    const ctaBanners = [
      { name: "CTA Banner 1" },
      { name: "CTA Banner 2" },
      { name: "CTA Banner 3" },
    ];

    const wrapper = await factory({ ctaBanners });

    const result = await wrapper.vm.fetchContent();

    // Should return an array with 6 elements: [8 entries, 'cta-banner-0', 8 entries, 'cta-banner-1', 8 entries, 'cta-banner-2']
    expect(result.length).toBe(6);
    expect(result[0].length).toBe(8);
    expect(result[1]).toBe("cta-banner-0");
  });
});
